"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
