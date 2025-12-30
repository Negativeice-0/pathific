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
