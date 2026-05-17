export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "60px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 20 }}>
          About Coverage
        </p>
        <h1 className="serif" style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "var(--text)", marginBottom: 30, lineHeight: 1.1 }}>
          The map is not a leaderboard. It is a witness.
        </h1>

        <Section title="Why this exists">
          <p>
            For years, prayer walking has been one of the most overlooked practices in American evangelicalism. Millions of Christians believe their neighborhoods need prayer. Some do it. Most don&apos;t. Nobody knows who has. A pastor calling for &ldquo;covering our city in prayer&rdquo; has, in practice, no idea whether a single block has actually been walked. The work happens in private and dies in private.
          </p>
          <p>
            Coverage exists to make the work visible without making it a competition.
          </p>
        </Section>

        <Section title="Who it&apos;s for">
          <p>
            <strong style={{ color: "var(--text)" }}>Prayer ministry directors at mid-sized evangelical churches</strong> — the people who organize walks year after year and have no honest answer when asked &ldquo;did we actually cover the area?&rdquo;
          </p>
          <p>
            Also: any walker who wants a quiet record of where they&apos;ve prayed, with no leaderboard and no streak counter.
          </p>
        </Section>

        <Section title="What it&apos;s not">
          <p>Not Strava. Not a game. Not a metric for spiritual performance. Not a background tracker. Not a place to compare yourself to other walkers. Coverage records when you tell it to and stops when you tell it to.</p>
        </Section>

        <Section title="Privacy">
          <p>
            v0.1 saves all walks in your browser&apos;s local storage. Nothing leaves your device unless you decide to share a screenshot. Future versions will offer optional church-account sync, with route-level data stored at the street-segment level rather than the address level, and walks defaulting to anonymous on the public map.
          </p>
        </Section>

        <Section title="Pricing (future)">
          <p>
            Free forever for individuals. Free for churches with under 200 members or under 50 active walkers per month. $19/month for larger ministries.
          </p>
        </Section>

        <Section title="Founder">
          <p>
            Coverage is built by <a href="https://purcellventures.co" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Elijah Purcell</a> at Purcell Ventures. The first version was assembled in a single workshop block on May 17, 2026. If you&apos;re a prayer ministry director and want to talk through what would actually make it useful for your church, reach out: <a href="mailto:elijahpurcell@gmail.com" style={{ color: "var(--accent)" }}>elijahpurcell@gmail.com</a>.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 className="serif" style={{ fontSize: 22, color: "var(--text)", marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: title }} />
      <div style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}
