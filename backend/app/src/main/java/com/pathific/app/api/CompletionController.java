package com.pathific.app.api;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pathific.app.entity.Completion;
import com.pathific.app.repository.CompletionRepository;

@RestController @RequestMapping("/api/completions")
public class CompletionController {
  private final CompletionRepository repo;
  public CompletionController(CompletionRepository repo){ this.repo=repo; }

  @PostMapping public Map<String,Object> complete(@RequestBody Map<String,Object> body){
    Long userId = Long.valueOf(String.valueOf(body.get("userId")));
    Long moduleId = Long.valueOf(String.valueOf(body.get("moduleId")));
    repo.findByUserIdAndModuleId(userId, moduleId).orElseGet(() -> {
      Completion c = new Completion(); c.setUserId(userId); c.setModuleId(moduleId); return repo.save(c);
    });
    return Map.of("ok", true);
  }
}

