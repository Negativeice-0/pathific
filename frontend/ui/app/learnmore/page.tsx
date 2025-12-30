"use client";

import { useEffect, useState } from "react";

import Image from 'next/image';
import Link from 'next/link';

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
     <div className="flex justify-between items-center p-4">
  <Link href="/" className="inline-block">
    <Image src="/images/logo.svg" alt="Logo" width={48} height={48} style={{ height: "auto"}}priority />
  </Link>
  <h1 className="text-3xl font-bold">Learn More</h1>
</div>
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
