Perfect — we’re aligned. The **Courts module** is stable, and now we embark on the **Creator Wizard**, which everything else (debates, payments, proof‑of‑learning, AI helper) depends on. If we scaffold it contract‑first and modular, it won’t break the rest of the app.

---

## 🛠️ Creator Wizard: Backend scaffold

### Entity: `SequenceItem`
`src/main/java/com/pathific/app/entity/SequenceItem.java`
```java
package com.pathific.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sequence_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"court_id", "order_index"}))
public class SequenceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="court_id", nullable=false)
    private Long courtId;

    @Column(nullable=false)
    private String title;

    @Column(name="order_index", nullable=false)
    private Integer orderIndex;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
```

### Migration
`migrations/005_create_sequence_items.sql`
```sql
CREATE TABLE IF NOT EXISTS sequence_items (
  id BIGSERIAL PRIMARY KEY,
  court_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INT NOT NULL,
  CONSTRAINT uq_court_order UNIQUE (court_id, order_index),
  CONSTRAINT fk_court FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);
```

### Repository
`src/main/java/com/pathific/app/repository/SequenceItemRepository.java`
```java
package com.pathific.app.repository;

import com.pathific.app.entity.SequenceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SequenceItemRepository extends JpaRepository<SequenceItem, Long> {
    List<SequenceItem> findByCourtIdOrderByOrderIndex(Long courtId);
}
```

### Controller
`src/main/java/com/pathific/app/api/SequenceController.java`
```java
package com.pathific.app.api;

import com.pathific.app.entity.SequenceItem;
import com.pathific.app.repository.SequenceItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sequences")
public class SequenceController {

    private final SequenceItemRepository repo;

    public SequenceController(SequenceItemRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{courtId}")
    public List<SequenceItem> list(@PathVariable Long courtId) {
        return repo.findByCourtIdOrderByOrderIndex(courtId);
    }

    @PostMapping
    public ResponseEntity<SequenceItem> create(@RequestBody SequenceItem item) {
        // enforce uniqueness by courtId + orderIndex
        return ResponseEntity.ok(repo.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SequenceItem> update(@PathVariable Long id, @RequestBody SequenceItem item) {
        return repo.findById(id)
                .map(existing -> {
                    existing.setTitle(item.getTitle());
                    existing.setOrderIndex(item.getOrderIndex());
                    return ResponseEntity.ok(repo.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
```

---

## 🎨 Creator Wizard: Frontend stub

`app/(main)/curate/page.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface SequenceItem {
  id: number;
  title: string;
  orderIndex: number;
}

function DraggableItem({ item, moveItem }: { item: SequenceItem; moveItem: (id: number, dir: number) => void }) {
  const [, drag] = useDrag(() => ({ type: "ITEM", item }));
  return (
    <div ref={drag} className="rounded-xl border border-white/20 bg-white/10 p-4 mb-2 shadow hover:shadow-lg">
      <p className="text-white">{item.title}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => moveItem(item.id, -1)} className="px-2 py-1 bg-sky-500 text-white rounded">↑</button>
        <button onClick={() => moveItem(item.id, 1)} className="px-2 py-1 bg-sky-500 text-white rounded">↓</button>
      </div>
    </div>
  );
}

export default function CreatorWizard() {
  const [items, setItems] = useState<SequenceItem[]>([]);

  useEffect(() => {
    fetch("/api/sequences/1") // example courtId=1
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setItems(data) : setItems([]));
  }, []);

  function moveItem(id: number, dir: number) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx < 0) return prev;
      const newOrder = [...prev];
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
      return newOrder.map((i, index) => ({ ...i, orderIndex: index }));
    });
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Creator Wizard</h1>
        <p className="text-white/70 mb-6">Drag, drop, and sequence your curation items.</p>
        <div>
          {items.map(item => (
            <DraggableItem key={item.id} item={item} moveItem={moveItem} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
```

---

## ✅ Verification loop
1. Apply `005_create_sequence_items.sql`.
2. Restart backend → check `/api/sequences/{courtId}` returns `[]`.
3. Insert sample items via POST.
4. Frontend `/curate` → drag‑and‑drop list appears.
5. Verify order updates.

---

## 🚀 Next steps
- Once Creator Wizard is stable, we can layer **Debates**, **Payments**, **Proof‑of‑Learning**, and **AI helper** on top.  
- Each depends on Creator Wizard’s sequencing to structure content.

---

👉 With this scaffold, you can add Creator Wizard without breaking Courts or Home. Would you like me to extend this with **database migration verification commands** (curl + psql) so you can test end‑to‑end immediately?