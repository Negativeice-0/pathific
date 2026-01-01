The errors are due to **type mismatches in the lambda expressions**. Here's the fixed controller:

## **Fixed Module Controller:**

```java
package com.pathific.app.api;

import java.util.List;
import java.util.Map;

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

    // GET /api/modules/{courtId} - Get all modules for a court
    @GetMapping("/{courtId}")
    public ResponseEntity<List<Module>> getModulesByCourt(@PathVariable Long courtId) {
        try {
            List<Module> modules = repo.findByCourtIdOrderByOrderIndexAsc(courtId);
            return ResponseEntity.ok(modules);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/modules/{courtId} - Create a new module
    @PostMapping("/{courtId}")
    public ResponseEntity<Object> createModule(@PathVariable Long courtId, @RequestBody Module body) {
        try {
            // Create new module with courtId from URL
            Module newModule = new Module();
            newModule.setCourtId(courtId);
            newModule.setTitle(body.getTitle());
            newModule.setSummary(body.getSummary());
            newModule.setOrderIndex(body.getOrderIndex());
            
            Module saved = repo.save(newModule);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            Map<String, String> error = Map.of("error", "Failed to create module: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // PUT /api/modules/{id} - Update existing module
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateModule(@PathVariable Long id, @RequestBody Module body) {
        try {
            // Find existing module
            return repo.findById(id)
                .map(existing -> {
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
                    return ResponseEntity.<Object>ok(updated);  // Fixed: Explicit type
                })
                .orElseGet(() -> 
                    ResponseEntity.<Object>status(HttpStatus.NOT_FOUND)  // Fixed: Return ResponseEntity<Object>
                        .body(Map.of("error", "Module not found with id: " + id))
                );
        } catch (Exception e) {
            Map<String, String> error = Map.of("error", "Failed to update module: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // DELETE /api/modules/{id} - Delete module
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteModule(@PathVariable Long id) {
        try {
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
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Error deleting module: " + e.getMessage()
                ));
        }
    }
}
```

## **Alternative Simpler Version (Without Lambdas):**

If you prefer less complex code without lambda confusion:

```java
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
```

## **What Was Wrong & Fixed:**

### **Error 1: Type Mismatch in Lambda**
```java
// WRONG: Lambda returns ResponseEntity<Module> but orElseGet expects same type
.map(existing -> { return ResponseEntity.ok(updated); })  // Returns ResponseEntity<Module>
.orElseGet(() -> {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)  // Returns ResponseEntity<Map>
        .body(Map.of(...));
});
```

**Fix:** Make both branches return the same type:
```java
.map(existing -> ResponseEntity.<Object>ok(updated))
.orElseGet(() -> ResponseEntity.<Object>status(HttpStatus.NOT_FOUND).body(...));
```

### **Error 2: Incompatible Types in Optional Chain**
The `map()` transforms `Optional<Module>` to `Optional<ResponseEntity<Module>>`, but `orElseGet()` tries to return `ResponseEntity<Map>` which doesn't match.

### **Why This Happens:**
- **map()**: Transforms `Optional<Module>` → `Optional<ResponseEntity<Module>>`
- **orElseGet()**: Must return `ResponseEntity<Module>` (same as map's result)
- But you're trying to return `ResponseEntity<Map>` → Type mismatch

### **Simplest Fix: Use `ResponseEntity<?>`**
```java
public ResponseEntity<?> updateModule(...)
```
This accepts any response body type.

## **Recommendation:**
Use the **Simpler Version** without lambdas. It's:
1. **Easier to read** and debug
2. **No complex type inference** issues
3. **Same functionality** but clearer
4. **Fewer compilation errors**

The simpler version will work immediately without the lambda complexity that caused the errors.