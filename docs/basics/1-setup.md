### Pathific directory setup

We’ll move deliberately and verify each layer. Start with a single project directory, no extras.

- **Create base dir:**
  ```bash
  mkdir -p pathific
  cd pathific
  git init
  echo "# Pathific baseline" > README.md
  ```

- **Goal:** Only this directory exists. We’ll add Spring, Docker, and Postgres step by step.

---

### Spring Initializr baseline (backend only)

Generate a minimal Spring Boot app with a single “hello” endpoint. No DB yet.

- **Generate project (using Spring Initializr GUI or CLI):**
  - **Group:** com.pathific
  - **Artifact:** app
  - **Language:** Java
  - **Java:** 21
  - **Dependencies:** Spring Web, Spring Actuator
  - **Packaging:** Jar

- **Place it under:**
  ```
  pathific/backend/app
  ```

- **App files (if you prefer pasting instead of generating):**

  ##### backend/app/pom.xml
  ```xml
  <project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.pathific</groupId>
    <artifactId>app</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <properties>
      <java.version>21</java.version>
      <spring.boot.version>3.3.2</spring.boot.version>
    </properties>
    <dependencyManagement>
      <dependencies>
        <dependency>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-dependencies</artifactId>
          <version>${spring.boot.version}</version>
          <type>pom</type>
          <scope>import</scope>
        </dependency>
      </dependencies>
    </dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
      </dependency>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
      </dependency>
    </dependencies>
    <build>
      <plugins>
        <plugin>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
      </plugins>
    </build>
  </project>
  ```

  ##### backend/app/src/main/java/com/pathific/app/AppApplication.java
  ```java
  package com.pathific.app;

  import org.springframework.boot.SpringApplication;
  import org.springframework.boot.autoconfigure.SpringBootApplication;

  @SpringBootApplication
  public class AppApplication {
    public static void main(String[] args) {
      SpringApplication.run(AppApplication.class, args);
    }
  }
  ```

  ##### backend/app/src/main/java/com/pathific/app/api/HelloController.java
  ```java
  package com.pathific.app.api;

  import org.springframework.web.bind.annotation.GetMapping;
  import org.springframework.web.bind.annotation.RestController;

  @RestController
  public class HelloController {
    @GetMapping("/hello")
    public String hello() {
      return "Hello, Pathific!";
    }
  }
  ```

  ##### backend/app/src/main/resources/application.yml
  ```yaml
  server:
    port: 8080
  management:
    endpoints:
      web:
        exposure:
          include: health,info
  ```

- **Local run (sanity check):**
  ```bash
  cd backend/app
  mvn -B clean spring-boot:run
  # In another terminal:
  curl http://localhost:8080/hello
  curl http://localhost:8080/actuator/health
  ```

---

### Docker integration with Postgres (containerized DB)

We’ll add Postgres in Docker, keep data isolated in a named volume, and prepare the backend to connect via environment variables.

- **Compose file:**

  ##### ops/docker/docker-compose.yml
  ```yaml
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
        - "5432:5432"
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
        SPRING_JPA_HIBERNATE_DDL_AUTO: none
      depends_on:
        db:
          condition: service_healthy
      ports:
        - "8080:8080"

  volumes:
    pathific_db_data:
  ```

- **Initialization script (optional but helpful):**

  ##### ops/docker/init/001_hello.sql
  ```sql
  CREATE TABLE IF NOT EXISTS hello_events (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **Backend Dockerfile:**

  ##### backend/app/Dockerfile
  ```dockerfile
  FROM maven:3.9-eclipse-temurin-21 AS build
  WORKDIR /app
  COPY pom.xml .
  COPY src ./src
  RUN mvn -B -DskipTests package

  FROM eclipse-temurin:21-jre
  WORKDIR /app
  COPY --from=build /app/target/app-0.0.1-SNAPSHOT.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java","-jar","/app/app.jar"]
  ```

- **Add JDBC dependency for DB connectivity:**

  Update pom to include the driver.

  ##### backend/app/pom.xml (add dependency)
  ```xml
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <version>42.7.3</version>
    </dependency>
  </dependencies>
  ```

---

### Connect Postgres to VS Code database extension

- **Extension:** Install “PostgreSQL” by Chris Kolkman or “SQLTools” + “SQLTools PostgreSQL Driver”.
- **Connection details:**
  - **Host:** localhost
  - **Port:** 5432
  - **Database:** pathific
  - **User:** pathific
  - **Password:** pathific_pass
- **Note:** The container maps 5432:5432; the named volume preserves data across restarts.

---

### End-to-end hello test (with DB write/read)

We’ll extend the backend hello to insert a message into Postgres and read back the latest.

- **Add a repository and service:**

  ##### backend/app/src/main/java/com/pathific/app/db/HelloRepository.java
  ```java
  package com.pathific.app.db;

  import org.springframework.jdbc.core.JdbcTemplate;
  import org.springframework.stereotype.Repository;

  @Repository
  public class HelloRepository {
    private final JdbcTemplate jdbc;

    public HelloRepository(JdbcTemplate jdbc) {
      this.jdbc = jdbc;
    }

    public void insertMessage(String message) {
      jdbc.update("INSERT INTO hello_events(message) VALUES (?)", message);
    }

    public String latestMessage() {
      return jdbc.query("SELECT message FROM hello_events ORDER BY id DESC LIMIT 1",
        rs -> rs.next() ? rs.getString("message") : null
      );
    }
  }
  ```

  ##### backend/app/src/main/java/com/pathific/app/api/HelloController.java
  ```java
  package com.pathific.app.api;

  import com.pathific.app.db.HelloRepository;
  import org.springframework.web.bind.annotation.GetMapping;
  import org.springframework.web.bind.annotation.RestController;

  @RestController
  public class HelloController {
    private final HelloRepository repo;

    public HelloController(HelloRepository repo) {
      this.repo = repo;
    }

    @GetMapping("/hello")
    public String hello() {
      String msg = "Hello, Pathific!";
      repo.insertMessage(msg);
      String latest = repo.latestMessage();
      return latest == null ? msg : latest;
    }
  }
  ```

  ##### backend/app/src/main/resources/application.yml (datasource from env)
  ```yaml
  server:
    port: 8080
  spring:
    datasource:
      url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/pathific}
      username: ${SPRING_DATASOURCE_USERNAME:pathific}
      password: ${SPRING_DATASOURCE_PASSWORD:pathific_pass}
    jdbc:
      template:
        fetch-size: 50
  management:
    endpoints:
      web:
        exposure:
          include: health,info
  ```

- **Add Spring JDBC dependency:**

  ##### backend/app/pom.xml (add)
  ```xml
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
  </dependency>
  ```

- **Bring it all up:**
  ```bash
  # From pathific/
  docker compose -f ops/docker/docker-compose.yml up --build -d
  # Wait for health (or check logs):
  docker logs pathific_db --tail=50
  ```

- **Verify end-to-end:**
  ```bash
  curl http://localhost:8080/hello
  curl http://localhost:8080/actuator/health
  # Check the row in VS Code DB extension:
  # SELECT * FROM hello_events ORDER BY id DESC LIMIT 5;
  ```

- **Direct answers:**
  - Backend responds “Hello, Pathific!”
  - A row is inserted in hello_events
  - Health returns UP

---

### Next step: Universal auth after baseline holds

If this baseline works (hello endpoint hits DB and VS Code can query the table), say “proceed to auth.” I’ll add the smallest, reproducible auth layer: Spring Security + JWT, minimal users table, and environment-driven secrets, gated on /hello with a public health remaining open.