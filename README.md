# Pathific baseline
Infor about pathific will go here.

#frontend
cd to ui then run "npm run dev"

#backend
no need to cd
 **Option 2: stay anywhere, but point to the file explicitly**  
  ```bash
  docker compose -f ~/Advance/ambrosia/pathific/ops/docker/docker-compose.yml down -v
  docker compose -f ~/Advance/ambrosia/pathific/ops/docker/docker-compose.yml up --build -d
  ```
  → The `-f` flag tells Docker exactly which file to use.

  #Db
  db is run once on build - so drop and rebuild for new files in "ops/docker/init" to be picked.

Check out migrations in docs for hack
004_create_courts.sql (YYYY‑MM‑DD)