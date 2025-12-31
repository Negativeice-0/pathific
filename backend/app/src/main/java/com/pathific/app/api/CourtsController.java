package com.pathific.app.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CourtsController {

  // GET /api/courts - public listing for Explore
  @GetMapping("/courts")
  public Map<String, Object> listCourts() {
    // Replace with service/repo calls
    List<Map<String, Object>> items = List.of(
      Map.of("id", 1, "name", "Creator Economics", "slug", "creator-economics",
             "summary", "Insights and playbooks for creator-led businesses",
             "category", "Business"),
      Map.of("id", 2, "name", "AI Craft", "slug", "ai-craft",
             "summary", "Applied AI, tooling and practice",
             "category", "Technology")
    );
    return Map.of("ok", true, "items", items);
  }

  // GET /api/courts/winner - weekly winner spotlight (public)
  @GetMapping("/courts/winner")
  public Map<String, Object> weeklyWinner() {
    Map<String, Object> winner = Map.of(
      "court_id", 2,
      "name", "AI Craft",
      "week_start", "2025-12-29",
      "week_end", "2026-01-04",
      "reason", "Highest completion rate and curated depth"
    );
    return Map.of("ok", true, "winner", winner);
  }

  // GET /api/badges - simple badge catalog (public)
  @GetMapping("/badges")
  public Map<String, Object> badges() {
    List<Map<String, Object>> items = List.of(
      Map.of("code", "CURATOR", "label", "Curator", "description", "Hosts and maintains a court"),
      Map.of("code", "WEEKLY_WINNER", "label", "Weekly Winner", "description", "Top court this week")
    );
    return Map.of("ok", true, "items", items);
  }

  // POST /api/courts - admin create (keep protected later)
  @PostMapping("/courts")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> createCourt(@RequestBody Map<String, Object> input) {
    // Validate + persist
    return Map.of("ok", true, "court", input);
  }
}
