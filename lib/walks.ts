export interface Walk {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  distanceMeters: number;
  points: Array<[number, number]>;
  note: string;
  visibility: "private" | "anonymous" | "named";
  walkerName?: string;
  title?: string;
}

const KEY = "coverage.walks.v1";

export function loadWalks(): Walk[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWalks(walks: Walk[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(walks));
}

export function appendWalk(walk: Walk): Walk[] {
  const all = loadWalks();
  all.unshift(walk);
  saveWalks(all);
  return all;
}

export function deleteWalk(id: string): Walk[] {
  const all = loadWalks().filter((w) => w.id !== id);
  saveWalks(all);
  return all;
}

const EARTH_R = 6371000;
export function haversine(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(s));
}

export function pathDistance(points: Array<[number, number]>): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i]);
  return total;
}

export function formatMeters(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1609.34).toFixed(2)} mi`;
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m}m ${r}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function formatWhen(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function newId(): string {
  return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function walkToGpx(walk: Walk): string {
  const startIso = new Date(walk.startedAt).toISOString();
  const name = walk.note?.trim() || `Prayer walk ${new Date(walk.startedAt).toLocaleDateString()}`;
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const trkpts = walk.points
    .map((p, i) => {
      const t = new Date(walk.startedAt + (i / Math.max(walk.points.length - 1, 1)) * walk.durationMs).toISOString();
      return `        <trkpt lat="${p[0].toFixed(7)}" lon="${p[1].toFixed(7)}"><time>${t}</time></trkpt>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Prayer Walk" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escape(name)}</name>
    <time>${startIso}</time>
  </metadata>
  <trk>
    <name>${escape(name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function lifetimeStats(walks: Walk[]) {
  if (walks.length === 0) return null;
  const totalDist = walks.reduce((s, w) => s + w.distanceMeters, 0);
  const totalDur = walks.reduce((s, w) => s + w.durationMs, 0);
  const longest = walks.reduce((a, b) => (b.distanceMeters > a.distanceMeters ? b : a));
  const dayKeys = new Set(walks.map((w) => new Date(w.endedAt).toDateString()));
  let streak = 0;
  const d = new Date();
  while (dayKeys.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return { totalDist, totalDur, longest, streak, distinctDays: dayKeys.size };
}
