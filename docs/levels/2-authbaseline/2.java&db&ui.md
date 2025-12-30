# Auth baseline: database, backend (Spring), and frontend integration

We’ll add universal auth with minimal JWT, password hashing, and role-based access. This sticks to your current structure: Next.js App Router at `frontend/ui/app`, Postgres init scripts in `ops/docker/init`, and Spring Boot backend in `backend/app`.

---

## Database migrations (ops/docker/init)

Add users and sessions tables. You mentioned `learn_items` is `002`; we’ll create `003_users.sql`.

### ops/docker/init/003_users.sql

```sql
-- Users table with fields required for access control and profiling
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- requires pgcrypto; if not available, switch to SERIAL
  external_id TEXT,                              -- optional human-readable ID you collect
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                   -- bcrypt hash
  city TEXT,
  level TEXT,
  role TEXT NOT NULL DEFAULT 'user',             -- 'user' | 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional session tokens table (for manual invalidation if needed)
CREATE TABLE IF NOT EXISTS user_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Seed an example user (email/password for dev only; replace in prod)
-- Password is bcrypt for 'password123' (example hash; you'll generate at runtime when registering)
-- You can also skip seeding and register via API.
```

> If `gen_random_uuid()` isn’t available, enable `pgcrypto` extension or change `id` to `SERIAL`.

Enable pgcrypto if needed:

### ops/docker/init/001_extensions.sql

```sql
-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## Backend Spring Boot (backend/app)

We’ll add Spring Security + JWT (jjwt), registration + login endpoints, password hashing, and protected routes. Your Learn More endpoint remains public unless you choose otherwise.

### pom.xml (add security and JWT)

```xml
<dependencies>
  <!-- existing deps -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
```

### src/main/resources/application.yml (JWT and CORS)

```yaml
server:
  port: 8080
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5433/pathific}
    username: ${SPRING_DATASOURCE_USERNAME:pathific}
    password: ${SPRING_DATASOURCE_PASSWORD:pathific_pass}
  jdbc:
    template:
      fetch-size: 100

app:
  jwt:
    secret: ${APP_JWT_SECRET:change-me-in-env}
    issuer: pathific
    expiresMinutes: 120

# CORS for local dev (Next.js on 3000)
# If using Next rewrites (/api -> backend), CORS is less relevant, but keep middleware-friendly defaults
```

Set `APP_JWT_SECRET` in your environment or Docker compose for backend.

### src/main/java/com/pathific/app/security/JwtService.java

```java
package com.pathific.app.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

public class JwtService {
  private final SecretKey key;
  private final String issuer;
  private final long expiresMinutes;

