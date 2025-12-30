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
