"use client";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });
      const json = await res.json();
      if (json.ok) {
        localStorage.setItem("pathific_token", json.token);
        window.location.href = "/auth/login";
      } else {
        setError(json.error || "Registration failed");
      }
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-black/40 backdrop-blur-md shadow-lg border border-white/10 p-8">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          type="text"
          placeholder="Name"
          className="p-2 rounded border border-sky-500 bg-black/30"
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="p-2 rounded border border-sky-500 bg-black/30"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="p-2 rounded border border-sky-500 bg-black/30"
        />
        <button type="submit" className="bg-sky-500 text-white rounded p-2">
          Register
        </button>
      </form>
    </div>
  );
}
