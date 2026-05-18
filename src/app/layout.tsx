import type { Metadata } from "next";
import Link from "next/link";
import { Manjari } from "next/font/google";
import "./globals.css";

const manjari = Manjari({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-manjari",
});

export const metadata: Metadata = {
  title: "Rajseba Invoices - Professional Billing Panel",
  description: "Dynamic Multi-Template Full-Stack Invoice Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manjari.variable}>
      <body style={{ margin: 0, padding: 0, minHeight: "100vh", background: "var(--bg-app)", color: "var(--text-primary)" }}>
        {/* Modern App Glassy Navbar (Hidden on Print) */}
<nav className="app-navbar no-print" style={{ position: 'sticky', top: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-card)', padding: '12px 24px', zIndex: 1000 }}>
          <div className="navbar-content">
            <Link href="/" className="navbar-logo">
              Rajseba<span>Invoices</span>
            </Link>
            <div className="navbar-links">
              <Link href="/">Dashboard</Link>
              <Link href="/customers">Customers</Link>
              <Link href="/services">Services</Link>
              <Link href="/trash">Trash</Link>
            </div>
            <Link href="/create" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem", textDecoration: "none" }}>
              + Create Invoice
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
