# Pathific baseline
Infor about pathific will go here.

#frontend
cd to ui then run "npm run dev"

#backend
no need to cd
 **Option 2: stay anywhere, but point to the file explicitly**  
  ```bash
  docker compose -f ~/Advance/ambrosia/pathific/ops/docker/docker-compose.yml down -v
  docker compose -f ~/Advance/ambrosia/pathific/ops/docker/docker-compose.yml up --build -d
  ```
  → The `-f` flag tells Docker exactly which file to use.

  #Db
  db is run once on build - so drop and rebuild for new files in "ops/docker/init" to be picked.

Check out migrations in docs for hack
004_create_courts.sql (YYYY‑MM‑DD)

# Migration command, deprecation warning, and end‑to‑end verifications

You’re good to use your migration command as‑is, and we’ll stay ahead of that Node deprecation while keeping the verification loop tight and reproducible.

---

## Run migrations with your command

Use your container name and DB user exactly as you’ve set them:

```bash
# Courts table (example)
docker exec -i pathific_db psql -U pathific -d pathific < migrations/004_create_courts.sql

# Sequence items table (Creator Wizard)
docker exec -i pathific_db psql -U pathific -d pathific < migrations/005_create_sequence_items.sql
```

- **Tip:** Keep migrations idempotent (`CREATE TABLE IF NOT EXISTS`) and ordered (001, 002, …).
- **Verify schema:**
  ```bash
  docker exec -it pathific_db psql -U pathific -d pathific -c "\d courts"
  docker exec -it pathific_db psql -U pathific -d pathific -c "\d sequence_items"
  ```

---

## About the Node deprecation warning

```
(node:303778) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
```

- **What it means:** Some code (likely a dependency or legacy utility) is calling `util._extend`, which Node has deprecated. It’s not fatal—just noisy.
- **How to stay ahead:**
  - **If it’s your code:** Replace any `util._extend(target, source)` with `Object.assign(target, source)`.
  - **If it’s a dependency:** Upgrade the package to the latest version. If the warning persists, open an issue or pin a version that’s fixed.
  - **Trace source (optional):**
    ```bash
    node --trace-deprecation
    ```
    Run your dev server with this flag to see the exact file triggering it.
- **Pragmatic stance:** It won’t break your app. Fix it in your codebase if present; otherwise, track it to a dependency and plan an upgrade.

---

## End‑to‑end verification loop

### 1) Database
- **Run migrations** (courts + sequence_items) with your `docker exec` commands.
- **Verify tables exist:**
  ```bash
  docker exec -it pathific_db psql -U pathific -d pathific -c "\d courts"
  docker exec -it pathific_db psql -U pathific -d pathific -c "\d sequence_items"
  ```
- **Seed sample data (optional):**
  ```bash
  docker exec -it pathific_db psql -U pathific -d pathific -c \
  "INSERT INTO courts (name, description) VALUES ('Design Court','Taste meets rigor');"
  docker exec -it pathific_db psql -U pathific -d pathific -c \
  "INSERT INTO sequence_items (court_id, title, order_index) VALUES (1,'First item',0),(1,'Second item',1);"
  ```

### 2) Backend
- **Restart backend:**
  ```bash
  docker compose -f ops/docker/docker-compose.yml up -d --build backend
  ```
- **Health check:**
  ```bash
  curl http://localhost:8080/actuator/health
  ```
  Expect `{"status":"UP"}`.
- **Courts API:**
  ```bash
  curl http://localhost:8080/api/courts
  ```
  Expect `[]` or your seeded court(s).
- **Sequences API:**
  ```bash
  curl http://localhost:8080/api/sequences/1
  ```
  Expect an array of items ordered by `orderIndex`.

### 3) Frontend
- **Start dev server:**
  ```bash
  npm run dev
  ```
- **Courts page:**
  - Visit `http://localhost:3000/main/courts`.
  - Cards render; “Curate here” links to `/curate?court={id}`.
- **Creator Wizard:**
  - Visit `http://localhost:3000/curate?court=1`.
  - Items load from `/api/sequences/1`.
  - Drag to reorder; click **Save Order**.
  - Confirm PUTs succeed (check browser network tab).
- **Re‑verify order:**
  ```bash
  curl http://localhost:8080/api/sequences/1
  ```
  Expect updated `orderIndex` values.

---

## Real links wiring

- **Courts page button:**
  ```tsx
  <Link href={`/curate?court=${court.id}`} className="rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-5 py-2 text-white font-semibold shadow-lg hover:opacity-90">
    Curate here
  </Link>
  ```
- **Creator Wizard reads query:**
  ```tsx
  import { useSearchParams } from "next/navigation";
  const params = useSearchParams();
  const courtId = params.get("court") ?? "1";
  useEffect(() => {
    fetch(`/api/sequences/${courtId}`).then(...);
  }, [courtId]);
  ```

---

## Quick checklist

- **Migrations applied** (courts, sequence_items).
- **Backend UP** (`/actuator/health`).
- **APIs return arrays** (`/api/courts`, `/api/sequences/{courtId}`).
- **Frontend pages render** (`/main/courts`, `/curate?court=1`).
- **Drag‑and‑drop works**; **Save Order** persists.
- **Node deprecation tracked**—replace `util._extend` in your code or upgrade the dependency.

---

If you want, I can add a tiny “Add item” form to the Wizard (title input → POST → re‑fetch) so curators can build sequences without touching SQL.