# Contract-first spec for courts, sequences, and debates spotlight

Below is a complete, contract-first implementation—database schema, backend endpoints, security config, and frontend pages—with explicit file paths, source code, and verification checks. It aligns with your Pathific vision: structured pathways, creator-first sequencing, and a foundation for debates/defense mechanics. I’m using `@dnd-kit` to avoid the ref-access-during-render issues you hit with `react-dnd`.

---

## Api contracts

### Courts
- **List courts:** `GET /api/courts`
  - Response:
    ```json
    {
      "ok": true,
      "items": [
        { "id": 1, "name": "Creator Economics", "category": "Business", "slug": "creator-economics", "summary": "..." }
      ]
    }
    ```

### Sequences (playlist items per court)
- **List items by court:** `GET /api/sequences/{courtId}`
  - Response:
    ```json
    [
      { "id": 10, "courtId": 1, "title": "Intro to...", "orderIndex": 0, "url": "https://youtu.be/..." }
    ]
    ```
- **Create item:** `POST /api/sequences/{courtId}`
  - Body:
    ```json
    { "title": "New module", "url": "https://youtu.be/...", "orderIndex": 2 }
    ```
  - Response:
    ```json
    { "id": 11, "courtId": 1, "title": "New module", "orderIndex": 2, "url": "..." }
    ```
- **Update item:** `PUT /api/sequences/{id}`
  - Body:
    ```json
    { "title": "Updated", "orderIndex": 1, "url": "..." }
    ```
  - Response:
    ```json
    { "id": 11, "courtId": 1, "title": "Updated", "orderIndex": 1, "url": "..." }
    ```
- **Delete item:** `DELETE /api/sequences/{id}`
  - Response:
    ```json
    { "ok": true }
    ```

---

## Database schema and migrations

### File: `migrations/004_create_courts.sql`
```sql
CREATE TABLE IF NOT EXISTS courts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  summary TEXT NOT NULL
);
```

### File: `migrations/005_create_sequence_items.sql`
```sql
CREATE TABLE IF NOT EXISTS sequence_items (
  id BIGSERIAL PRIMARY KEY,
  court_id BIGINT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  order_index INT NOT NULL,
  CONSTRAINT uq_court_order UNIQUE (court_id, order_index)
);

-- Helpful index for listing by court ordered
CREATE INDEX IF NOT EXISTS idx_sequence_items_court_order
ON sequence_items (court_id, order_index);
```

### Migration commands (your style)
```bash
docker exec -i pathific_db psql -U pathific -d pathific < migrations/004_create_courts.sql
docker exec -i pathific_db psql -U pathific -d pathific < migrations/005_create_sequence_items.sql
```

### Verification (schema)
```bash
docker exec -it pathific_db psql -U pathific -d pathific -c "\d courts"
docker exec -it pathific_db psql -U pathific -d pathific -c "\d sequence_items"
```

---

## Backend (Spring Boot)

### File: `backend/src/main/java/com/pathific/config/SecurityConfig.java`
```java
package com.pathific.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/actuator/**").permitAll()
        .requestMatchers("/api/courts/**").permitAll()
        .requestMatchers("/api/sequences/**").permitAll()
        .anyRequest().authenticated()
      );
    return http.build();
  }
}
```

### File: `backend/src/main/java/com/pathific/courts/Court.java`
```java
package com.pathific.courts;

import jakarta.persistence.*;

@Entity
@Table(name = "courts")
public class Court {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  private String category;
  @Column(unique = true)
  private String slug;
  @Column(columnDefinition = "TEXT")
  private String summary;

  // getters/setters
}
```

### File: `backend/src/main/java/com/pathific/courts/CourtRepository.java`
```java
package com.pathific.courts;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourtRepository extends JpaRepository<Court, Long> {}
```

### File: `backend/src/main/java/com/pathific/courts/CourtController.java`
```java
package com.pathific.courts;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/courts")
public class CourtController {
  private final CourtRepository repo;

  public CourtController(CourtRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public Map<String, Object> list() {
    List<Court> items = repo.findAll();
    return Map.of("ok", true, "items", items);
  }
}
```

### File: `backend/src/main/java/com/pathific/sequences/SequenceItem.java`
```java
package com.pathific.sequences;

import jakarta.persistence.*;

@Entity
@Table(name = "sequence_items",
  uniqueConstraints = @UniqueConstraint(name = "uq_court_order", columnNames = {"court_id", "order_index"})
)
public class SequenceItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "court_id", nullable = false)
  private Long courtId;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String url;

  @Column(name = "order_index", nullable = false)
  private Integer orderIndex;

  // getters/setters
}
```

