Verification flow
DB: docker compose up -d db, connect via VS Code to localhost:5433, confirm learn_items rows exist.

Backend: docker compose up -d backend or run locally with mvn spring-boot:run.

Frontend: npm run dev in pathific/frontend/ui.

Visit:

/ → Welcome loads with typewriter headline and CTAs.

/auth/register → verbose form compiles.

/auth/login → fixed page compiles.

/learnmore → dynamic list from DB via /api/learnmore.

Notes and next steps
Your original Welcome was already strong. Keep it minimal and fast. Only add framer/three when you want more motion depth.

Next: wire registration form to backend users table (id, name, email, password, city, level, role), add validation, then add login with JWT + Spring Security and protect /home.

If you want the frontend and backend up together: add a web service to docker-compose and a separate Dockerfile for ui, or run them separately during development.

If you want me to generate the users schema, Spring Security config, and the minimal JWT auth flows next, say “proceed to auth.”