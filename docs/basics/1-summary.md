Got it — let’s turn your rough understanding into a **clear, reproducible training report**. I’ll keep it plain, structured, and comprehensive so you can drop it into a `doc/` folder as a living “cheat sheet.” Then we’ll move on to the **welcome page** setup.

---

## 📘 Pathific Setup Report (for Reproduction & Training)

### 1. Core Understanding
- **Docker made DB**: The Postgres database is not installed directly on your laptop. Instead, Docker pulls the official Postgres image (`postgres:16-alpine`) and runs it inside a container.
- **Repo sent data to DB**: Your Spring Boot backend connects to that containerized Postgres using JDBC. When you hit `/hello`, the backend inserts and reads from the DB.
- **Port conflict**: The error happened because your host already had Postgres running on port **5432**. Docker tried to map the container’s 5432 to host 5432, but the host port was already in use. Solution: map container 5432 → host **5433** (or any free port).

---

### 2. Docker Compose Cheat Sheet
**File:** `ops/docker/docker-compose.yml`

```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    container_name: pathific_db
    environment:
      POSTGRES_DB: pathific
      POSTGRES_USER: pathific
      POSTGRES_PASSWORD: pathific_pass
    ports:
      - "5433:5432"   # host:container
    volumes:
      - pathific_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "pathific"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ../../backend/app
      dockerfile: Dockerfile
    container_name: pathific_backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/pathific
      SPRING_DATASOURCE_USERNAME: pathific
      SPRING_DATASOURCE_PASSWORD: pathific_pass
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"

volumes:
  pathific_db_data:
```

**Commands:**
- Start:  
  ```bash
  docker compose -f ops/docker/docker-compose.yml up --build -d
  ```
- Stop:  
  ```bash
  docker compose -f ops/docker/docker-compose.yml down
  ```
- Logs:  
  ```bash
  docker logs pathific_db --tail=50
  ```
- Prune (delete containers, volumes, networks):  
  ```bash
  docker system prune -a
  ```

---

### 3. VS Code DB Extension Cheat Sheet
- **Host:** `localhost`
- **Port:** `5433`
- **Database:** `pathific`
- **Username:** `pathific`
- **Password:** `pathific_pass`

Steps:
1. Install “PostgreSQL” or “SQLTools + PostgreSQL Driver” extension.
2. Add a new connection with the above credentials.
3. Test with:
   ```sql
   SELECT NOW();
   ```

---

### 4. Backend Cheat Sheet
- **Run locally (without Docker):**
  ```bash
  cd backend/app
  mvn spring-boot:run
  ```
- **Endpoints:**
  - `http://localhost:8080/actuator/health` → should return `{"status":"UP"}`
  - `http://localhost:8080/hello` → returns “Hello, Pathific!” (if you kept the hello code)

---

### 5. Welcome Page (Next Step)
Now that DB + backend are stable, we move to the **frontend welcome page**.  
This page will:
- Render a simple dark‑themed welcome screen.
- Call backend `/actuator/health` to confirm connectivity.
- Not use the `/hello` endpoint (you can delete it if you want).

**Frontend files:**

`frontend/web/package.json`
```json
{
  "name": "pathific-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.6",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

`frontend/web/pages/index.tsx`
```tsx
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("unknown");

  async function checkHealth() {
    try {
      const res = await fetch("http://localhost:8080/actuator/health");
      const data = await res.json();
      setStatus(data.status ?? "unknown");
    } catch {
      setStatus("down");
    }
  }

  return (
    <main style={{ background: "#0b0f19", color: "#e6e8ee", minHeight: "100vh", padding: "2rem" }}>
      <h1>Welcome to Pathific</h1>
      <p>This is the baseline setup. Backend health check below:</p>
      <button onClick={checkHealth}>Check Backend Health</button>
      <p>Status: {status}</p>
    </main>
  );
}
```

`frontend/web/Dockerfile`
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm","start"]
```

Update `docker-compose.yml` to include the frontend:

```yaml
  web:
    build:
      context: ../../frontend/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

### 6. Sanity Check Flow
1. Run `docker compose up -d`.
2. Visit `http://localhost:3000` → Welcome page loads.
3. Click “Check Backend Health” → Should show `UP`.
4. Confirm DB is accessible via VS Code.

---

### 7. Should you delete `/hello`?
- **Yes, if you want a clean slate.** The welcome page doesn’t depend on `/hello`.  
- Keep `/actuator/health` as the universal baseline check.  
- Later, when we add auth and real modules, we’ll introduce new endpoints.

---

✅ **Summary:**  
Your understanding is correct: Docker manages the DB, backend talks to it, port conflicts happen if host Postgres is already on 5432. Use 5433 mapping. Document progress in `doc/`. Next step is the **welcome page**, which uses `/actuator/health` instead of `/hello`.

---

Would you like me to **draft the first `doc/SETUP.md` file** with all these cheat sheets formatted for easy reference? That way you can commit it to your repo and build your documentation habit from day one.