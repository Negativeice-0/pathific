CREATE TABLE IF NOT EXISTS modules (
  id BIGSERIAL PRIMARY KEY,
  court_id BIGINT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  order_index INT NOT NULL,
  CONSTRAINT uq_court_order UNIQUE (court_id, order_index)
);