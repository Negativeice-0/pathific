package.json
json
{
  "name": "pathific-ui",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "framer-motion": "^10.18.0",
    "next": "14.2.6",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typewriter-effect": "^2.20.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.17",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.6.3"
  }
}
Optional: remove framer-motion and typewriter-effect if you want zero deps. Otherwise, run:

npm install

npm run dev

next.config.js (proxy rewrites for backend)
js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*"
      }
    ];
  }
};
export default nextConfig;
This lets frontend call /api/* without CORS headaches.

public/images/logo.svg
svg
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="#2563eb" stroke-width="2"/>
  <path d="M6 14c3-6 9-6 12 0" stroke="#2563eb" stroke-width="2" fill="none"/>
</svg>
public/icons/logout.svg
svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  <path d="M16 17l5-5-5-5M21 12H9"/>
  <path d="M13 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8"/>
</svg>
src/components/IconLogout.tsx
tsx
"use client";
import Image from "next/image";

type Props = { className?: string; alt?: string };

export default function IconLogout({ className, alt = "Logout" }: Props) {
  return (
    <Image
      src="/icons/logout.svg"
      alt={alt}
      width={24}
      height={24}
      className={className}
      priority
    />
  );
}
src/components/Navbar.tsx
tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import IconLogout from "../components/IconLogout";

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("pathific_token");
    window.location.href = "/auth/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/logo.svg" alt="Pathific logo" width={32} height={32} priority />
          <span className="text-xl font-semibold text-blue-600">Pathific</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/auth/register" className="text-gray-700 hover:text-blue-600">Register</Link>
          <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">Login</Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
            aria-label="Logout"
            title="Logout"
          >
            <IconLogout />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
If you want no navbar on Welcome, don’t import this in RootLayout; use it only in auth and other pages.

src/app/layout.tsx
tsx
import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Pathific",
  description: "Structured learning for a social-first world."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* No global navbar here to keep Welcome minimal */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
Keep navbar out of global for Welcome minimalism, add local nav to auth pages.

src/app/page.tsx (Welcome)
tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Minimal, emotionally resonant Welcome page
 * - Typewriter headline
 * - Subtle gradient background
 * - Logo top-left (inline)
 * - Learn More top-right
 * - Register/Login CTAs
 */
export default function Welcome() {
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const fullText = "Pathific — Building Hope Through Clarity";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setHeadline(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 90);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={container}>
      {/* Logo top-left */}
      <div style={logo}>🌌 Pathific</div>

      {/* Learn More top-right */}
      <button style={learnMore} onClick={() => router.push("/learnmore")}>
        Learn More
      </button>

      {/* Headline */}
      <h1 style={title}>{headline}</h1>

      {/* CTAs */}
      <div style={ctaRow}>
        <button onClick={() => router.push("/auth/register")} style={ctaBtnPrimary}>Register</button>
        <button onClick={() => router.push("/auth/login")} style={ctaBtnSecondary}>Login</button>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  background: "linear-gradient(135deg, #000000, #1a1f2e, #0b0f19)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  position: "relative",
  color: "#f5f5f5"
};
const logo: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  left: "1rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  color: "#3b82f6"
};
const learnMore: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  padding: "0.5rem 0.8rem",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "#f5f5f5",
  cursor: "pointer"
};
const title: React.CSSProperties = { fontSize: "2.6rem", textAlign: "center", marginBottom: "2rem" };
const ctaRow: React.CSSProperties = { display: "flex", gap: "1rem" };
const ctaBtnPrimary: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "0.6rem 1.2rem",
  borderRadius: 10,
  color: "#f5f5f5",
  cursor: "pointer"
};
const ctaBtnSecondary: React.CSSProperties = {
  background: "#2563eb",
  padding: "0.6rem 1.2rem",
  borderRadius: 10,
  color: "#fff",
  border: "none",
  cursor: "pointer"
};
src/app/auth/register/page.tsx
tsx
"use client";
import Link from "next/link";

export default function Register() {
  return (
    <main style={mainStyle}>
      <nav style={navStyle}>
        <span style={logoStyle}>🌌 Pathific</span>
        <Link href="/learnmore" style={linkStyle}>Learn More</Link>
      </nav>

      <h1>Register</h1>
      <form style={formStyle} onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="ID" style={inputStyle} />
        <input type="text" placeholder="Name" style={inputStyle} />
        <input type="email" placeholder="Email" style={inputStyle} />
        <input type="password" placeholder="Password" style={inputStyle} />
        <input type="password" placeholder="Confirm Password" style={inputStyle} />
        <input type="text" placeholder="City" style={inputStyle} />
        <input type="text" placeholder="Level" style={inputStyle} />
        <input type="text" placeholder="Role" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
    </main>
  );
}

const mainStyle = { padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" };
const navStyle = { display: "flex", justifyContent: "space-between", marginBottom: "2rem" };
const logoStyle = { fontWeight: "bold", color: "#3b82f6" };
const linkStyle = { color: "#f5f5f5", textDecoration: "none" };
const formStyle = { display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "420px", margin: "auto" };
const inputStyle = { padding: "0.6rem", borderRadius: "6px", border: "1px solid #3b82f6" };
const buttonStyle = { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem" };
src/app/auth/login/page.tsx
tsx
"use client";
import Link from "next/link";

export default function Login() {
  return (
    <main style={mainStyle}>
      <nav style={navStyle}>
        <span style={logoStyle}>🌌 Pathific</span>
        <Link href="/learnmore" style={linkStyle}>Learn More</Link>
      </nav>

      <h1>Login</h1>
      <form style={formStyle} onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Username" style={inputStyle} />
        <input type="password" placeholder="Password" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </main>
  );
}

const mainStyle = { padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" };
const navStyle = { display: "flex", justifyContent: "space-between", marginBottom: "2rem" };
const logoStyle = { fontWeight: "bold", color: "#3b82f6" };
const linkStyle = { color: "#f5f5f5", textDecoration: "none" };
const formStyle = { display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px", margin: "auto" };
const inputStyle = { padding: "0.6rem", borderRadius: "6px", border: "1px solid #3b82f6" };
const buttonStyle = { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem" };
src/app/learnmore/page.tsx (dynamic)
tsx
"use client";

import { useEffect, useState } from "react";

type LearnItem = {
  title: string;
  description?: string;
  link?: string;
  mediaType?: string; // "text" | "video" | "image"
  mediaUrl?: string;
};

export default function LearnMore() {
  const [items, setItems] = useState<LearnItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/learnmore"); // proxied to backend
        const json = await res.json();
        setItems(json.items ?? []);
      } catch (e) {
        setError("Could not fetch data");
      }
    }
    fetchData();
  }, []);

  return (
    <main style={{ padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" }}>
      <h1 className="text-3xl font-bold mb-4">Learn More</h1>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            {item.description && <p className="mt-2 text-gray-300">{item.description}</p>}
            {item.link && (
              <a href={item.link} className="text-blue-400 hover:underline mt-2 block">
                Visit resource
              </a>
            )}
            {item.mediaType === "video" && item.mediaUrl && (
              <video src={item.mediaUrl} controls className="mt-3 w-full rounded" />
            )}
            {item.mediaType === "image" && item.mediaUrl && (
              <img src={item.mediaUrl} alt={item.title} className="mt-3 w-full rounded" />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}