  public JwtService(String secret, String issuer, long expiresMinutes) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
    this.issuer = issuer;
    this.expiresMinutes = expiresMinutes;
  }

  public String generateToken(String subject, Map<String, Object> claims) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(expiresMinutes * 60);
    return Jwts.builder()
      .setIssuer(issuer)
      .setSubject(subject)
      .addClaims(claims)
      .setIssuedAt(Date.from(now))
      .setExpiration(Date.from(exp))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  public io.jsonwebtoken.Claims parse(String token) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
  }
}
```

### src/main/java/com/pathific/app/security/SecurityConfig.java

```java
package com.pathific.app.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public JwtService jwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.issuer}") String issuer,
      @Value("${app.jwt.expiresMinutes}") long expiresMinutes
  ) {
    return new JwtService(secret, issuer, expiresMinutes);
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable()) // using stateless JWT
      .cors(Customizer.withDefaults())
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/actuator/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/learnmore").permitAll()
        .requestMatchers("/api/auth/**").permitAll()
        .anyRequest().authenticated()
      )
      .httpBasic(basic -> basic.disable())
      .formLogin(form -> form.disable());

    return http.build();
  }
}
```

> We’re permitting `/api/learnmore` and `/api/auth/*`; other endpoints will require Bearer tokens. A JWT filter could be added to fully validate on every request. For a minimal baseline, we’ll expose a `/api/me` endpoint that requires Authorization and demonstrates verification.

### src/main/java/com/pathific/app/users/UserRepository.java

```java
package com.pathific.app.users;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public class UserRepository {
  private final JdbcTemplate jdbc;

  public UserRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public void createUser(String externalId, String name, String email, String passwordHash, String city, String level, String role) {
    jdbc.update(
      "INSERT INTO users(external_id, name, email, password_hash, city, level, role) VALUES (?,?,?,?,?,?,?)",
      externalId, name, email, passwordHash, city, level, role
    );
  }

  public Map<String, Object> findByEmail(String email) {
    try {
      return jdbc.queryForMap("SELECT id, external_id, name, email, password_hash, city, level, role FROM users WHERE email = ?", email);
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }
}
```

### src/main/java/com/pathific/app/api/AuthController.java

```java
package com.pathific.app.api;

import com.pathific.app.security.JwtService;
import com.pathific.app.users.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
    this.users = users;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  @PostMapping("/register")
  public Map<String, Object> register(@RequestBody Map<String, String> body) {
    String externalId = body.getOrDefault("id", null);
    String name = body.get("name");
    String email = body.get("email");
    String password = body.get("password");
    String confirm = body.getOrDefault("confirmPassword", password);
    String city = body.getOrDefault("city", null);
    String level = body.getOrDefault("level", null);
    String role = body.getOrDefault("role", "user");

    if (name == null || email == null || password == null) {
      return Map.of("ok", false, "error", "Missing required fields");
    }
    if (!password.equals(confirm)) {
      return Map.of("ok", false, "error", "Passwords do not match");
    }
    if (users.findByEmail(email) != null) {
      return Map.of("ok", false, "error", "Email already registered");
    }

    String hash = encoder.encode(password);
    users.createUser(externalId, name, email, hash, city, level, role);

    Map<String, Object> claims = Map.of("email", email, "role", role, "name", name);
    String token = jwt.generateToken(email, claims);

    return Map.of("ok", true, "token", token);
  }

  @PostMapping("/login")
  public Map<String, Object> login(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    String password = body.get("password");

    if (email == null || password == null) {
      return Map.of("ok", false, "error", "Missing credentials");
    }

    Map<String, Object> user = users.findByEmail(email);
    if (user == null) {
      return Map.of("ok", false, "error", "Invalid credentials");
    }

    String hash = (String) user.get("password_hash");
    String role = (String) user.get("role");
    String name = (String) user.get("name");

    if (!encoder.matches(password, hash)) {
      return Map.of("ok", false, "error", "Invalid credentials");
    }

    Map<String, Object> claims = Map.of("email", email, "role", role, "name", name);
    String token = jwt.generateToken(email, claims);

    return Map.of("ok", true, "token", token);
  }
}
```

### src/main/java/com/pathific/app/api/MeController.java (protected example)

```java
package com.pathific.app.api;

import com.pathific.app.security.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class MeController {
  private final JwtService jwt;

  public MeController(JwtService jwt) {
    this.jwt = jwt;
  }

  @GetMapping("/api/me")
  public Map<String, Object> me(HttpServletRequest request) {
    String auth = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (auth == null || !auth.startsWith("Bearer ")) {
      return Map.of("ok", false, "error", "Missing token");
    }
    String token = auth.substring(7);
    try {
      Claims claims = jwt.parse(token);
      return Map.of("ok", true, "email", claims.get("email"), "role", claims.get("role"), "name", claims.get("name"));
    } catch (Exception e) {
      return Map.of("ok", false, "error", "Invalid token");
    }
  }
}
```

> In a full implementation, add a JWT authentication filter to set `SecurityContext`. This minimal example demonstrates token parsing and can be extended.

---

## Frontend: wire registration, login, and home

With rewrites in `next.config.js`, calls to `/api/*` hit the backend.

### app/auth/register/page.tsx (POST to backend)

```tsx
"use client";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    level: "",
    role: "user"
  });
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.ok) {
        localStorage.setItem("pathific_token", json.token);
        window.location.href = "/home";
      } else {
        setError(json.error || "Registration failed");
      }
    } catch {
      setError("Network error");
    }
  }

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  return (
    <main style={mainStyle}>
      <nav style={navStyle}>
        <span style={logoStyle}>🌌 Pathific</span>
        <Link href="/learnmore" style={linkStyle}>Learn More</Link>
      </nav>

      <h1>Register</h1>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      <form style={formStyle} onSubmit={submit}>
        <input value={form.id} onChange={e => setField("id", e.target.value)} type="text" placeholder="ID" style={inputStyle} />
        <input value={form.name} onChange={e => setField("name", e.target.value)} type="text" placeholder="Name" style={inputStyle} />
        <input value={form.email} onChange={e => setField("email", e.target.value)} type="email" placeholder="Email" style={inputStyle} />
        <input value={form.password} onChange={e => setField("password", e.target.value)} type="password" placeholder="Password" style={inputStyle} />
        <input value={form.confirmPassword} onChange={e => setField("confirmPassword", e.target.value)} type="password" placeholder="Confirm Password" style={inputStyle} />
        <input value={form.city} onChange={e => setField("city", e.target.value)} type="text" placeholder="City" style={inputStyle} />
        <input value={form.level} onChange={e => setField("level", e.target.value)} type="text" placeholder="Level" style={inputStyle} />
        <input value={form.role} onChange={e => setField("role", e.target.value)} type="text" placeholder="Role (user/admin)" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
    </main>
  );
}

const mainStyle = { padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" };
const navStyle = { display: "flex", justifyContent: "space-between", marginBottom: "2rem" };
const logoStyle = { fontWeight: "bold", color: "#3b82f6" };
const linkStyle = { color: "#f5f5f5", textDecoration: "none" };
const formStyle = { display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "420px", margin: "auto" };
const inputStyle = { padding: "0.6rem", borderRadius: "6px", border: "1px solid #3b82f6" };
const buttonStyle = { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem" };
```

### app/auth/login/page.tsx (POST to backend)

```tsx
"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.ok) {
        localStorage.setItem("pathific_token", json.token);
        window.location.href = "/home";
      } else {
        setError(json.error || "Login failed");
      }
    } catch {
      setError("Network error");
    }
  }

  return (
    <main style={mainStyle}>
      <nav style={navStyle}>
        <span style={logoStyle}>🌌 Pathific</span>
        <Link href="/learnmore" style={linkStyle}>Learn More</Link>
      </nav>

      <h1>Login</h1>
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      <form style={formStyle} onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </main>
  );
}

const mainStyle = { padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" };
const navStyle = { display: "flex", justifyContent: "space-between", marginBottom: "2rem" };
const logoStyle = { fontWeight: "bold", color: "#3b82f6" };
const linkStyle = { color: "#f5f5f5", textDecoration: "none" };
const formStyle = { display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px", margin: "auto" };
const inputStyle = { padding: "0.6rem", borderRadius: "6px", border: "1px solid #3b82f6" };
const buttonStyle = { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem" };
```

### app/home/page.tsx (protected client view)

```tsx
"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("pathific_token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.ok) setMe(json);
        else setError(json.error || "Unauthorized");
      } catch {
        setError("Network error");
      }
    })();
  }, []);

  if (error) return <main style={mainStyle}><p>{error}</p></main>;
  if (!me) return <main style={mainStyle}><p>Loading...</p></main>;

  return (
    <main style={mainStyle}>
      <h1>Welcome, {me.name}</h1>
      <p>Role: {me.role}</p>
      <p>Email: {me.email}</p>
    </main>
  );
}

const mainStyle = { padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" };
```

---

## Verification checklist

- Database:
  - Ensure `001_extensions.sql`, `002_learn_items.sql`, `003_users.sql` exist in `ops/docker/init`.
  - Run: `docker compose -f ops/docker/docker-compose.yml up --build -d`
  - Connect VS Code to `localhost:5433` and confirm tables created.

- Backend:
  - Set `APP_JWT_SECRET` environment (compose or local).
  - Run backend (compose or `mvn spring-boot:run`).
  - Test endpoints:
    - POST `/api/auth/register` → returns `token`.
    - POST `/api/auth/login` → returns `token`.
    - GET `/api/me` with `Authorization: Bearer <token>` → returns user info.
    - GET `/api/learnmore` → returns items list.

- Frontend:
  - `npm run dev` in `frontend/ui`.
  - Register → redirect to `/home` (token saved).
  - Login → redirect to `/home`.
  - `/learnmore` → dynamic content from DB.

---

If you want to harden this next, we’ll add:

- A JWT filter to `SecurityFilterChain` that sets `SecurityContext` from Bearer tokens.
- Role-based method security (`@PreAuthorize("hasRole('ADMIN')")`).
- Proper CORS config for production and removal of direct token handling in components (use context or a small client library).

Say “harden auth” and I’ll extend this with those guards while keeping it clean and reproducible.