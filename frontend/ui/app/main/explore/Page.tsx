import Image from "next/image";
import Link from "next/link";

export default async function ExplorePage() {
  const [courtsRes, winnerRes, badgesRes] = await Promise.all([
    fetch("/api/courts", { cache: "no-store" }),
    fetch("/api/courts/winner", { cache: "no-store" }),
    fetch("/api/badges", { cache: "no-store" })
  ]);
  const { items: courts } = await courtsRes.json();
  const { winner } = await winnerRes.json();
  const { items: badges } = await badgesRes.json();

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">
      {/* Logo top-left */}
      <Link href="/home" className="inline-block p-6">
        <Image src="/images/logo.svg" alt="Logo" width={120} height={40} priority />
      </Link>

      {/* Vertical shadow nav (HubSpot vibe) */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-md border-r border-white/10 shadow-[inset_-12px_0_24px_rgba(0,0,0,0.35)]">
        <nav className="flex flex-col gap-2 p-6">
          <Link href="/home" className="text-sm font-semibold hover:text-sky-300">Dashboard</Link>
          <Link href="/settings" className="text-sm font-semibold hover:text-sky-300">Settings</Link>
          <Link href="/curators" className="text-sm font-semibold hover:text-sky-300">Top curators</Link>
          <Link href="/courts" className="text-sm font-semibold hover:text-sky-300">Curator courts</Link>
          <Link href="/curate" className="mt-4 rounded-md bg-sky-500/20 text-sky-300 px-3 py-2 hover:bg-sky-500/30">Start your curation</Link>
        </nav>
      </aside>

      {/* Hero */}
      <section className="ml-64 p-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Navigation bar with features</h1>
        <p className="mt-2 text-white/70">Elevate your organisation’s services and products from the competition.</p>

        {/* Weekly winner spotlight */}
        <div className="mt-8 rounded-xl bg-linear-to-r from-sky-900/40 to-indigo-900/30 p-6 border border-white/10">
          <div className="text-white/80 text-sm">Weekly Winner</div>
          <div className="mt-2 text-xl font-bold">{winner?.name}</div>
          <div className="mt-1 text-white/60 text-sm">{winner?.reason}</div>
          <div className="mt-2 text-xs text-white/50">{winner?.week_start} → {winner?.week_end}</div>
        </div>

        {/* Badges */}
        <div className="mt-8 flex flex-wrap gap-3">
          {badges?.map((b: any) => (
            <span key={b.code} className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 border border-white/10">
              <span className="text-xs font-semibold">{b.label}</span>
              <span className="text-[10px] text-white/60">{b.code}</span>
            </span>
          ))}
        </div>

        {/* Courts grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts?.map((c: any) => (
            <div key={c.slug} className="rounded-xl border border-white/10 bg-white/5 p-5 hover:border-sky-400/40 transition">
              <div className="text-lg font-semibold">{c.name}</div>
              <div className="mt-1 text-white/70 text-sm">{c.summary}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                <span className="rounded-md bg-white/10 px-2 py-1">{c.category}</span>
                <Link href={`/courts/${c.slug}`} className="text-sky-300 hover:underline">Explore</Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer banner */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="text-white/80">Samples by AI for human review.</div>
        </div>
      </section>
    </div>
  );
}
