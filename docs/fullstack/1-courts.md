# Pathific courts integration plan

We’ll start with courts to stay aligned with your vision and keep beauty + functionality front and center. This adds public discovery, seeds a weekly winner, and sets up badges for Explore.

---

## Backend endpoints for courts

#### Entities and schema
- **Court:** id, name, slug, summary, category, created_at
- **WeeklyWinner:** id, court_id, week_start, week_end, reason
- **Badge:** id, code, label, description

SQL (use numbered Docker init files):
```sql
-- 010_courts.sql
CREATE TABLE IF NOT EXISTS courts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) UNIQUE NOT NULL,
  summary TEXT,
  category VARCHAR(80),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 011_weekly_winner.sql
CREATE TABLE IF NOT EXISTS weekly_winners (
  id SERIAL PRIMARY KEY,
  court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  reason TEXT
);

-- 012_badges.sql
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT
);
```

#### Controller stubs
Place in `backend/app/src/main/java/com/pathific/app/api/CourtsController.java`.

```java
package com.pathific.app.api;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.*;

@RestController
@RequestMapping("/api")
public class CourtsController {

  // GET /api/courts - public listing for Explore
  @GetMapping("/courts")
  public Map<String, Object> listCourts() {
    // Replace with service/repo calls
    List<Map<String, Object>> items = List.of(
      Map.of("id", 1, "name", "Creator Economics", "slug", "creator-economics",
             "summary", "Insights and playbooks for creator-led businesses",
             "category", "Business"),
      Map.of("id", 2, "name", "AI Craft", "slug", "ai-craft",
             "summary", "Applied AI, tooling and practice",
             "category", "Technology")
    );
    return Map.of("ok", true, "items", items);
  }

  // GET /api/courts/winner - weekly winner spotlight (public)
  @GetMapping("/courts/winner")
  public Map<String, Object> weeklyWinner() {
    Map<String, Object> winner = Map.of(
      "court_id", 2,
      "name", "AI Craft",
      "week_start", "2025-12-29",
      "week_end", "2026-01-04",
      "reason", "Highest completion rate and curated depth"
    );
    return Map.of("ok", true, "winner", winner);
  }

  // GET /api/badges - simple badge catalog (public)
  @GetMapping("/badges")
  public Map<String, Object> badges() {
    List<Map<String, Object>> items = List.of(
      Map.of("code", "CURATOR", "label", "Curator", "description", "Hosts and maintains a court"),
      Map.of("code", "WEEKLY_WINNER", "label", "Weekly Winner", "description", "Top court this week")
    );
    return Map.of("ok", true, "items", items);
  }

  // POST /api/courts - admin create (keep protected later)
  @PostMapping("/courts")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> createCourt(@RequestBody Map<String, Object> input) {
    // Validate + persist
    return Map.of("ok", true, "court", input);
  }
}
```

#### Security rules (MVP-friendly)
- **Public:** GET `/api/courts`, `/api/courts/winner`, `/api/badges`
- **Protected (later):** POST `/api/courts`, PATCH/DELETE

Add to `SecurityConfig`:
```java
.requestMatchers(HttpMethod.GET, "/api/courts").permitAll()
.requestMatchers(HttpMethod.GET, "/api/courts/winner").permitAll()
.requestMatchers(HttpMethod.GET, "/api/badges").permitAll()
```

---

## Seeds for weekly winner and badges

Add seed file after tables:

```sql
-- 013_courts_seed.sql
INSERT INTO courts (name, slug, summary, category) VALUES
('Creator Economics','creator-economics','Insights and playbooks for creator-led businesses','Business'),
('AI Craft','ai-craft','Applied AI, tooling and practice','Technology');

INSERT INTO weekly_winners (court_id, week_start, week_end, reason)
VALUES ((SELECT id FROM courts WHERE slug='ai-craft'), '2025-12-29', '2026-01-04',
        'Highest completion rate and curated depth');

INSERT INTO badges (code, label, description) VALUES
('CURATOR','Curator','Hosts and maintains a court'),
('WEEKLY_WINNER','Weekly Winner','Top court this week');
```

Run your Docker hack:
- Add files into your init directory.
- `docker compose down -v` from the directory that contains your compose file.
- `docker compose up -d` to replay seeds fresh.

---

## Frontend Explore page and badges

Create Explore page at `frontend/app/explore/page.tsx`.

```tsx
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
```

Design notes:
- **Vertical shadow nav:** subtle inset shadow + blur for the HubSpot feel.
- **Hero + winner:** gradient block with premium vibe.
- **Badges:** pill style, understated.
- **Grid cards:** minimal, hover border glow.

---

## Global logo header for every page

Add the snippet to your root layout so it’s universal.

In `frontend/app/layout.tsx`:
```tsx
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Global top-left logo */}
        <div className="fixed top-0 left-0 z-50 p-6">
          <Link href="/home" className="inline-block">
            <Image src="/images/logo.svg" alt="Logo" width={120} height={40} priority />
          </Link>
        </div>
        {children}
      </body>
    </html>
  );
}
```

This ensures the logo appears consistently across all pages without duplicating code.

---

## Verification checklist

- **Backend:**
  - **Courts:** GET `/api/courts` returns items.
  - **Winner:** GET `/api/courts/winner` returns spotlight data.
  - **Badges:** GET `/api/badges` returns catalog.
  - **Security:** Above routes permitted in `SecurityConfig`.

- **Database:**
  - **Tables exist:** `courts`, `weekly_winners`, `badges`.
  - **Seeds applied:** Run Docker down/up in the compose directory.

- **Frontend:**
  - **Explore page:** Loads courts, winner, and badges.
  - **Logo:** Displays top-left globally.
  - **Nav:** Vertical shadow sidebar renders with correct links.

---

## Next steps

- **Creator wizard sequencing:** Add `/api/wizard` endpoints and client drag-and-drop with stable `order_index` (unique per owner).
- **Payments (Stripe) + M‑Pesa bridge:** Minimal checkout + STK Push skeleton with region switch.
- **Proof-of-learning ledger:** Issue badges after module completion; export JSON.
- **AI helper:** Lightweight contextual assistant; log outcomes to trust graph.
- **Compliance/security:** Add JWT filter, roles, rate limiting, consent logging, audit trails.

Say “run seeds” when you’re ready, and I’ll give you crisp init SQL files and a Docker command block you can paste and go.