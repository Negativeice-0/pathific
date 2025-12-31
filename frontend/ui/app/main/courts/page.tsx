"use client";

import { useEffect, useState } from "react";

/** Court type mirrors backend entity fields */
interface Court {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

/**
 * CourtsPage:
 * - Fetches /api/courts
 * - Displays glassmorphic cards
 * - Ready for weekly winner + badges stubs
 */
export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courts")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load courts");
        return res.json();
      })
      .then(setCourts)
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Curator Courts</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map(court => (
          <div
            key={court.id}
            className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold">{court.name}</h2>
            <p className="text-white/70 mt-2">{court.description}</p>
            <p className="text-xs text-white/50 mt-4">
              Created {new Date(court.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
