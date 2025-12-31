CREATE TABLE IF NOT EXISTS sequence_items (
  id BIGSERIAL PRIMARY KEY,
  court_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INT NOT NULL,
  CONSTRAINT uq_court_order UNIQUE (court_id, order_index),
  CONSTRAINT fk_court FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);
