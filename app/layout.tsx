import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coverage — A prayer map for your city",
  description:
    "A web tool that shows your church which streets have been prayed for, which haven't, and who is walking where — so the work of intercession can be coordinated instead of accidental.",
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
                Cover<span style={{ color: "var(--accent)" }}>age</span>
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
          Coverage · a Purcell Ventures product · Free for churches under 200 members
        </footer>
      </body>
    </html>
  );
}
