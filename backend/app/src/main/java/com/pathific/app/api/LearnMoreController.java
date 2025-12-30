package com.pathific.app.api;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LearnMoreController {

  private final JdbcTemplate jdbc;

  public LearnMoreController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @GetMapping("/api/learnmore")
  public Map<String, Object> getLearnItems() {
    List<Map<String, Object>> items = jdbc.queryForList(
      "SELECT title, description, link, media_type AS \"mediaType\", media_url AS \"mediaUrl\" FROM learn_items ORDER BY id DESC"
    );
    return Map.of("items", items);
  }
}
