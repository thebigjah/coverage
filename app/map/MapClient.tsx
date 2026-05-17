"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import {
  deleteWalk, downloadFile, formatDuration, formatMeters, formatWhen,
  lifetimeStats, loadWalks, saveWalks, walkToGpx, type Walk,
} from "@/lib/walks";

export default function MapClient() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setWalks(loadWalks());
  }, []);

  const lifetime = useMemo(() => lifetimeStats(walks), [walks]);

  const center = useMemo<[number, number]>(() => {
    const allPts = walks.flatMap((w) => w.points);
    if (allPts.length === 0) return [33.8362, -84.6770]; // Acworth fallback
    const lat = allPts.reduce((a, p) => a + p[0], 0) / allPts.length;
    const lng = allPts.reduce((a, p) => a + p[1], 0) / allPts.length;
    return [lat, lng];
  }, [walks]);

  function rmWalk(id: string) {
    setWalks(deleteWalk(id));
    if (selected === id) setSelected(null);
  }

  function exportGpx(walk: Walk) {
    downloadFile(walkToGpx(walk), `prayer-walk-${walk.id}.gpx`, "application/gpx+xml");
  }

  function backupAll() {
    if (walks.length === 0) return;
    downloadFile(
      JSON.stringify({ exportedAt: Date.now(), walks }, null, 2),
      `prayer-walks-backup-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json",
    );
  }

  function restoreFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incoming: Walk[] = Array.isArray(parsed) ? parsed : parsed.walks;
        if (!Array.isArray(incoming)) throw new Error("File doesn't contain a walks array");
        const existingIds = new Set(walks.map((w) => w.id));
        const merged = [...walks, ...incoming.filter((w) => !existingIds.has(w.id))];
        merged.sort((a, b) => b.endedAt - a.endedAt);
        saveWalks(merged);
        setWalks(merged);
        alert(`Imported ${incoming.length} walks (${merged.length - walks.length} new).`);
      } catch (e) {
        alert("Couldn't import: " + String(e));
      }
    };
    reader.readAsText(file);
  }

  // Heat-style intensity by recency: newer walks = brighter
  const now = Date.now();
  function intensity(w: Walk): number {
    const days = (now - w.endedAt) / 86400000;
    if (days < 7) return 1;
    if (days < 30) return 0.65;
    if (days < 90) return 0.4;
    return 0.25;
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", flex: 1, minHeight: "55vh" }}>
        <MapContainer
          center={center}
          zoom={walks.length ? 14 : 12}
          style={{ height: "100%", width: "100%", minHeight: "55vh" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {walks
            .filter((w) => w.points.length > 1)
            .map((w) => {
              const a = intensity(w);
              const isSel = selected === w.id;
              return (
                <Polyline
                  key={w.id}
                  positions={w.points}
                  pathOptions={{
                    color: isSel ? "#e8b968" : "#c2a173",
                    weight: isSel ? 7 : 5,
                    opacity: isSel ? 1 : a,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                  eventHandlers={{ click: () => setSelected(w.id) }}
                />
              );
            })}
        </MapContainer>

        {walks.length === 0 && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(10,6,4,0.92)",
                border: "1px solid var(--border-light)",
                padding: "24px 32px", borderRadius: 12,
                textAlign: "center", maxWidth: 360,
                pointerEvents: "auto",
              }}
            >
              <p className="serif" style={{ fontSize: 20, color: "var(--text)", marginBottom: 10 }}>
                The map is black.
              </p>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 18 }}>
                No walks recorded yet. Walk one block and the first line lights up.
              </p>
              <a
                href="/walk"
                style={{
                  display: "inline-block",
                  padding: "12px 22px",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  borderRadius: 8, textDecoration: "none",
                  fontWeight: 700, fontSize: 14,
                }}
              >
                Start a walk →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* WALK LIST */}
      <div style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <h2 className="serif" style={{ fontSize: 22, color: "var(--text)" }}>Your walks</h2>
            <p style={{ fontSize: 13, color: "var(--text-light)" }}>
              {walks.length} {walks.length === 1 ? "walk" : "walks"} · saved locally on this device
            </p>
          </div>

          {lifetime && (
            <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12, marginBottom: 18,
                padding: "16px 18px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: "var(--text-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Total</div>
                <div style={{ fontSize: 18, color: "var(--text)", fontWeight: 700 }}>{formatMeters(lifetime.totalDist)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Walks</div>
                <div style={{ fontSize: 18, color: "var(--text)", fontWeight: 700 }}>{walks.length}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Streak</div>
                <div style={{ fontSize: 18, color: lifetime.streak > 0 ? "var(--accent-bright)" : "var(--text)", fontWeight: 700 }}>
                  {lifetime.streak} {lifetime.streak === 1 ? "day" : "days"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>PR</div>
                <div style={{ fontSize: 18, color: "var(--accent)", fontWeight: 700 }}>{formatMeters(lifetime.longest.distanceMeters)}</div>
              </div>
            </div>

            {/* 365-day walk heatmap */}
            <div
              style={{
                marginBottom: 18, padding: "14px 18px",
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 10, color: "var(--text-light)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                365-day walking history
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(53, 1fr)", gap: 2 }}>
                {(() => {
                  const byDay: Record<string, number> = {};
                  walks.forEach((w) => {
                    const key = new Date(w.endedAt).toISOString().slice(0, 10);
                    byDay[key] = (byDay[key] || 0) + w.distanceMeters;
                  });
                  const allVals = Object.values(byDay);
                  const max = allVals.length ? Math.max(...allVals) : 1;
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const cells = [];
                  for (let i = 364; i >= 0; i--) {
                    const d = new Date(today); d.setDate(d.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    const v = byDay[key];
                    let bg = "var(--bg-2)";
                    if (v != null) {
                      const r = v / max;
                      const op = 0.25 + r * 0.75;
                      bg = `rgba(232, 185, 104, ${op.toFixed(2)})`;
                    }
                    cells.push(
                      <div
                        key={key}
                        title={v != null ? `${key}: ${formatMeters(v)}` : `${key}: no walk`}
                        style={{ aspectRatio: "1", borderRadius: 2, background: bg }}
                      />,
                    );
                  }
                  return cells;
                })()}
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 6, fontSize: 11, color: "var(--text-light)" }}>
                <span>less</span>
                {[0.2, 0.4, 0.6, 0.8, 1].map((op) => (
                  <div key={op} style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(232, 185, 104, ${op})` }} />
                ))}
                <span>more</span>
              </div>
            </div>
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {walks.length > 0 && (
              <button
                onClick={backupAll}
                style={{ padding: "8px 14px", background: "transparent", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                Backup all (JSON)
              </button>
            )}
            <label
              style={{ padding: "8px 14px", background: "transparent", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              Restore from file
              <input
                type="file" accept=".json,application/json"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) restoreFromFile(f); e.currentTarget.value = ""; }}
              />
            </label>
          </div>

          {walks.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--text-light)" }}>
              When you record walks they appear here. Tap a walk to highlight it on the map.
            </p>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            {walks.map((w) => {
              const isSel = selected === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelected(isSel ? null : w.id)}
                  style={{
                    background: isSel ? "rgba(194,161,115,0.08)" : "var(--card)",
                    border: `1px solid ${isSel ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "background 120ms, border 120ms",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>
                        {formatMeters(w.distanceMeters)} · {formatDuration(w.durationMs)}
                      </span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--bg-2)", border: "1px solid var(--border-light)", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {w.visibility}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {formatWhen(w.endedAt)}{w.walkerName ? ` · ${w.walkerName}` : ""}
                    </div>
                    {w.note && (
                      <div style={{ fontSize: 13, color: "var(--text)", marginTop: 6, fontStyle: "italic" }}>
                        &ldquo;{w.note}&rdquo;
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignSelf: "start" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); exportGpx(w); }}
                      style={{
                        background: "transparent", border: "1px solid var(--border-light)",
                        color: "var(--accent)", borderRadius: 6, padding: "6px 10px",
                        fontSize: 12, cursor: "pointer",
                      }}
                    >
                      GPX
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm("Delete this walk?")) rmWalk(w.id); }}
                      style={{
                        background: "transparent", border: "1px solid var(--border-light)",
                        color: "var(--text-light)", borderRadius: 6, padding: "6px 10px",
                        fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
