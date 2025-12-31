"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Backend contract for Court */
interface Court {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

/** Skeleton card for loading state */
function CourtSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 animate-pulse">
      <div className="h-6 w-2/3 bg-white/20 rounded mb-3" />
      <div className="h-4 w-full bg-white/10 rounded mb-2" />
      <div className="h-4 w-5/6 bg-white/10 rounded mb-2" />
      <div className="h-3 w-1/3 bg-white/10 rounded mt-4" />
    </div>
  );
}

/** Empty state with angelic CTA */
function EmptyState() {
  return (
    <div className="col-span-full text-center py-16">
      <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-sky-400/40 to-pink-400/40 border border-white/20 shadow-lg shadow-pink-500/10" />
      <h2 className="mt-6 text-2xl font-bold">No courts yet</h2>
      <p className="mt-2 text-white/70">Curate the first court—set the tone for trust and learning.</p>
      <Link
        href="/curate"
        className="mt-6 inline-block rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90"
      >
        Start your curation
      </Link>
    </div>
  );
}

/** Error banner */
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
      {message}
    </div>
  );
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/courts", { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error(`Failed to load courts (${res.status})`);
        const data = await res.json();

        // Defensive: ensure array
        if (!Array.isArray(data)) {
          console.warn("Unexpected /api/courts response:", data);
          if (!cancelled) setCourts([]);
        } else {
          if (!cancelled) setCourts(data);
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Network error");
        if (!cancelled) setCourts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-10">
      {/* Angelic header */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Curator Courts
        </h1>
        <p className="mt-3 text-white/70">
          Where taste meets rigor—curate, learn, and lead with trust.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/curate"
            className="rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-5 py-2 text-white font-semibold shadow-lg hover:opacity-90"
          >
            Start your curation
          </Link>
          <Link
            href="/learnmore"
            className="rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-white/90 hover:bg-white/10"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* Grid */}
      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Error */}
          {error && <ErrorBanner message={error} />}

          {/* Loading skeletons */}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <CourtSkeleton key={`skeleton-${i}`} />)}

          {/* Empty state */}
          {!loading && !error && courts.length === 0 && <EmptyState />}

          {/* Cards */}
          {!loading && !error && courts.length > 0 &&
            courts.map((court) => (
              <div
                key={court.id}
                className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl" />
                </div>

                <h2 className="text-xl font-semibold">{court.name}</h2>
                <p className="text-white/70 mt-2">{court.description}</p>
                <p className="text-xs text-white/50 mt-4">
                  Created {new Date(court.createdAt).toLocaleDateString()}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href={`/courts/${court.id}`}
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
