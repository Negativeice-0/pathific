# Modular architecture and design strategy for Pathific

You’ve built a beautiful foundation—now here’s the comprehensive, headache‑free setup that merges everything we discussed: layouts, LearnMore, auth, main pages, navbar/footer, metadata, backend, migrations, verification, and growth prompts. This is the “masterpiece recipe” you can trust.

---

## Page philosophy and shared UI

- **Welcome page (/)**
  - **No navbar.**
  - **Typewriter headline** with subtle animated background.
  - **Logo top‑left**, **Login/Register** styled below.
  - **Minimal, emotionally resonant**—color scheme: black, smoky white, blue (Netflix’s hopeful sibling).
- **Auth pages (/auth/register, /auth/login)**
  - **AuthLayout** with **logo top‑left** and **Learn More top‑right**.
  - **Smoky shadow card** for forms with clear headers (“Login”, “Register”).
  - **Dark background**, no main navbar.
- **Main pages (/home, /courts, /curators, /settings, /curate)**
  - **MainLayout** with **glassmorphic horizontal navbar** (HubSpot‑style) and **footer**.
  - **Navbar** includes **logo image**, desktop links, **hamburger on mobile**, and a **vibrant gradient logout**.
  - **Footer** is a glassmorphic banner with quicklinks and FAQs.

---

## Layouts and components (final structure)

### Root layout (owns html/body + global metadata)
```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathific",
  description: "Structured learning for a social-first world.",
  icons: { icon: "/images/logo.svg" }, // ensure file exists in /public/images
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
```

### Auth layout (logo left, Learn More right, smoky card center)
```tsx
// app/(auth)/layout.tsx
import LogoLink from "@/components/LogoLink";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#121826] text-[#e6e8ee] flex flex-col">
      <div className="flex justify-between items-center p-4">
        <LogoLink href="/" size={48} />
        <Link href="/learnmore" className="text-sm font-semibold hover:text-sky-300">Learn More</Link>
      </div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </main>
  );
}
```

### Main layout (navbar + footer only—no html/body)
```tsx
// app/(main)/layout.tsx
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pathific",
  description: "Structured learning for a social-first world.",
  icons: { icon: "/images/logo.svg" },
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0b0d10] text-white min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Navbar (glassmorphic, logo image, desktop + mobile)
```tsx
// components/NavBar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="mx-auto mt-4 w-full max-w-6xl rounded-xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 px-6 py-3 flex items-center justify-between">
      {/* Logo image */}
      <Link href="/home" className="flex items-center">
        <Image src="/images/logo.svg" alt="Pathific Logo" width={80} height={28} priority />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-6">
        <Link href="/home" className="hover:text-sky-300">Dashboard</Link>
        <Link href="/settings" className="hover:text-sky-300">Settings</Link>
        <Link href="/curators" className="hover:text-sky-300">Top Curators</Link>
        <Link href="/courts" className="hover:text-sky-300">Curator Courts</Link>
        <Link href="/curate" className="rounded-md bg-sky-500/20 px-3 py-1 text-sky-300 hover:bg-sky-500/30">
          Start your curation
        </Link>
      </div>

      {/* Vibrant logout */}
      <button className="hidden md:inline rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-1 hover:opacity-80">
        Logout
      </button>

      {/* Hamburger */}
      <button className="md:hidden text-sky-400" onClick={() => setOpen(!open)}>☰</button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-black/90 backdrop-blur-md border-t border-white/20 p-6 flex flex-col gap-4 md:hidden">
          <Link href="/home" className="hover:text-sky-300">Dashboard</Link>
          <Link href="/settings" className="hover:text-sky-300">Settings</Link>
          <Link href="/curators" className="hover:text-sky-300">Top Curators</Link>
          <Link href="/courts" className="hover:text-sky-300">Curator Courts</Link>
          <Link href="/curate" className="rounded-md bg-sky-500/20 px-3 py-1 text-sky-300 hover:bg-sky-500/30">Start your curation</Link>
          <button className="rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-1 hover:opacity-80">Logout</button>
        </div>
      )}
    </nav>
  );
}
```

### Footer (glassmorphic banner)
```tsx
// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-white/10 backdrop-blur-md border-t border-white/20 rounded-t-xl px-6 py-8 text-center">
      <p className="text-white/80">Samples by AI for human review.</p>
      <div className="mt-4 flex justify-center gap-6 text-sm text-white/60">
        <Link href="/faq" className="hover:text-sky-300">FAQs</Link>
        <Link href="/quicklinks" className="hover:text-sky-300">Quicklinks</Link>
        <Link href="/contact" className="hover:text-sky-300">Contact</Link>
      </div>
    </footer>
  );
}
```

### Auth pages (smoky cards)

```tsx
// app/(auth)/login/page.tsx
"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.ok) { localStorage.setItem("pathific_token", json.token); window.location.href = "/home"; }
      else { setError(json.error || "Login failed"); }
    } catch { setError("Network error"); }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-black/40 backdrop-blur-md shadow-lg border border-white/10 p-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="p-2 rounded border border-sky-500 bg-black/30" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 rounded border border-sky-500 bg-black/30" />
        <button type="submit" className="bg-sky-500 text-white rounded p-2">Login</button>
      </form>
    </div>
  );
}
```

```tsx
// app/(auth)/register/page.tsx
"use client";
import { useState } from "react";

