package com.pathific.app.users;

import java.util.Map;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  private final JdbcTemplate jdbc;

  public UserRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public void createUser(String externalId, String name, String email, String passwordHash, String city, String level, String role) {
    jdbc.update(
      "INSERT INTO users(external_id, name, email, password_hash, city, level, role) VALUES (?,?,?,?,?,?,?)",
      externalId, name, email, passwordHash, city, level, role
    );
  }

  public Map<String, Object> findByEmail(String email) {
    try {
      return jdbc.queryForMap("SELECT id, external_id, name, email, password_hash, city, level, role FROM users WHERE email = ?", email);
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }
}