### File: `backend/src/main/java/com/pathific/sequences/SequenceItemRepository.java`
```java
package com.pathific.sequences;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SequenceItemRepository extends JpaRepository<SequenceItem, Long> {
  List<SequenceItem> findByCourtIdOrderByOrderIndexAsc(Long courtId);
}
```

### File: `backend/src/main/java/com/pathific/sequences/SequenceItemController.java`
```java
package com.pathific.sequences;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/sequences")
public class SequenceItemController {
  private final SequenceItemRepository repo;

  public SequenceItemController(SequenceItemRepository repo) {
    this.repo = repo;
  }

  @GetMapping("/{courtId}")
  public List<SequenceItem> list(@PathVariable Long courtId) {
    return repo.findByCourtIdOrderByOrderIndexAsc(courtId);
  }

  @PostMapping("/{courtId}")
  public ResponseEntity<SequenceItem> create(@PathVariable Long courtId, @RequestBody SequenceItem body) {
    SequenceItem item = new SequenceItem();
    item.setCourtId(courtId);
    item.setTitle(body.getTitle());
    item.setUrl(body.getUrl());
    item.setOrderIndex(body.getOrderIndex());
    SequenceItem saved = repo.save(item);
    return ResponseEntity.ok(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<SequenceItem> update(@PathVariable Long id, @RequestBody SequenceItem body) {
    return repo.findById(id)
      .map(existing -> {
        if (body.getTitle() != null) existing.setTitle(body.getTitle());
        if (body.getUrl() != null) existing.setUrl(body.getUrl());
        if (body.getOrderIndex() != null) existing.setOrderIndex(body.getOrderIndex());
        return ResponseEntity.ok(repo.save(existing));
      })
      .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public Map<String, Object> delete(@PathVariable Long id) {
    repo.deleteById(id);
    return Map.of("ok", true);
  }
}
```

### Backend verification
```bash
# Health
curl http://localhost:8080/actuator/health

# Courts
curl http://localhost:8080/api/courts

# Seed sample courts
docker exec -it pathific_db psql -U pathific -d pathific -c \
"INSERT INTO courts (name, category, slug, summary) VALUES
('Creator Economics','Business','creator-economics','Insights and playbooks'),
('AI Craft','Technology','ai-craft','Applied AI, tooling and practice');"

# Sequences seed
docker exec -it pathific_db psql -U pathific -d pathific -c \
"INSERT INTO sequence_items (court_id, title, url, order_index) VALUES
(1,'Intro to Creator Economics','https://youtu.be/abc',0),
(1,'Pricing & Tiers','https://youtu.be/def',1),
(1,'Community & Retention','https://youtu.be/ghi',2);"

# Sequences list
curl http://localhost:8080/api/sequences/1
```

---

## Frontend (Next.js, app router)

