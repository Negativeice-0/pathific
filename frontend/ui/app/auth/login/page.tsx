"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.ok) {
        localStorage.setItem("pathific_token", json.token);
        window.location.href = "/home";
      } else {
        setError(json.error || "Login failed");
      }
    } catch {
      setError("Network error");
    }
  }

  return (
    <main style={mainStyle}>
      <nav style={navStyle}>
        <Link href="/" className="inline-block">
            <Image src="/images/logo.svg" alt="Logo" width={48} height={48} style={{ height: "auto"}}priority />
          </Link>
        <Link href="/learnmore" style={linkStyle}>Learn More</Link>
      </nav>

      <h1>Login</h1>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      <form style={formStyle} onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" style={inputStyle} />
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
