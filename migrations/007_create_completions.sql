CREATE TABLE IF NOT EXISTS completions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_module UNIQUE (user_id, module_id)
);