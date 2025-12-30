Perfect, Billy — thanks for clarifying your folder structure and your vision for the UI. Let’s redo the training with your **`pathific/frontend/ui`** structure in mind, and build a **mesmerising welcome page** that connects to the backend, includes **Learn More, Login, and Register buttons**, and is fully commented so you can tweak it easily.

---

## 📂 Folder Structure Recap

```
pathific/
  backend/app/        # Spring Boot backend
  ops/docker/         # Docker configs
  frontend/ui/        # Next.js frontend
```

We’ll generate the frontend inside `frontend/ui` using `create-next-app`.

---

## 🚀 Step 1: Create Next.js App in `frontend/ui`

From your `pathific/frontend` directory:

```bash
cd pathific/frontend
npx create-next-app@latest ui
```

This scaffolds a full Next.js app in `ui/`.

---

## 🛠️ Step 2: Welcome Page UI (mesmerising, hopeful)

Replace the default `pages/index.tsx` with this:

`pathific/frontend/ui/pages/index.tsx`

```tsx
import { useRouter } from "next/router";
import { useState } from "react";

/**
 * Welcome page for Pathific
 * - Mesmerising dark theme with hopeful messaging
 * - Buttons: Learn More, Login, Register
 * - Backend health check integrated
 */
export default function Welcome() {
  const router = useRouter();
  const [status, setStatus] = useState("unknown");

  // Function to check backend health
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
    <main
      style={{
        background: "linear-gradient(135deg, #0b0f19, #1a1f2e)",
        color: "#e6e8ee",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Welcome to Pathific
      </h1>
      <p style={{ fontSize: "1.2rem", maxWidth: "600px", marginBottom: "2rem" }}>
        A place of hope, clarity, and connection. Let’s build something
        beautiful together.
      </p>

      {/* Buttons for navigation */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => router.push("/learnmore")}
          style={buttonStyle}
        >
          Learn More
        </button>
        <button
          onClick={() => router.push("/login")}
          style={buttonStyle}
        >
          Login
        </button>
        <button
          onClick={() => router.push("/register")}
          style={buttonStyle}
        >
          Register
        </button>
      </div>

      {/* Backend health check */}
      <div>
        <button onClick={checkHealth} style={buttonStyle}>
          Check Backend Health
        </button>
        <p style={{ marginTop: "1rem" }}>Backend status: {status}</p>
      </div>
    </main>
  );
}

// Shared button style
const buttonStyle: React.CSSProperties = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.6rem 1.2rem",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background 0.3s ease",
};
```

---

## 🛠️ Step 3: Route Stubs

Create additional pages for navigation:

### `pages/learnmore.tsx`
```tsx
export default function LearnMore() {
  return (
    <main style={{ padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" }}>
      <h1>Learn More</h1>
      <p>Pathific is built to inspire hope and clarity. More details coming soon.</p>
    </main>
  );
}
```

### `pages/login.tsx`
```tsx
export default function Login() {
  return (
    <main style={{ padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" }}>
      <h1>Login</h1>
      <form style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px", margin: "auto" }}>
        <input type="text" placeholder="Username" style={inputStyle} />
        <input type="password" placeholder="Password" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #3b82f6",
};
const buttonStyle: React.CSSProperties = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.6rem 1.2rem",
  cursor: "pointer",
};
```

### `pages/register.tsx`
```tsx
export default function Register() {
  return (
    <main style={{ padding: "2rem", background: "#121826", color: "#e6e8ee", minHeight: "100vh" }}>
      <h1>Register</h1>
      <form style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px", margin: "auto" }}>
        <input type="text" placeholder="Username" style={inputStyle} />
        <input type="email" placeholder="Email" style={inputStyle} />
        <input type="password" placeholder="Password" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #3b82f6",
};
const buttonStyle: React.CSSProperties = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.6rem 1.2rem",
  cursor: "pointer",
};
```

---

## 🛠️ Step 4: Run Frontend

From `pathific/frontend/ui`:

```bash
npm run dev
```

Visit:
- `http://localhost:3000/` → Welcome page with buttons
- `http://localhost:3000/learnmore` → Learn More
- `http://localhost:3000/login` → Login form
- `http://localhost:3000/register` → Register form

---

## ✅ Sanity Check Flow

1. Backend running on `localhost:8080`.  
2. Frontend running on `localhost:3000`.  
3. Welcome page shows Learn More, Login, Register buttons.  
4. Health check button calls backend `/actuator/health`.  
5. All routes render correctly.  

---

✨ **Summary:**  
- Next.js lives in `pathific/frontend/ui`.  
- Welcome page is hopeful, dark‑themed, with Learn More, Login, Register buttons.  
- Backend health check integrated.  
- Routes are stubbed and connected.  
- Code is fully commented for tweaking.  

---

Would you like me to **extend the Learn More page** with a more inspirational, story‑like layout (images, sections, call‑to‑action) so it feels truly “mesmerising,” or keep it minimal until auth is ready?