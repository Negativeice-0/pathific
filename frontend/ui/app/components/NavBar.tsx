"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="mx-auto mt-4 w-full max-w-6xl rounded-xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 px-6 py-3 flex items-center justify-between">
      {/* Logo image */}
      <Link href="/main/home" className="flex items-center">
        <Image
          src="/images/logo.svg"
          alt="Pathific Logo"
          width={80}
          height={28}
          priority
        />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-6">
        <Link href="/main/home" className="hover:text-sky-300">Dashboard</Link>
        <Link href="/settings" className="hover:text-sky-300">Settings</Link>
        <Link href="/main/curators" className="hover:text-sky-300">Top Curators</Link>
        <Link href="/main/courts" className="hover:text-sky-300">Curator Courts</Link>
        <Link href="/main/curate" className="rounded-md bg-sky-500/20 px-3 py-1 text-sky-300 hover:bg-sky-500/30">
          Start your curation
        </Link>
      </div>

      {/* Vibrant logout button */}
      <button className="hidden md:inline rounded-full bg-linear-to-r from-pink-500 to-red-500 text-white px-4 py-1 hover:opacity-80">
        Logout
      </button>

      {/* Hamburger for mobile */}
      <button
        className="md:hidden text-sky-400"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-black/90 backdrop-blur-md border-t border-white/20 p-6 flex flex-col gap-4 md:hidden">
          <Link href="/main/home" className="hover:text-sky-300">Dashboard</Link>
          <Link href="/settings" className="hover:text-sky-300">Settings</Link>
          <Link href="/main/curators" className="hover:text-sky-300">Top Curators</Link>
          <Link href="/main/courts" className="hover:text-sky-300">Curator Courts</Link>
          <Link href="/main/curate" className="rounded-md bg-sky-500/20 px-3 py-1 text-sky-300 hover:bg-sky-500/30">
            Start your curation
          </Link>
          <button className="rounded-full bg-linear-to-r from-pink-500 to-red-500 text-white px-4 py-1 hover:opacity-80">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
