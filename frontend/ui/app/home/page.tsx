"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("pathific_token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.ok) setMe(json);
        else setError(json.error || "Unauthorized");
      } catch {
        setError("Network error");
      }
    })();
  }, []);

  if (error) return <main style={mainStyle}><p>{error}</p></main>;
  if (!me) return <main style={mainStyle}><p>Loading...</p></main>;

  return (
    <main style={mainStyle}>
      <h1>Welcome, {me.name}</h1>
      <p>Role: {me.role}</p>
      <p>Email: {me.email}</p>
    </main>
  );
}

const mainStyle = { padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" };