export default function Register() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const json = await res.json();
      if (json.ok) { localStorage.setItem("pathific_token", json.token); window.location.href = "/home"; }
      else { setError(json.error || "Registration failed"); }
    } catch { setError("Network error"); }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-black/40 backdrop-blur-md shadow-lg border border-white/10 p-8">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Name" className="p-2 rounded border border-sky-500 bg-black/30" />
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="p-2 rounded border border-sky-500 bg-black/30" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 rounded border border-sky-500 bg-black/30" />
        <button type="submit" className="bg-sky-500 text-white rounded p-2">Register</button>
      </form>
    </div>
  );
}
```

### Home page (Coursera‑style hero + stubs)
```tsx
// app/(main)/home/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-10">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto mt-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Pathific: Power to the People</h1>
        <p className="mt-4 text-lg md:text-xl text-white/70">Curate, learn, and lead with trust.</p>
        <Link href="/curate" className="mt-8 inline-block rounded bg-sky-500 px-6 py-3 text-white font-semibold hover:bg-sky-600">
          Start your curation
        </Link>
      </section>

      {/* Courts stub */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Courts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">Court card placeholder</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">Court card placeholder</div>
        </div>
      </section>

      {/* Other stubs */}
      <section className="mt-16">Creator wizard placeholder</section>
      <section className="mt-16">Payments placeholder</section>
      <section className="mt-16">M-Pesa bridge placeholder</section>
      <section className="mt-16">Proof-of-learning ledger placeholder</section>
      <section className="mt-16">AI helper placeholder</section>
      <section className="mt-16">Compliance/security placeholder</section>
    </div>
  );
}
```

---

## Backend endpoints and entities

- **Entity: User**
  - **Fields:** `id BIGSERIAL`, `email UNIQUE NOT NULL`, `password NOT NULL`, `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.
- **Repository:** `UserRepository` (CRUD).
- **Controllers:**
  - **POST /api/auth/register:** creates user, hashes password.
  - **POST /api/auth/login:** checks credentials, issues JWT (next milestone).
- **Config (`application.yml`):**
  - Datasource env vars.
  - JPA `ddl-auto: none`.
  - Actuator enabled.

---

## Database strategy: raw SQL migrations (tool‑free)

- **Folder:** `migrations/` at project root.
- **Sequential names:**  
  - `001_create_users.sql`  
  - `002_add_index_on_email.sql`  
  - `003_create_orders.sql`
