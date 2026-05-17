import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <section style={{ padding: "100px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <p
          style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--accent)", marginBottom: 24,
          }}
        >
          Walk. Pray. Watch the map light up.
        </p>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 700, lineHeight: 1.05,
            marginBottom: 28, color: "var(--text)",
            maxWidth: 900,
          }}
        >
          Prayer Walk.
        </h1>
        <p
          style={{
            fontSize: 20, lineHeight: 1.6, color: "var(--text-muted)",
            maxWidth: 720, marginBottom: 40,
          }}
        >
          GPS-tracked prayer walks with heat maps. Walk your neighborhood while you pray. The map remembers. Over time you can see, block by block, the streets that have been carried in prayer — and the ones that haven&apos;t yet.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link
            href="/walk"
            style={{
              padding: "16px 32px",
              background: "var(--accent)",
              color: "var(--bg)",
              fontSize: 15, fontWeight: 700, letterSpacing: "0.04em",
              borderRadius: 8, textDecoration: "none",
            }}
          >
            Start a walk →
          </Link>
          <Link
            href="/map"
            style={{
              padding: "16px 32px",
              background: "transparent",
              color: "var(--text)",
              fontSize: 15, fontWeight: 600,
              borderRadius: 8, textDecoration: "none",
              border: "1px solid var(--border-light)",
            }}
          >
            See the map
          </Link>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: "var(--text-light)" }}>
          This is the web sandbox. The native mobile app is in progress.
        </p>
      </section>

      <section
        style={{
          padding: "60px 24px", maxWidth: 1100, margin: "0 auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2 className="serif" style={{ fontSize: 32, fontWeight: 700, marginBottom: 40, color: "var(--text)" }}>
          How it works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {[
            { n: "01", h: "Walk", p: "Tap Start before you begin. Walk while you pray. Tap Stop when you finish. The route records as a GPS trace." },
            { n: "02", h: "Witness", p: "Your path saves with an optional one-line note about what you prayed for. Nothing leaves your device unless you choose to share." },
            { n: "03", h: "Watch", p: "The map of your city lights up over time. Recent walks glow bright. Older ones fade. Untouched streets stay dark." },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.14em", marginBottom: 14 }}>
                STEP {s.n}
              </p>
              <h3 className="serif" style={{ fontSize: 24, color: "var(--text)", marginBottom: 12 }}>{s.h}</h3>
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "60px 24px", maxWidth: 880, margin: "0 auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <blockquote
          style={{
            borderLeft: "3px solid var(--accent)",
            paddingLeft: 24,
            fontSize: 19, lineHeight: 1.7,
            color: "var(--text)",
            fontStyle: "italic",
          }}
        >
          I built this because the people I know who prayer walk do it alone, get tired, and stop. Not because their walking failed but because nothing visible came of it. The map is not a leaderboard. It is a witness — yes, you walked, yes, your neighborhood is being prayed for, by name, block by block.
        </blockquote>
        <p style={{ fontSize: 14, color: "var(--text-light)", marginTop: 14, paddingLeft: 27 }}>
          &mdash; Elijah Purcell
        </p>
      </section>

      <section style={{ padding: "80px 24px", maxWidth: 880, margin: "0 auto", textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 18, color: "var(--text)" }}>
          Walk your first block.
        </h2>
        <p style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32 }}>
          Free. Works in your browser. Walks save on your phone.
        </p>
        <Link
          href="/walk"
          style={{
            display: "inline-block",
            padding: "16px 40px",
            background: "var(--accent)",
            color: "var(--bg)",
            fontSize: 16, fontWeight: 700, letterSpacing: "0.04em",
            borderRadius: 8, textDecoration: "none",
          }}
        >
          Start a walk
        </Link>
      </section>
    </main>
  );
}
