CREATE TABLE IF NOT EXISTS sequence_items (
  id BIGSERIAL PRIMARY KEY,
  court_id BIGINT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  order_index INT NOT NULL,
  CONSTRAINT uq_court_order UNIQUE (court_id, order_index)
);

-- Helpful index for listing by court ordered
CREATE INDEX IF NOT EXISTS idx_sequence_items_court_order
ON sequence_items (court_id, order_index);