- **Example migration:**
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  ```
- **Apply manually:**
  ```bash
  docker exec -i pathific_db psql -U pathific_dev_user -d pathific_dev -f migrations/001_create_users.sql
  ```
- **Track applied migrations:** `MIGRATIONS.md`.
- **Verify schema:**
  ```bash
  docker exec -it pathific_db psql -U pathific_dev_user -d pathific_dev -c '\dt'
  docker exec -it pathific_db psql -U pathific_dev_user -d pathific_dev -c 'SELECT * FROM users LIMIT 3;'
  ```
- **Pros:** fast, simple, reproducible via Git.  
- **Cons:** manual order, potential drift, no auto rollback—good enough under deadline.

---

## Verification tests (end‑to‑end)

- **DB connectivity:**
  ```bash
  docker exec -it pathific_db psql -U pathific_dev_user -d pathific_dev -c 'SELECT 1;'
  ```
- **Backend health:**
  ```bash
  curl http://localhost:8080/actuator/health
  ```
- **Apply users migration:**
  ```bash
  docker exec -i pathific_db psql -U pathific_dev_user -d pathific_dev -f migrations/001_create_users.sql
  ```
- **Register API:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"secret"}'
  ```
- **DB check:**
  ```bash
  docker exec -it pathific_db psql -U pathific_dev_user -d pathific_dev -c 'SELECT email, created_at FROM users ORDER BY id DESC LIMIT 3;'
  ```
- **Frontend:**
  - Run `npm run dev`.
  - Visit `/` → Welcome visible.
  - Navigate to `/auth/register` → submit form → confirm DB entry.

---

## Troubleshooting playbook

- **Compose YAML errors (“must be a mapping”):** fix indentation; ensure services/volumes nested correctly.
- **Backend cannot reach DB:** use correct host/port; check `docker compose ps`, `docker logs pathific_db`.
- **No tables after registration:** ensure migration applied; confirm JPA `ddl-auto` isn’t creating tables unexpectedly.
- **Migration tools confusion:** we’re not using Atlas/Flyway/Liquibase now—stick to raw SQL + `MIGRATIONS.md`.
- **Frontend API fails:** confirm backend UP, CORS settings, and correct API base URL.
- **Hydration mismatch:** only RootLayout owns `<html>/<body>`; child layouts return plain nodes; avoid duplicate navbars/logos.

---

## Growth prompts (frontend add‑ons)

- **Hero (Coursera‑style)**
  - **Headline:** “Pathific: Power to the People”
  - **Subheadline:** “Curate, learn, and lead with trust.”
  - **CTA:** “Start your curation”
- **HubSpot‑style navbar**
  - **Links:** Dashboard, Settings, Top Curators, Curator Courts.
  - **Highlight:** Start your curation.
- **Footer banner**
  - **Content:** Samples by AI for human review, Quicklinks, FAQs, Contact.
- **AI‑like polish**
  - **Weekly Winner spotlight** with glow animation.
  - **Trust graph visualization stub** (interactive placeholder).
  - **AI helper teaser bubble**—“Ask Pathific AI anything…” opens a modal.

---

## Workflow rules to keep it easy

- **Rule 1:** Only **RootLayout** has `<html>/<body>`.
- **Rule 2:** Layouts own shared UI (Auth top bar, Main navbar/footer). **Pages never duplicate them.**
- **Rule 3:** Logo appears in **exactly one place per segment**:
  - Auth: top‑left via **AuthLayout**.
  - Main: inside **Navbar** as an image.
- **Rule 4:** Metadata (favicon/title) lives in **RootLayout**; child layouts can **add/override titles**, not shells.
- **Rule 5:** **Verify layer by layer**—DB → Backend → API → Frontend—before moving on.

---

If you follow this structure, you avoid double navbars, nested HTML, hydration mismatches, and design drift. Your Home page stays beautiful, mobile‑first, and emotionally resonant—and you’re set to wire Courts next without chaos.

Want me to scaffold the **Courts integration** (API + frontend cards + weekly winner stub) as the next step?