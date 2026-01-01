# Pathific MVP aligned to your document with Flutterwave payments

You asked for an opinionated, contract‑first build that matches your document’s spirit—structured micro‑learning, simple progress, and real payments. We’ll keep it lean: Courts → Modules → Module items (series), a star for completion, working links, and Flutterwave Standard checkout for instant demo‑ready payments. Flutterwave supports cards, mobile money (including M‑Pesa), and bank channels with clean docs and quick integration. There’s also a Spring Boot example repo showing the flow end‑to‑end.

---

## Database schema and migrations

- **Court:** id, name, category, slug (unique), summary  
- **Module:** id, courtId (FK), title, summary, orderIndex (unique per court)  
- **ModuleItem:** id, moduleId (FK), title, url, position (unique per module)  
- **Completion:** id, userId, moduleId, completedAt (for star badge)

```sql
-- migrations/004_create_courts.sql
CREATE TABLE IF NOT EXISTS courts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  summary TEXT NOT NULL
);

-- migrations/005_create_modules.sql
CREATE TABLE IF NOT EXISTS modules (
  id BIGSERIAL PRIMARY KEY,
  court_id BIGINT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  order_index INT NOT NULL,
  CONSTRAINT uq_court_order UNIQUE (court_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_modules_court_order ON modules (court_id, order_index);

-- migrations/006_create_module_items.sql
CREATE TABLE IF NOT EXISTS module_items (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  position INT NOT NULL,
  CONSTRAINT uq_module_position UNIQUE (module_id, position)
);
CREATE INDEX IF NOT EXISTS idx_module_items_module_position ON module_items (module_id, position);

-- migrations/007_create_completions.sql
CREATE TABLE IF NOT EXISTS completions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_module UNIQUE (user_id, module_id)
);
```

```bash
docker exec -i pathific_db psql -U pathific -d pathific < migrations/004_create_courts.sql
docker exec -i pathific_db psql -U pathific -d pathific < migrations/005_create_modules.sql
docker exec -i pathific_db psql -U pathific -d pathific < migrations/006_create_module_items.sql
docker exec -i pathific_db psql -U pathific -d pathific < migrations/007_create_completions.sql
```

---

## Backend (Spring Boot) — courts, modules, items, completion, payments

### Security config

```java
// backend/src/main/java/com/pathific/config/SecurityConfig.java
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
        .requestMatchers("/api/modules/**").permitAll()
        .requestMatchers("/api/module-items/**").permitAll()
        .requestMatchers("/api/completions/**").permitAll()
        .requestMatchers("/api/payments/**").permitAll()
        .anyRequest().authenticated()
      );
    return http.build();
  }
}
```

### Courts

```java
// backend/src/main/java/com/pathific/courts/Court.java
package com.pathific.courts;
import jakarta.persistence.*;

@Entity @Table(name="courts")
public class Court {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  private String name; private String category;
  @Column(unique=true) private String slug;
  @Column(columnDefinition="TEXT") private String summary;
  // getters/setters
}
```

```java
// backend/src/main/java/com/pathific/courts/CourtRepository.java
package com.pathific.courts;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CourtRepository extends JpaRepository<Court, Long> {}
```

```java
// backend/src/main/java/com/pathific/courts/CourtController.java
package com.pathific.courts;
import org.springframework.web.bind.annotation.*; import java.util.*;

@RestController @RequestMapping("/api/courts")
public class CourtController {
  private final CourtRepository repo;
  public CourtController(CourtRepository repo){ this.repo=repo; }
  @GetMapping public Map<String,Object> list(){ return Map.of("ok", true, "items", repo.findAll()); }
}
```

### Modules

```java
// backend/src/main/java/com/pathific/modules/Module.java
package com.pathific.modules;
import jakarta.persistence.*;

@Entity
@Table(name="modules",
  uniqueConstraints=@UniqueConstraint(name="uq_court_order", columnNames={"court_id","order_index"})
)
public class Module {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(name="court_id", nullable=false) private Long courtId;
  @Column(nullable=false) private String title;
  @Column(columnDefinition="TEXT") private String summary;
  @Column(name="order_index", nullable=false) private Integer orderIndex;
  // getters/setters
}
```

```java
// backend/src/main/java/com/pathific/modules/ModuleRepository.java
package com.pathific.modules;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ModuleRepository extends JpaRepository<Module, Long> {
  List<Module> findByCourtIdOrderByOrderIndexAsc(Long courtId);
}
```

