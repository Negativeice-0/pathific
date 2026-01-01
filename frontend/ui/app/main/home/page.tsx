import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-10">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mt-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Pathific: Power to the People
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/70">
          Curate, learn, and lead with trust.
        </p>
        <Link href="/main/curate" className="mt-8 inline-block rounded bg-sky-500 px-6 py-3 text-white font-semibold hover:bg-sky-600">
          Start your curation
        </Link>
      </section>

    {/* Courts section stub --place-items-center -- so when you have more you know what to check first*/}
<section className="mt-16">
  <h2 className="text-2xl font-bold mb-6">Courts</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
    {/* Centered card with centered content -- from flex to end can be a life saver with cards/forms*/}
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center justify-center">
      <Link href="/main/courts" className="mt-8 inline-block rounded bg-sky-500 px-6 py-3 text-white font-semibold hover:bg-sky-600">
        Courts for now, algorithms, more architecture and so much more later
      </Link>
    </div>
  </div>
</section>

      {/** Other stubs
      <section className="mt-16">Creator wizard placeholder</section>
      <section className="mt-16">Payments placeholder</section>
      <section className="mt-16">M-Pesa bridge placeholder</section>
      <section className="mt-16">Proof-of-learning ledger placeholder</section>
      <section className="mt-16">AI helper placeholder</section>
      <section className="mt-16">Compliance/security placeholder</section>
    */}
    </div>
  ); 
}