### Install dnd kit
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### File: `frontend/ui/app/main/courts/page.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Court {
  id: number;
  name: string;
  category: string;
  slug: string;
  summary: string;
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
        setCourts(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-10">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Curator Courts</h1>
        <p className="mt-3 text-white/70">
          Structured arenas of defended micro‑learning—curate, learn, and lead with trust.
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
                    View pathway
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
```

### File: `frontend/ui/app/curate/page.tsx`
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SequenceItem {
  id: number;
  courtId: number;
  title: string;
  url: string;
  orderIndex: number;
}

function SortableRow({ item }: { item: SequenceItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 mb-3 shadow hover:shadow-lg transition-shadow relative overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-linear-to-br from-pink-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-linear-to-br from-sky-500/10 to-transparent blur-3xl" />
      </div>
      <p className="text-white font-semibold">{item.title}</p>
      <p className="text-xs text-white/50 mt-2">Order: {item.orderIndex}</p>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="text-sky-300 text-xs mt-2 inline-block hover:underline"
      >
        Open link
      </a>
    </div>
  );
}

export default function CreatorWizard() {
  const params = useSearchParams();
  const courtIdParam = params.get("court");
  const courtId = courtIdParam ? Number(courtIdParam) : 1;

  const [items, setItems] = useState<SequenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sequences/${courtId}`);
        if (!res.ok) throw new Error(`Failed to load sequences (${res.status})`);
        const data: SequenceItem[] = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courtId]);

  const ids = useMemo(() => items.map(i => i.id), [items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const newOrder = arrayMove(items, oldIndex, newIndex).map((i, idx) => ({ ...i, orderIndex: idx }));
    setItems(newOrder);
  }

  async function saveOrder() {
    setSaving(true);
    try {
      await Promise.all(
        items.map((item) =>
          fetch(`/api/sequences/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: item.title, url: item.url, orderIndex: item.orderIndex })
          })
        )
      );
      alert("Order saved successfully!");
    } catch (e) {
      alert("Failed to save order.");
    } finally {
      setSaving(false);
    }
  }

  async function addItem(title: string, url: string) {
    const nextIndex = items.length;
    try {
      const res = await fetch(`/api/sequences/${courtId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, orderIndex: nextIndex })
      });
      if (!res.ok) throw new Error(`Failed to add item (${res.status})`);
      const created: SequenceItem = await res.json();
      setItems(prev => [...prev, created]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add item");
    }
  }

  async function deleteItem(id: number) {
    try {
      const res = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete item (${res.status})`);
      setItems(prev => prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, orderIndex: idx })));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete item");
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Creator Wizard</h1>
      <p className="text-white/70 mb-6">
        Drag, drop, and sequence your modules—foundation for debates, proof‑of‑learning, and monetization.
      </p>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300 mb-4">
          {error}
        </div>
      )}

      {loading && <p className="text-white/70">Loading items...</p>}

      {!loading && (
        <>
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="Module title"
              className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
              id="new-title"
            />
            <input
              type="text"
              placeholder="https://youtu.be/..."
              className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
              id="new-url"
            />
            <button
              onClick={() => {
                const t = (document.getElementById("new-title") as HTMLInputElement)?.value?.trim();
                const u = (document.getElementById("new-url") as HTMLInputElement)?.value?.trim();
                if (!t || !u) return alert("Provide title and URL");
                addItem(t, u);
              }}
              className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-semibold shadow hover:opacity-90"
            >
              Add item
            </button>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div>
                {items.map((item) => (
                  <div key={item.id}>
                    <SortableRow item={item} />
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={saveOrder}
            disabled={saving}
            className="mt-6 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Order"}
          </button>
        </>
      )}
    </div>
  );
}
```

---

## End-to-end verification checklist

- **Migrations applied:**
  ```bash
  docker exec -i pathific_db psql -U pathific -d pathific < migrations/004_create_courts.sql
  docker exec -i pathific_db psql -U pathific -d pathific < migrations/005_create_sequence_items.sql
  ```
- **Seed data:**
  ```bash
  docker exec -it pathific_db psql -U pathific -d pathific -c \
  "INSERT INTO courts (name, category, slug, summary) VALUES
  ('Creator Economics','Business','creator-economics','Insights and playbooks'),
  ('AI Craft','Technology','ai-craft','Applied AI, tooling and practice');"

  docker exec -it pathific_db psql -U pathific -d pathific -c \
  "INSERT INTO sequence_items (court_id, title, url, order_index) VALUES
  (1,'Intro to Creator Economics','https://youtu.be/abc',0),
  (1,'Pricing & Tiers','https://youtu.be/def',1),
  (1,'Community & Retention','https://youtu.be/ghi',2);"
  ```
- **Backend health:**
  ```bash
  curl http://localhost:8080/actuator/health
  ```
- **Courts API:**
  ```bash
  curl http://localhost:8080/api/courts
  ```
- **Sequences API:**
  ```bash
  curl http://localhost:8080/api/sequences/1
  ```
- **Frontend:**
  - Visit `/main/courts` → courts visible.
  - Click “Curate here” → `/curate?court=1`.
  - Drag items → order updates locally.
  - Add item → POST succeeds, item appears.
  - Delete item → DELETE succeeds, list reorders.
  - Save Order → PUTs succeed; curl again shows updated `orderIndex`.

---

## Notes on debates and spotlight (next sprint)

- Add `debates` table with `type` enum (`DEFENSE`, `ACCUSATION`), `evidence_url`, `argument`, `score`.
- Expose `/api/debates/{sequenceItemId}` with POST/GET.
- Display defense/accusation counts and scores on Courts and Wizard.
- Spotlight algorithm: rank modules by `(defense_score - accusation_score) + completion_weight`.

When you’re ready, I’ll scaffold the debates module with full paths, endpoints, UI, and verification steps—keeping the same contract-first discipline.