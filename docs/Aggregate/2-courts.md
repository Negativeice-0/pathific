# Courts integration—full, commented, and correct

You’re right to ask for imports, exact file paths, and complete code with getters/setters. Here’s a clean, end‑to‑end scaffold with comments, so you can paste and run without ambiguity.

---

## Project structure

- **Backend (Spring Boot)**
  - `src/main/java/com/pathific/`  
    - `entity/Court.java`  
    - `repository/CourtRepository.java`  
    - `controller/CourtController.java`  
    - `PathificApplication.java` (your main class)
  - `src/main/resources/application.yml`
  - `migrations/004_create_courts.sql`

- **Frontend (Next.js App Router)**
  - `app/(main)/courts/page.tsx`
  - Shared components already exist: `components/NavBar.tsx`, `components/Footer.tsx`

> **Tip:** Yes—create a folder named `entity` under your base package. Keep `entity`, `repository`, and `controller` separated for clarity and reproducibility.

---

## Backend: Court entity

### `src/main/java/com/pathific/entity/Court.java`
```java
package com.pathific.entity;

import jakarta.persistence.*;
import java.sql.Timestamp;

/**
 * Court entity represents a curator court.
 * - name: unique court name
 * - description: short summary
 * - createdAt: server-side timestamp
 */
@Entity
@Table(name = "courts")
public class Court {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String name;

    @Column(nullable=false, columnDefinition = "TEXT")
    private String description;

    @Column(name="created_at", nullable=false)
    private Timestamp createdAt;

    /** Default constructor required by JPA */
    public Court() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    /** Convenience constructor */
    public Court(String name, String description) {
        this.name = name;
        this.description = description;
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
```

---

## Backend: Repository

### `src/main/java/com/pathific/repository/CourtRepository.java`
```java
package com.pathific.repository;

import com.pathific.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** JPA repository for Court entity */
@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    Optional<Court> findByName(String name);
}
```

---

## Backend: Controller

### `src/main/java/com/pathific/controller/CourtController.java`
```java
package com.pathific.controller;

import com.pathific.entity.Court;
import com.pathific.repository.CourtRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Courts API:
 * - GET /api/courts: list all courts
 * - POST /api/courts: create a court
 * - GET /api/courts/{id}: get court by id
 */
@RestController
@RequestMapping("/api/courts")
public class CourtController {

    private final CourtRepository repo;

    public CourtController(CourtRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Court> allCourts() {
        return repo.findAll();
    }

    @PostMapping
    public ResponseEntity<Court> createCourt(@RequestBody Court court) {
        // Basic guard: name and description must be present
        if (court.getName() == null || court.getName().isBlank()
                || court.getDescription() == null || court.getDescription().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        // Ensure createdAt is set if missing
        if (court.getCreatedAt() == null) {
            court.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        }
        Court saved = repo.save(court);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Court> getCourt(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

---

## Backend: Migration SQL

### `migrations/004_create_courts.sql`
```sql
-- Creates the courts table with a unique name and timestamp
CREATE TABLE IF NOT EXISTS courts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Apply migration (manual, tool‑free)
```bash
docker exec -i pathific_db \
  psql -U pathific_dev_user -d pathific_dev \
  -f migrations/004_create_courts.sql
```

> Add to `MIGRATIONS.md`:
> - 004_create_courts.sql (YYYY‑MM‑DD)

---

## Backend: application.yml (anchor)

### `src/main/resources/application.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pathific_dev
    username: pathific_dev_user
    password: pathific_dev_pass
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

> Keep `ddl-auto: none` to avoid silent schema drift. Migrations are applied manually.

---

## Frontend: Courts page

### `app/(main)/courts/page.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";

/** Court type mirrors backend entity fields */
interface Court {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

/**
 * CourtsPage:
 * - Fetches /api/courts
 * - Displays glassmorphic cards
 * - Ready for weekly winner + badges stubs
 */
export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courts")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load courts");
        return res.json();
      })
      .then(setCourts)
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Curator Courts</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map(court => (
          <div
            key={court.id}
            className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-5 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold">{court.name}</h2>
            <p className="text-white/70 mt-2">{court.description}</p>
            <p className="text-xs text-white/50 mt-4">
              Created {new Date(court.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Quick verification loop

1. **Apply migration**
   - Run `004_create_courts.sql` via Docker (command above).
2. **Seed sample courts (optional)**
   ```bash
   curl -X POST http://localhost:8080/api/courts \
     -H "Content-Type: application/json" \
     -d '{"name":"Design Court","description":"Where taste meets rigor."}'

   curl -X POST http://localhost:8080/api/courts \
     -H "Content-Type: application/json" \
     -d '{"name":"Learning Court","description":"Proof-of-learning, not vibes."}'
   ```
3. **List courts**
   ```bash
   curl http://localhost:8080/api/courts
   ```
4. **Frontend**
   - `npm run dev` → visit `/courts` → see cards.

---

## Notes on getters/setters and package organization

- **Getters/Setters:** JPA needs them to read/write fields. They also keep your entity encapsulated—no direct field access from outside.
- **Package folders:**  
  - `com.pathific.entity` → JPA entities.  
  - `com.pathific.repository` → Spring Data repositories.  
  - `com.pathific.controller` → REST controllers.  
  - This separation keeps your architecture clean and teachable.

---

## Next enhancements (optional but delightful)

- **Weekly Winner endpoint**
  - `GET /api/courts/winner` returns one highlighted court (e.g., most recent or curated).
  - Frontend: glowing spotlight card with subtle pulse animation.
- **Badges per court**
  - `GET /api/courts/{id}/badges` returns badge stubs.
  - Frontend: pill‑style badges under each card.
- **AI helper teaser**
  - Floating bubble: “Ask Pathific AI…” opens a modal (stubbed now, wired later).

---

If you want, I’ll add the **Weekly Winner** endpoint and a glowing spotlight card next—keeps the Courts page feeling alive while we wire real data.