```java
// backend/src/main/java/com/pathific/modules/ModuleController.java
package com.pathific.modules;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*; import java.util.*;

@RestController @RequestMapping("/api/modules")
public class ModuleController {
  private final ModuleRepository repo;
  public ModuleController(ModuleRepository repo){ this.repo=repo; }

  @GetMapping("/{courtId}") public List<Module> list(@PathVariable Long courtId){
    return repo.findByCourtIdOrderByOrderIndexAsc(courtId);
  }
  @PostMapping("/{courtId}") public ResponseEntity<Module> create(@PathVariable Long courtId, @RequestBody Module body){
    Module m=new Module(); m.setCourtId(courtId); m.setTitle(body.getTitle());
    m.setSummary(body.getSummary()); m.setOrderIndex(body.getOrderIndex());
    return ResponseEntity.ok(repo.save(m));
  }
  @PutMapping("/{id}") public ResponseEntity<Module> update(@PathVariable Long id, @RequestBody Module body){
    return repo.findById(id).map(e->{ if(body.getTitle()!=null)e.setTitle(body.getTitle());
      if(body.getSummary()!=null)e.setSummary(body.getSummary());
      if(body.getOrderIndex()!=null)e.setOrderIndex(body.getOrderIndex());
      return ResponseEntity.ok(repo.save(e)); }).orElseGet(()->ResponseEntity.notFound().build());
  }
  @DeleteMapping("/{id}") public Map<String,Object> delete(@PathVariable Long id){ repo.deleteById(id); return Map.of("ok",true); }
}
```

### Module items

```java
// backend/src/main/java/com/pathific/moduleitems/ModuleItem.java
package com.pathific.moduleitems;
import jakarta.persistence.*;

@Entity
@Table(name="module_items",
  uniqueConstraints=@UniqueConstraint(name="uq_module_position", columnNames={"module_id","position"})
)
public class ModuleItem {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(name="module_id", nullable=false) private Long moduleId;
  @Column(nullable=false) private String title;
  @Column(nullable=false, columnDefinition="TEXT") private String url;
  @Column(nullable=false) private Integer position;
  // getters/setters
}
```

```java
// backend/src/main/java/com/pathific/moduleitems/ModuleItemRepository.java
package com.pathific.moduleitems;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ModuleItemRepository extends JpaRepository<ModuleItem, Long> {
  List<ModuleItem> findByModuleIdOrderByPositionAsc(Long moduleId);
}
```

```java
// backend/src/main/java/com/pathific/moduleitems/ModuleItemController.java
package com.pathific.moduleitems;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*; import java.util.*;

@RestController @RequestMapping("/api/module-items")
public class ModuleItemController {
  private final ModuleItemRepository repo;
  public ModuleItemController(ModuleItemRepository repo){ this.repo=repo; }

  @GetMapping("/{moduleId}") public List<ModuleItem> list(@PathVariable Long moduleId){
    return repo.findByModuleIdOrderByPositionAsc(moduleId);
  }
  @PostMapping("/{moduleId}") public ResponseEntity<ModuleItem> create(@PathVariable Long moduleId, @RequestBody ModuleItem body){
    ModuleItem mi=new ModuleItem(); mi.setModuleId(moduleId); mi.setTitle(body.getTitle());
    mi.setUrl(body.getUrl()); mi.setPosition(body.getPosition());
    return ResponseEntity.ok(repo.save(mi));
  }
  @PutMapping("/{id}") public ResponseEntity<ModuleItem> update(@PathVariable Long id, @RequestBody ModuleItem body){
    return repo.findById(id).map(e->{ if(body.getTitle()!=null)e.setTitle(body.getTitle());
      if(body.getUrl()!=null)e.setUrl(body.getUrl());
      if(body.getPosition()!=null)e.setPosition(body.getPosition());
      return ResponseEntity.ok(repo.save(e)); }).orElseGet(()->ResponseEntity.notFound().build());
  }
  @DeleteMapping("/{id}") public Map<String,Object> delete(@PathVariable Long id){ repo.deleteById(id); return Map.of("ok",true); }
}
```

### Completion (star badge)

```java
// backend/src/main/java/com/pathific/completions/Completion.java
package com.pathific.completions;
import jakarta.persistence.*; import java.time.Instant;

@Entity @Table(name="completions",
  uniqueConstraints=@UniqueConstraint(name="uq_user_module", columnNames={"user_id","module_id"})
)
public class Completion {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(name="user_id", nullable=false) private Long userId;
  @Column(name="module_id", nullable=false) private Long moduleId;
  @Column(name="completed_at", nullable=false) private Instant completedAt = Instant.now();
  // getters/setters
}
```

