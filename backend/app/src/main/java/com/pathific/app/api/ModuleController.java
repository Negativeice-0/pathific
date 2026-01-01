package com.pathific.app.api;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pathific.app.entity.Module;
import com.pathific.app.repository.ModuleRepository;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {
    private final ModuleRepository repo;
    
    public ModuleController(ModuleRepository repo) { 
        this.repo = repo; 
    }

    @GetMapping("/{courtId}")
    public ResponseEntity<List<Module>> getModulesByCourt(@PathVariable Long courtId) {
        List<Module> modules = repo.findByCourtIdOrderByOrderIndexAsc(courtId);
        return ResponseEntity.ok(modules);
    }
    
    @PostMapping("/{courtId}")
    public ResponseEntity<Module> createModule(@PathVariable Long courtId, @RequestBody Module body) {
        Module newModule = new Module();
        newModule.setCourtId(courtId);
        newModule.setTitle(body.getTitle());
        newModule.setSummary(body.getSummary());
        newModule.setOrderIndex(body.getOrderIndex());
        
        Module saved = repo.save(newModule);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateModule(@PathVariable Long id, @RequestBody Module body) {
        Optional<Module> optionalModule = repo.findById(id);
        
        if (optionalModule.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Module not found with id: " + id));
        }
        
        Module existing = optionalModule.get();
        
        // Update only if new value is provided
        if (body.getTitle() != null) {
            existing.setTitle(body.getTitle());
        }
        if (body.getSummary() != null) {
            existing.setSummary(body.getSummary());
        }
        if (body.getOrderIndex() != null) {
            existing.setOrderIndex(body.getOrderIndex());
        }
        
        Module updated = repo.save(existing);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteModule(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Module deleted successfully"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                    "success", false,
                    "message", "Module not found"
                ));
        }
    }
}