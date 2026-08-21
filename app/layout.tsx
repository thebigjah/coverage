import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://coverage-bice.vercel.app"),
  title: "Prayer Walk, see what your city has been prayed for",
  description:
    "GPS-tracked prayer walks with heat maps. Walk, pray, log your route, watch the map of your neighbourhood light up over time. Built by Elijah Purcell at Purcell Ventures LLC.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://coverage-bice.vercel.app",
    title: "Prayer Walk, see what your city has been prayed for",
    description: "GPS-tracked prayer walks with heat maps, for individuals and communities of intercessors.",
  },
};

// The same two identifiers every other Purcell Ventures property uses, so this app is
// understood as the same author's work rather than an unrelated site that happens to
// mention a name.
const LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Prayer Walk",
      "url": "https://coverage-bice.vercel.app",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Any, runs in a web browser",
      "description": "GPS-tracked prayer walks with heat maps. Walk a route, log it, and watch a map of the neighbourhood fill in over time.",
      "author": { "@id": "https://purcellventures.co/#founder" },
      "publisher": { "@id": "https://purcellventures.co/#organization" },
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    },
    {
      "@type": "Person",
      "@id": "https://purcellventures.co/#founder",
      "name": "Elijah Purcell",
      "url": "https://purcellventures.co/who",
      "jobTitle": "Founder, Purcell Ventures LLC",
      "sameAs": [
        "https://purcellventures.co/who",
        "https://github.com/thebigjah",
        "https://www.linkedin.com/in/theelijahpurcell",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://purcellventures.co/#organization",
      "name": "Purcell Ventures LLC",
      "url": "https://purcellventures.co",
      "founder": { "@id": "https://purcellventures.co/#founder" },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0604",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav
          style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "rgba(10,6,4,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              maxWidth: "1100px", margin: "0 auto",
              padding: "0 24px", height: 60,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "0.04em" }}>
                Prayer <span style={{ color: "var(--accent)" }}>Walk</span>
              </span>
            </Link>
            <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
              <Link href="/walk" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>
                Start a walk
              </Link>
              <Link href="/map" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>
                Map
              </Link>
              <Link href="/about" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>
                About
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <footer
          style={{
            padding: "32px 24px",
            borderTop: "1px solid var(--border)",
            color: "var(--text-light)",
            fontSize: 13,
            textAlign: "center",
            marginTop: 80,
          }}
        >
          Prayer Walk · web sandbox · the real app is mobile, in progress
        </footer>
      </body>
    </html>
  );
}
