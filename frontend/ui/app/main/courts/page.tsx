"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Court { id:number; name:string; category:string; slug:string; summary:string; }

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{ (async()=>{
    try{
      const res=await fetch("/api/courts"); if(!res.ok) throw new Error(`Failed (${res.status})`);
      const data=await res.json(); setCourts(Array.isArray(data.items)?data.items:[]);
    }catch(e){ setError(e instanceof Error? e.message : "Network error"); }
    finally{ setLoading(false); }
  })(); },[]);

  return (
    <div className="p-10">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Curator Courts</h1>
        <p className="mt-3 text-white/70">Structured micro‑learning pathways—curate, learn, and complete.</p>
      </section>

      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {error && <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">{error}</div>}
          {loading && <p className="text-white/70">Loading courts...</p>}
          {!loading && !error && courts.length===0 && <p className="text-white/70">No courts yet.</p>}

          {courts.map(c=>(
            <div key={c.id} className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-linear-to-br from-pink-500/10 to-transparent blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-linear-to-br from-sky-500/10 to-transparent blur-3xl" />
              </div>
              <h2 className="text-xl font-semibold">{c.name}</h2>
              <p className="text-white/70 mt-2">{c.summary}</p>
              <p className="text-xs text-white/50 mt-4">{c.category}</p>
              <div className="mt-5 flex items-center gap-3">
                <Link href={`/curate?court=${c.id}`} className="rounded-lg bg-linear-to-r from-sky-500 to-indigo-500 px-3 py-1 text-white font-semibold shadow hover:opacity-90">Curate</Link>
                <button
                  onClick={async ()=>{
                    const res=await fetch("/api/payments/checkout",{method:"POST",headers:{"Content-Type":"application/json"},
                      body:JSON.stringify({ amount:50, currency:"KES", email:"demo@pathific.local", phone:"254700000000", name:"Pathific Demo" })
                    });
                    const data=await res.json(); if(data.ok && data.link){ window.location.href=data.link; } else { alert("Payment init failed"); }
                  }}
                  className="rounded-lg bg-linear-to-r from-amber-500 to-orange-500 px-3 py-1 text-white font-semibold shadow hover:opacity-90"
                >Pay</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
