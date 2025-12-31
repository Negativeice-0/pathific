"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Court {
  id: number;
  category: string;
  slug: string;
  summary: string;
  name: string;
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/courts");
        if (!res.ok) throw new Error(`Failed to load courts (${res.status})`);
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setCourts(data.items);
        } else {
          setCourts([]);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Network error";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-10">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Curator Courts
        </h1>
        <p className="mt-3 text-white/70">
          Where taste meets rigor—curate, learn, and lead with trust.
        </p>
      </section>

      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {error && (
            <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {loading && <p className="text-white/70">Loading courts...</p>}

          {!loading && !error && courts.length === 0 && (
            <p className="text-white/70">No courts yet. Add your first one!</p>
          )}

          {!loading && !error && courts.length > 0 &&
            courts.map((court) => (
              <div
                key={court.id}
                className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-linear-to-br from-pink-500/10 to-transparent blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-linear-to-br from-sky-500/10 to-transparent blur-3xl" />
                </div>

                <h2 className="text-xl font-semibold">{court.name}</h2>
                <p className="text-white/70 mt-2">{court.summary}</p>
                <p className="text-xs text-white/50 mt-4">{court.category}</p>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href={`/courts/${court.slug}`}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10"
                  >
                    View court
                  </Link>
                  <Link
                    href={`/curate?court=${court.id}`}
                    className="rounded-lg bg-linear-to-r from-sky-500 to-indigo-500 px-3 py-1 text-white font-semibold shadow hover:opacity-90"
                  >
                    Curate here
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
