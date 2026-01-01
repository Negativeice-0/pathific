package com.pathific.app.api;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pathific.app.entity.Court;
import com.pathific.app.repository.CourtRepository;

@RestController
 @RequestMapping("/api/courts")
  public class CourtController {
     private final CourtRepository repo;
      public CourtController(CourtRepository repo){
         this.repo = repo;
         }
         
         @GetMapping
          public Map<String, Object> list() {
             List<Court> items = repo.findAll();
              return Map.of("ok", true, "items", items);
             }
            
            }
