"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { appendWalk, formatDuration, formatMeters, loadWalks, newId, pathDistance, type Walk } from "@/lib/walks";

const SCRIPTURE_ROTATION = [
  { text: "Pray without ceasing.", ref: "1 Thessalonians 5:17" },
  { text: "Seek the welfare of the city where I have sent you... pray to the LORD on its behalf.", ref: "Jeremiah 29:7" },
  { text: "If my people, who are called by my name, will humble themselves and pray... I will hear from heaven and heal their land.", ref: "2 Chronicles 7:14" },
  { text: "The earnest prayer of a righteous person has great power and produces wonderful results.", ref: "James 5:16" },
  { text: "And when ye stand praying, forgive.", ref: "Mark 11:25" },
  { text: "Watch ye and pray.", ref: "Mark 14:38" },
  { text: "I have set the LORD always before me.", ref: "Psalm 16:8" },
];

function dailyVerse() {
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return SCRIPTURE_ROTATION[doy % SCRIPTURE_ROTATION.length];
}

// Replace Leaflet's default marker icons (which break under bundlers)
const walkerIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#e8b968;border:3px solid #0a0604;box-shadow:0 0 0 2px #c2a173,0 0 16px rgba(232,185,104,0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function Recenter({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, Math.max(map.getZoom(), 16), { animate: true });
  }, [pos, map]);
  return null;
}

type Status = "idle" | "permission" | "recording" | "paused" | "saving" | "saved";

