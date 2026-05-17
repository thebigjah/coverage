"use client";

import dynamic from "next/dynamic";

const WalkClient = dynamic(() => import("./WalkClient"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 40, color: "var(--text-muted)", textAlign: "center" }}>
      Loading map…
    </div>
  ),
});

export default function WalkPage() {
  return <WalkClient />;
}
