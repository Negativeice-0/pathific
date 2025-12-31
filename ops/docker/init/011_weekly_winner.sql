CREATE TABLE IF NOT EXISTS weekly_winners (
  id SERIAL PRIMARY KEY,
  court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  reason TEXT
);