```java
// backend/src/main/java/com/pathific/completions/CompletionRepository.java
package com.pathific.completions;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface CompletionRepository extends JpaRepository<Completion, Long> {
  Optional<Completion> findByUserIdAndModuleId(Long userId, Long moduleId);
}
```

```java
// backend/src/main/java/com/pathific/completions/CompletionController.java
package com.pathific.completions;
import org.springframework.web.bind.annotation.*; import java.util.*;

@RestController @RequestMapping("/api/completions")
public class CompletionController {
  private final CompletionRepository repo;
  public CompletionController(CompletionRepository repo){ this.repo=repo; }

  @PostMapping public Map<String,Object> complete(@RequestBody Map<String,Object> body){
    Long userId = Long.valueOf(String.valueOf(body.get("userId")));
    Long moduleId = Long.valueOf(String.valueOf(body.get("moduleId")));
    repo.findByUserIdAndModuleId(userId, moduleId).orElseGet(() -> {
      Completion c = new Completion(); c.setUserId(userId); c.setModuleId(moduleId); return repo.save(c);
    });
    return Map.of("ok", true);
  }
}
```

### Flutterwave Standard (quick checkout)

- **Approach:** Use Flutterwave Standard—redirect to hosted checkout with amount, currency, and customer details; handle webhook for confirmation. Docs are clear and support mobile money/M‑Pesa via unified APIs. A Spring Boot example exists for reference.

```java
// backend/src/main/java/com/pathific/payments/FlutterwaveController.java
package com.pathific.payments;

import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController @RequestMapping("/api/payments")
public class FlutterwaveController {
  private final RestTemplate http = new RestTemplate();

  private final String secretKey = System.getenv().getOrDefault("FLW_SECRET_KEY", "FLWSECK_TEST-xxxx");
  private final String redirectUrl = System.getenv().getOrDefault("FLW_REDIRECT_URL", "http://localhost:3000/payment/complete");

  @PostMapping("/checkout")
  public ResponseEntity<Map<String,Object>> checkout(@RequestBody Map<String,Object> body) {
    String amount = String.valueOf(body.getOrDefault("amount", "50"));
    String currency = String.valueOf(body.getOrDefault("currency", "KES"));
    String email = String.valueOf(body.getOrDefault("email", "demo@pathific.local"));
    String phone = String.valueOf(body.getOrDefault("phone", "254700000000"));
    String name = String.valueOf(body.getOrDefault("name", "Pathific Demo"));

    Map<String,Object> payload = Map.of(
      "tx_ref", "PATHIFIC-"+UUID.randomUUID(),
      "amount", amount,
      "currency", currency,
      "redirect_url", redirectUrl,
      "customer", Map.of("email", email, "phonenumber", phone, "name", name),
      "customizations", Map.of("title", "Pathific", "description", "Structured micro‑learning")
    );

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(secretKey);

    HttpEntity<Map<String,Object>> req = new HttpEntity<>(payload, headers);
    // Flutterwave v3 standard payments endpoint
    ResponseEntity<Map> res = http.postForEntity("https://api.flutterwave.com/v3/payments", req, Map.class);
    Map<String,Object> data = (Map<String,Object>) ((Map<String,Object>)res.getBody()).get("data");
    String link = String.valueOf(data.get("link"));
    return ResponseEntity.ok(Map.of("ok", true, "link", link));
  }

  @PostMapping("/webhook")
  public ResponseEntity<Map<String,Object>> webhook(@RequestHeader("verif-hash") String hash, @RequestBody Map<String,Object> payload) {
    // Verify hash equals your secret hash (set in Flutterwave dashboard)
    // Update payment status in DB if verified
    return ResponseEntity.ok(Map.of("ok", true));
  }
}
```

- **Why this path:** Hosted checkout is fastest to demo and supports multiple rails (cards, mobile money, M‑Pesa) with minimal code. The Spring Boot example shows similar patterns for v3 integration.

---

## Frontend (Next.js, app router) — courts, curator, series, completion star, payments

### Install DnD Kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Courts page

```tsx
// frontend/ui/app/main/courts/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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
```

### Curate modules (order)

