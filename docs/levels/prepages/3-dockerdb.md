Postgres with Docker (pathific/ops/docker)
docker-compose.yml
yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    container_name: pathific_db
    environment:
      POSTGRES_DB: pathific
      POSTGRES_USER: pathific
      POSTGRES_PASSWORD: pathific_pass
    ports:
      - "5433:5432" # host:container to avoid local 5432 conflicts
    volumes:
      - pathific_db_data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "pathific"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ../../backend/app
      dockerfile: Dockerfile
    container_name: pathific_backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/pathific
      SPRING_DATASOURCE_USERNAME: pathific
      SPRING_DATASOURCE_PASSWORD: pathific_pass
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"

volumes:
  pathific_db_data:
init/001_learn_items.sql
sql
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
Start DB + backend: docker compose -f pathific/ops/docker/docker-compose.yml up --build -d

VS Code connection: Host localhost, Port 5433, DB pathific, User pathific, Password pathific_pass