export default function WalkClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [path, setPath] = useState<Array<[number, number]>>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"private" | "anonymous" | "named">("anonymous");
  const [walkerName, setWalkerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Live position watcher (always on so map can show current location, even before recording)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("This browser doesn't support geolocation.");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const coord: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos(coord);
        setAccuracy(p.coords.accuracy);
        setError(null);
        if (status === "recording") {
          setPath((prev) => {
            if (prev.length === 0) return [coord];
            const last = prev[prev.length - 1];
            const moved = Math.hypot(coord[0] - last[0], coord[1] - last[1]) * 111000;
            return moved > 3 ? [...prev, coord] : prev;
          });
        }
      },
      (e) => setError(geoError(e)),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [status]);

  // Timer tick while recording
  useEffect(() => {
    if (status !== "recording") return;
    const i = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(i);
  }, [status]);

  function start() {
    if (!pos) {
      setStatus("permission");
      return;
    }
    setPath([pos]);
    setStartedAt(Date.now());
    setStatus("recording");
  }

  function stop() {
    if (!startedAt) return;
    const ended = Date.now();
    const walk: Walk = {
      id: newId(),
      startedAt,
      endedAt: ended,
      durationMs: ended - startedAt,
      distanceMeters: pathDistance(path),
      points: path,
      note: note.trim(),
      visibility,
      walkerName: visibility === "named" ? walkerName.trim() || undefined : undefined,
    };
    appendWalk(walk);
    setSavedId(walk.id);
    setStatus("saved");
  }

  function reset() {
    setStatus("idle");
    setPath([]);
    setStartedAt(null);
    setTick(0);
    setNote("");
    setSavedId(null);
  }

  function runDemoWalk() {
    const base: [number, number] = pos ?? [33.8362, -84.677];
    const demoPoints: Array<[number, number]> = Array.from({ length: 60 }, (_, i) => [
      base[0] + Math.sin(i / 7) * 0.0008 + i * 0.00004,
      base[1] + Math.cos(i / 7) * 0.0008 + i * 0.00006,
    ]);
    const startTs = Date.now();
    setStartedAt(startTs);
    setPath([demoPoints[0]]);
    setStatus("recording");
    let i = 1;
    const interval = window.setInterval(() => {
      if (i >= demoPoints.length) {
        window.clearInterval(interval);
        const ended = Date.now();
        const walk: Walk = {
          id: newId(),
          startedAt: startTs,
          endedAt: ended,
          durationMs: ended - startTs,
          distanceMeters: pathDistance(demoPoints),
          points: demoPoints,
          note: "Demo walk",
          visibility,
        };
        appendWalk(walk);
        setSavedId(walk.id);
        setNote("Demo walk");
        setStatus("saved");
        return;
      }
      setPath((prev) => [...prev, demoPoints[i]]);
      i++;
    }, 400);
  }

  const dist = pathDistance(path);
  const elapsed = startedAt ? Date.now() - startedAt : 0;
  void tick;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* MAP */}
      <div style={{ position: "relative", flex: 1, minHeight: "60vh" }}>
        <MapContainer
          center={pos ?? [33.8362, -84.6770]}
          zoom={pos ? 17 : 13}
          style={{ height: "100%", width: "100%", minHeight: "60vh" }}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {path.length > 1 && (
            <Polyline
              positions={path}
              pathOptions={{ color: "#e8b968", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }}
            />
          )}
          {pos && <Marker position={pos} icon={walkerIcon} />}
          <Recenter pos={pos} />
        </MapContainer>

        {/* Live stats overlay */}
        {status === "recording" && (
          <div
            style={{
              position: "absolute", top: 16, left: 16,
              background: "rgba(10,6,4,0.9)",
              border: "1px solid var(--border-light)",
              borderRadius: 10, padding: "10px 14px",
              backdropFilter: "blur(8px)",
              display: "flex", gap: 18, alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--intrusion)", animation: "pulse 1.5s infinite" }} />
            <div>
              <div style={{ fontSize: 11, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Time</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{formatDuration(elapsed)}</div>
            </div>
            <div style={{ height: 28, width: 1, background: "var(--border-light)" }} />
            <div>
              <div style={{ fontSize: 11, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Distance</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{formatMeters(dist)}</div>
            </div>
            {accuracy && (
              <>
                <div style={{ height: 28, width: 1, background: "var(--border-light)" }} />
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.12em" }}>GPS</div>
                  <div style={{ fontSize: 14, color: accuracy < 20 ? "#9bd187" : "#e8b968" }}>±{Math.round(accuracy)}m</div>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(229,74,40,0.15)",
              border: "1px solid var(--intrusion)",
              color: "#ffb8a4",
              borderRadius: 10, padding: "10px 14px",
              fontSize: 13, maxWidth: 280,
              zIndex: 1000,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* CONTROL PANEL */}
      <div
        style={{
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border)",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {status === "idle" && (
            <>
              <h2 className="serif" style={{ fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
                Ready when you are.
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.6 }}>
                Tap Start before you begin walking. Prayer Walk will record your route while you pray and stop only when you tap Stop. No background tracking.
              </p>
              {loadWalks().length === 0 && (() => {
                const v = dailyVerse();
                return (
                  <div style={{ marginBottom: 16, padding: 14, borderLeft: "3px solid var(--accent)", background: "rgba(194,161,115,0.06)", borderRadius: 6 }}>
                    <p style={{ fontSize: 14, color: "var(--text)", fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>&ldquo;{v.text}&rdquo;</p>
                    <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 6, marginBottom: 0 }}>&mdash; {v.ref}</p>
                  </div>
                );
              })()}
              <BigButton onClick={start} disabled={!pos && !error}>
                {pos ? "Start walking" : "Waiting for GPS…"}
              </BigButton>
              {!pos && !error && (
                <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 10, textAlign: "center" }}>
                  Your browser will ask permission for location. You need to say yes.
                </p>
              )}
              <button
                onClick={runDemoWalk}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px",
                  background: "transparent",
                  color: "var(--accent)",
                  border: "1px dashed var(--border-light)",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Or try a demo walk →
              </button>
            </>
          )}

          {status === "permission" && (
            <>
              <h2 className="serif" style={{ fontSize: 22, color: "var(--text)", marginBottom: 12 }}>
                Need your location first.
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.6 }}>
                Allow Coverage to use your location, then tap Start again.
              </p>
              <BigButton onClick={() => setStatus("idle")} variant="ghost">
                OK
              </BigButton>
            </>
          )}

          {status === "recording" && (
            <>
              <div style={{ display: "flex", gap: 12 }}>
                <BigButton onClick={stop} variant="stop">
                  Stop &amp; save walk
                </BigButton>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 12, textAlign: "center" }}>
                Keep this tab open while you walk. Background tabs may pause GPS.
              </p>
            </>
          )}

          {status === "saved" && savedId && (
            <>
              <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                Walk saved
              </p>
              <h2 className="serif" style={{ fontSize: 26, color: "var(--text)", marginBottom: 16 }}>
                {formatMeters(dist)} · {formatDuration(elapsed)}
              </h2>

              <label style={labelStyle}>Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  const walks = JSON.parse(localStorage.getItem("coverage.walks.v1") ?? "[]");
                  if (walks[0]?.id === savedId) {
                    walks[0].title = e.target.value;
                    localStorage.setItem("coverage.walks.v1", JSON.stringify(walks));
                  }
                }}
                placeholder='e.g. "Sunday morning loop"'
                style={inputStyle}
              />

              <label style={labelStyle}>One-line prayer note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  // re-save the latest walk with updated note
                  const walks = JSON.parse(localStorage.getItem("coverage.walks.v1") ?? "[]");
                  if (walks[0]?.id === savedId) {
                    walks[0].note = e.target.value;
                    localStorage.setItem("coverage.walks.v1", JSON.stringify(walks));
                  }
                }}
                placeholder='e.g. "Prayed for families on Oakland Dr."'
                style={inputStyle}
              />

              <label style={labelStyle}>Visibility</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {(["private", "anonymous", "named"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setVisibility(v);
                      const walks = JSON.parse(localStorage.getItem("coverage.walks.v1") ?? "[]");
                      if (walks[0]?.id === savedId) {
                        walks[0].visibility = v;
                        localStorage.setItem("coverage.walks.v1", JSON.stringify(walks));
                      }
                    }}
                    style={{
                      padding: "8px 14px",
                      background: visibility === v ? "var(--accent)" : "transparent",
                      color: visibility === v ? "var(--bg)" : "var(--text-muted)",
                      border: `1px solid ${visibility === v ? "var(--accent)" : "var(--border-light)"}`,
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {visibility === "named" && (
                <>
                  <label style={labelStyle}>Your name (as it shows on the church map)</label>
                  <input
                    type="text"
                    value={walkerName}
                    onChange={(e) => {
                      setWalkerName(e.target.value);
                      const walks = JSON.parse(localStorage.getItem("coverage.walks.v1") ?? "[]");
                      if (walks[0]?.id === savedId) {
                        walks[0].walkerName = e.target.value || undefined;
                        localStorage.setItem("coverage.walks.v1", JSON.stringify(walks));
                      }
                    }}
                    placeholder="First name + last initial"
                    style={inputStyle}
                  />
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <BigButton onClick={reset} variant="ghost">Record another</BigButton>
                <a
                  href="/map"
                  style={{
                    flex: 1, textAlign: "center",
                    padding: "16px",
                    background: "var(--accent)",
                    color: "var(--bg)",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: "0.04em",
                  }}
                >
                  See on the map →
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </main>
  );
}

function BigButton({
  children, onClick, disabled, variant = "primary",
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "primary" | "stop" | "ghost" }) {
  const base: React.CSSProperties = {
    flex: 1, padding: "18px", borderRadius: 10,
    fontSize: 16, fontWeight: 700, letterSpacing: "0.04em",
    border: "none", cursor: disabled ? "not-allowed" : "pointer",
    transition: "transform 80ms ease, background 120ms ease, box-shadow 120ms ease",
    opacity: disabled ? 0.5 : 1,
    width: "100%",
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: "var(--accent)", color: "var(--bg)", boxShadow: "0 4px 14px rgba(194,161,115,0.25)" },
    stop:    { ...base, background: "var(--intrusion)", color: "#fff", boxShadow: "0 4px 14px rgba(229,74,40,0.35)" },
    ghost:   { ...base, background: "transparent", color: "var(--text)", border: "1px solid var(--border-light)" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={styles[variant]}
      onMouseDown={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px) scale(0.99)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)"; }}
    >
      {children}
    </button>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11, fontWeight: 700, color: "var(--text-light)",
  textTransform: "uppercase", letterSpacing: "0.12em",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  background: "var(--card)",
  border: "1px solid var(--border-light)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 15,
  fontFamily: "inherit",
  marginBottom: 16,
  outline: "none",
};

function geoError(e: GeolocationPositionError): string {
  switch (e.code) {
    case 1: return "Location permission denied. Enable it in your browser settings and reload.";
    case 2: return "Couldn't get GPS fix. Move outdoors and try again.";
    case 3: return "GPS timed out. Check your connection and try again.";
    default: return e.message;
  }
}