```tsx
// frontend/ui/app/curate/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Module { id:number; courtId:number; title:string; summary?:string; orderIndex:number; completed?:boolean; }

function Row({ m, onComplete }: { m:Module; onComplete:(id:number)=>void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: m.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 mb-3 shadow hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">{m.title}</p>
          {m.summary && <p className="text-xs text-white/60 mt-1">{m.summary}</p>}
          <p className="text-xs text-white/50 mt-2">Order: {m.orderIndex}</p>
          <a href={`/curate/module?module=${m.id}`} className="mt-2 inline-block rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10">Edit series</a>
        </div>
        <button onClick={()=>onComplete(m.id)} className="ml-4 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-1 text-white font-semibold shadow hover:opacity-90">
          {m.completed ? "★ Completed" : "Mark complete"}
        </button>
      </div>
    </div>
  );
}

export default function CurateModulesPage() {
  const params = useSearchParams(); const courtId = Number(params.get("court") ?? 1);
  const [modules, setModules] = useState<Module[]>([]); const [saving, setSaving] = useState(false);

  useEffect(()=>{ (async()=>{
    const res=await fetch(`/api/modules/${courtId}`); const data:Module[]=await res.json();
    setModules(Array.isArray(data)?data:[]);
  })(); },[courtId]);

  const ids = useMemo(()=>modules.map(m=>m.id),[modules]);

  function onDragEnd(e:DragEndEvent){
    const {active, over}=e; if(!over || active.id===over.id) return;
    const oldIndex=modules.findIndex(m=>m.id===active.id); const newIndex=modules.findIndex(m=>m.id===over.id);
    const next=arrayMove(modules, oldIndex, newIndex).map((m,idx)=>({...m, orderIndex:idx})); setModules(next);
  }

  async function saveOrder(){
    setSaving(true);
    await Promise.all(modules.map(m=>fetch(`/api/modules/${m.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title:m.title, summary:m.summary, orderIndex:m.orderIndex })})));
    setSaving(false); alert("Order saved");
  }

  async function addModule(title:string, summary?:string){
    const res=await fetch(`/api/modules/${courtId}`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title, summary, orderIndex: modules.length })});
    const created:Module=await res.json(); setModules(prev=>[...prev, created]);
  }

  async function deleteModule(id:number){
    await fetch(`/api/modules/${id}`,{method:"DELETE"}); setModules(prev=>prev.filter(m=>m.id!==id).map((m,idx)=>({...m, orderIndex:idx})));
  }

  async function markComplete(moduleId:number){
    await fetch(`/api/completions`,{method:"POST",headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId:1, moduleId })});
    setModules(prev=>prev.map(m=>m.id===moduleId? {...m, completed:true}:m));
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Curate Modules</h1>
      <div className="mb-6 flex gap-3">
        <input id="new-title" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="Module title" />
        <input id="new-summary" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="Optional summary" />
        <button onClick={()=>{
          const t=(document.getElementById("new-title") as HTMLInputElement).value.trim();
          const s=(document.getElementById("new-summary") as HTMLInputElement).value.trim();
          if(!t) return alert("Provide title"); addModule(t, s||undefined);
        }} className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-semibold shadow hover:opacity-90">Add module</button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div>
            {modules.map(m=>(
              <div key={m.id}>
                <Row m={m} onComplete={markComplete} />
                <div className="flex justify-end mb-4">
                  <button onClick={()=>deleteModule(m.id)} className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button onClick={saveOrder} disabled={saving} className="mt-6 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-60">
        {saving? "Saving..." : "Save Order"}
      </button>
    </div>
  );
}
```

### Curate module items (series)

```tsx
// frontend/ui/app/curate/module/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Item { id:number; moduleId:number; title:string; url:string; position:number; }

function Row({ i }: { i:Item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: i.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="group rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 mb-3 shadow hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing">
      <p className="text-white font-semibold">{i.title}</p>
      <p className="text-xs text-white/50 mt-2">Position: {i.position}</p>
      <a href={i.url} target="_blank" rel="noreferrer" className="text-sky-300 text-xs mt-2 inline-block hover:underline">Open link</a>
    </div>
  );
}

export default function CurateModuleItemsPage() {
  const params=useSearchParams(); const moduleId=Number(params.get("module") ?? 0);
  const [items,setItems]=useState<Item[]>([]); const [saving,setSaving]=useState(false);

  useEffect(()=>{ if(!moduleId) return; (async()=>{
    const res=await fetch(`/api/module-items/${moduleId}`); const data:Item[]=await res.json();
    setItems(Array.isArray(data)?data:[]);
  })(); },[moduleId]);

  const ids=useMemo(()=>items.map(i=>i.id),[items]);

  function onDragEnd(e:DragEndEvent){
    const {active,over}=e; if(!over || active.id===over.id) return;
    const oldIndex=items.findIndex(i=>i.id===active.id); const newIndex=items.findIndex(i=>i.id===over.id);
    const next=arrayMove(items, oldIndex, newIndex).map((i,idx)=>({...i, position:idx})); setItems(next);
  }

  async function saveOrder(){
    setSaving(true);
    await Promise.all(items.map(i=>fetch(`/api/module-items/${i.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title:i.title, url:i.url, position:i.position })})));
    setSaving(false); alert("Order saved");
  }

  async function addItem(title:string, url:string){
    const res=await fetch(`/api/module-items/${moduleId}`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ title, url, position: items.length })});
    const created:Item=await res.json(); setItems(prev=>[...prev, created]);
  }

  async function deleteItem(id:number){
    await fetch(`/api/module-items/${id}`,{method:"DELETE"});
    setItems(prev=>prev.filter(i=>i.id!==id).map((i,idx)=>({...i, position:idx})));
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Curate Series</h1>
      <div className="mb-6 flex gap-3">
        <input id="new-title" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="Video title" />
        <input id="new-url" className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white" placeholder="https://youtu.be/..." />
        <button onClick={()=>{
          const t=(document.getElementById("new-title") as HTMLInputElement).value.trim();
          const u=(document.getElementById("new-url") as HTMLInputElement).value.trim();
          if(!t||!u) return alert("Provide title and URL"); addItem(t,u);
        }} className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white font-semibold shadow hover:opacity-90">Add video</button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div>
            {items.map(i=>(
              <div key={i.id}>
                <Row i={i} />
                <div className="flex justify-end mb-4">
                  <button onClick={()=>deleteItem(i.id)} className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button onClick={saveOrder} disabled={saving} className="mt-6 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-60">
        {saving? "Saving..." : "Save Order"}
      </button>
    </div>
  );
}
```

---

## Seed data and verification loop

- **Seed:**

```bash
docker exec -it pathific_db psql -U pathific -d pathific -c \
"INSERT INTO courts (name, category, slug, summary) VALUES
('Creator Economics','Business','creator-economics','Insights and playbooks'),
('AI Craft','Technology','ai-craft','Applied AI, tooling and practice');"

docker exec -it pathific_db psql -U pathific -d pathific -c \
"INSERT INTO modules (court_id, title, summary, order_index) VALUES
(1,'Intro','Foundations',0),(1,'Pricing','Tiers & value',1);"

docker exec -it pathific_db psql -U pathific -d pathific -c \
"INSERT INTO module_items (module_id, title, url, position) VALUES
(1,'What is creator economics?','https://youtu.be/abc',0),
(1,'History & trends','https://youtu.be/def',1),
(2,'Pricing psychology','https://youtu.be/ghi',0);"
```

- **Backend:**
  - **Health:** `curl http://localhost:8080/actuator/health` → UP
  - **Courts:** `curl http://localhost:8080/api/courts` → `{ ok, items }`
  - **Modules:** `curl http://localhost:8080/api/modules/1` → ordered modules
  - **Items:** `curl http://localhost:8080/api/module-items/1` → ordered items
  - **Payments:** `POST /api/payments/checkout` returns `{ ok, link }` (redirect to hosted checkout)

- **Frontend:**
  - `/main/courts` → cards render; Curate + Pay buttons work.
  - `/curate?court=1` → drag modules, add/delete, save order, mark complete (★).
  - `/curate/module?module={id}` → drag series items, add/delete, save order.

---

## Why this matches your document and stays moat‑friendly

- **Structured micro‑learning:** Courts → Modules → Series, not loose playlists.
- **Progress tracking:** Simple star badge via completion endpoint—clean and demo‑ready.
- **Monetization:** Flutterwave Standard checkout—fast, multi‑rail (cards, mobile money/M‑Pesa) with hosted flow. A Spring Boot example exists to mirror patterns if needed.
- **Mobile‑first:** Lightweight UI, short modules, clear progress—aligned with emerging markets focus.

> Flutterwave docs provide the Standard checkout and API references for quick integration; the Spring Boot example shows v3 integration patterns you can adapt directly.

If you want, I can add a minimal “Pathway view” page to show modules with ★ badges and “Start learning” links—so your demo feels complete end‑to‑end.