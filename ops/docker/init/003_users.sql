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
