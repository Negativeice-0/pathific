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
