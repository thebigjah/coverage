"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 40, color: "var(--text-muted)", textAlign: "center" }}>
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  return <MapClient />;
}
