package com.pathific.app.api;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MeController {
  @GetMapping("/api/me")
  public Map<String,Object> me() {
    return Map.of("ok", true, "message", "Demo user info here");
  }
}
