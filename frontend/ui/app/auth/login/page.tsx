"use client";
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
        window.location.href = "/main/home";
      } else {
        setError(json.error || "Login failed");
      }
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-black/40 backdrop-blur-md shadow-lg border border-white/10 p-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={submit} className="flex flex-col gap-4">
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
          Login
        </button>
      </form>
    </div>
  );
}
