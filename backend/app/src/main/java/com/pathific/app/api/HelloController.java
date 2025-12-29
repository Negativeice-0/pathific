package com.pathific.app.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pathific.app.db.HelloRepository;

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
