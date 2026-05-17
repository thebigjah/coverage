export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 20 }}>
          About Prayer Walk
        </p>
        <h1 className="serif" style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "var(--text)", marginBottom: 30, lineHeight: 1.1 }}>
          The map is not a leaderboard. It is a witness.
        </h1>

        <Section title="The idea">
          <p>
            GPS-tracked prayer walks with heat maps. Walk while you pray. The map remembers — block by block, week by week. You can see the streets your neighborhood has been prayed over, and the ones that haven&apos;t yet.
          </p>
          <p>
            Community features (sharing walks, walking together, comparing notes) are part of the long-term vision and arrive once the core single-walker experience is solid.
          </p>
        </Section>

        <Section title="What it is not">
          <p>Not Strava. Not a game. Not a streak counter. Not background tracking. Prayer Walk records when you tell it to and stops when you tell it to.</p>
        </Section>

        <Section title="Privacy">
          <p>
            This web sandbox saves all walks in your browser&apos;s local storage. Nothing leaves your device. The mobile app will offer the same local-first default with optional encrypted cloud sync.
          </p>
        </Section>

        <Section title="Where this is going">
          <p>
            The real Prayer Walk is a mobile app — that&apos;s where GPS, foreground tracking, and the walk-in-pocket experience belong. This web sandbox exists to test the core loop quickly. Mobile version is in active development.
          </p>
        </Section>

        <Section title="Who&apos;s building it">
          <p>
            Prayer Walk is built by <a href="https://purcellventures.co" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Elijah Purcell</a>. If the idea resonates and you want to talk through what would make it actually useful for you or your community, reach out: <a href="mailto:elijahpurcell@gmail.com" style={{ color: "var(--accent)" }}>elijahpurcell@gmail.com</a>.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 className="serif" style={{ fontSize: 22, color: "var(--text)", marginBottom: 14 }}>{title}</h2>
      <div style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}
