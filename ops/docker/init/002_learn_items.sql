CREATE TABLE IF NOT EXISTS learn_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  media_type TEXT,  -- text | video | image
  media_url TEXT
);

INSERT INTO learn_items (title, description, link, media_type, media_url) VALUES
('Pathific Vision', 'Building hope through clarity', NULL, 'text', NULL),
('Contract-first Discipline', 'Documented entities and reproducible flows', 'https://example.com/discipline', 'text', NULL),
('Intro Video', 'A guided story of the Pathific journey', NULL, 'video', 'https://www.w3schools.com/html/mov_bbb.mp4'),
('Inspiration Image', 'A soft, smoky aesthetic of focus and calm', NULL, 'image', 'https://picsum.photos/800/400');
