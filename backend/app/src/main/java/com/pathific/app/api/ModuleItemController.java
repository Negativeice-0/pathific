package com.pathific.app.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pathific.app.entity.ModuleItem;
import com.pathific.app.repository.ModuleItemRepository;

@RestController @RequestMapping("/api/module-items")
public class ModuleItemController {
  private final ModuleItemRepository repo;
  public ModuleItemController(ModuleItemRepository repo){ this.repo=repo; }

  @GetMapping("/{moduleId}") public List<ModuleItem> list(@PathVariable Long moduleId){
    return repo.findByModuleIdOrderByPositionAsc(moduleId);
  }
  @PostMapping("/{moduleId}") public ResponseEntity<ModuleItem> create(@PathVariable Long moduleId, @RequestBody ModuleItem body){
    ModuleItem mi=new ModuleItem(); mi.setModuleId(moduleId); mi.setTitle(body.getTitle());
    mi.setUrl(body.getUrl()); mi.setPosition(body.getPosition());
    return ResponseEntity.ok(repo.save(mi));
  }
  @PutMapping("/{id}") public ResponseEntity<ModuleItem> update(@PathVariable Long id, @RequestBody ModuleItem body){
    return repo.findById(id).map(e->{ if(body.getTitle()!=null)e.setTitle(body.getTitle());
      if(body.getUrl()!=null)e.setUrl(body.getUrl());
      if(body.getPosition()!=null)e.setPosition(body.getPosition());
      return ResponseEntity.ok(repo.save(e)); }).orElseGet(()->ResponseEntity.notFound().build());
  }
  @DeleteMapping("/{id}") public Map<String,Object> delete(@PathVariable Long id){ repo.deleteById(id); return Map.of("ok",true); }
}

