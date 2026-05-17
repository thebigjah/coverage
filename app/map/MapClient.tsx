"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { deleteWalk, formatDuration, formatMeters, formatWhen, loadWalks, type Walk } from "@/lib/walks";

export default function MapClient() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setWalks(loadWalks());
  }, []);

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
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 className="serif" style={{ fontSize: 22, color: "var(--text)" }}>Your walks</h2>
            <p style={{ fontSize: 13, color: "var(--text-light)" }}>
              {walks.length} {walks.length === 1 ? "walk" : "walks"} · saved locally on this device
            </p>
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
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm("Delete this walk?")) rmWalk(w.id); }}
                    style={{
                      background: "transparent", border: "1px solid var(--border-light)",
                      color: "var(--text-light)", borderRadius: 6, padding: "6px 10px",
                      fontSize: 12, cursor: "pointer", alignSelf: "start",
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
