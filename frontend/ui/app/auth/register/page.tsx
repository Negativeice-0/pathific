"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    level: "",
    role: "user"
  });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.ok) {
        localStorage.setItem("pathific_token", json.token);
        window.location.href = "/home";
      } else {
        setError(json.error || "Registration failed");
      }
    } catch {
      setError("Network error");
    }
  }

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  return (
    <main style={mainStyle}>
      <nav style={navStyle}>
         <Link href="/" className="inline-block">
            <Image src="/images/logo.svg" alt="Logo" width={48} height={48} style={{ height: "auto"}}priority />
          </Link>
        <Link href="/learnmore" style={linkStyle}>Learn More</Link>
      </nav>

      <h1>Register</h1>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      <form style={formStyle} onSubmit={submit}>
        <input value={form.id} onChange={e => setField("id", e.target.value)} type="text" placeholder="ID" style={inputStyle} />
        <input value={form.name} onChange={e => setField("name", e.target.value)} type="text" placeholder="Name" style={inputStyle} />
        <input value={form.email} onChange={e => setField("email", e.target.value)} type="email" placeholder="Email" style={inputStyle} />
        <input value={form.password} onChange={e => setField("password", e.target.value)} type="password" placeholder="Password" style={inputStyle} />
        <input value={form.confirmPassword} onChange={e => setField("confirmPassword", e.target.value)} type="password" placeholder="Confirm Password" style={inputStyle} />
        <input value={form.city} onChange={e => setField("city", e.target.value)} type="text" placeholder="City" style={inputStyle} />
        <input value={form.level} onChange={e => setField("level", e.target.value)} type="text" placeholder="Level" style={inputStyle} />
        <input value={form.role} onChange={e => setField("role", e.target.value)} type="text" placeholder="Role (user/admin)" style={inputStyle} />
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
