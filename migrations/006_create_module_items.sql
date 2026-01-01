CREATE TABLE IF NOT EXISTS module_items (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  position INT NOT NULL,
  CONSTRAINT uq_module_position UNIQUE (module_id, position)
);
CREATE INDEX IF NOT EXISTS idx_module_items_module_position ON module_items (module_id, position);
