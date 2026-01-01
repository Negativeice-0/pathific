# **Simplified Professional Implementation (No DTOs/Service Layer)**

## **What DTOs, Service Layer, and Exception Handlers Do:**

### **DTOs (Data Transfer Objects)**
- **Purpose**: Separate API request/response format from database entities
- **Benefit**: If your API changes, your database doesn't have to
- **Example**: API wants `moduleName` but database has `title`

### **Service Layer**
- **Purpose**: Business logic goes here, not in controller
- **Benefit**: Reusable, testable, clean controllers
- **Example**: "If module X exists, do Y before saving Z"

### **Global Exception Handler**
- **Purpose**: Catch all errors and return consistent error messages
- **Benefit**: No try-catch blocks everywhere, clean code
- **Example**: Return `{"error": "Module not found"}` instead of server crashes

## **Simple Working Implementation:**

### **1. Module Entity (Fixed)**
```java
package com.pathific.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "modules",
    uniqueConstraints = @UniqueConstraint(name = "uq_court_order", columnNames = {"court_id", "order_index"})
)
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "court_id", nullable = false)
    private Long courtId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // MUST HAVE THIS CONSTRUCTOR - JPA needs it
    public Module() {}

    // Optional convenience constructor
    public Module(Long courtId, String title, String summary, Integer orderIndex) {
        this.courtId = courtId;
        this.title = title;
        this.summary = summary;
        this.orderIndex = orderIndex;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
```

### **2. Module Repository**
```java
package com.pathific.app.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pathific.app.entity.Module;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    // This method name follows Spring Data JPA naming convention
    // Spring automatically implements: SELECT * FROM modules WHERE court_id = ? ORDER BY order_index ASC
    List<Module> findByCourtIdOrderByOrderIndexAsc(Long courtId);
}
```

### **3. Module Controller (Fixed & Simple)**
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
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> {
                    Map<String, String> error = Map.of("error", "Module not found with id: " + id);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                });
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

## **Why This Minimal Version Works:**

### **For Small Projects:**
1. **Entity** = Database table structure
2. **Repository** = Direct database access
3. **Controller** = HTTP endpoints with business logic

### **Missing But Acceptable:**
1. **Validation** - You could add `@NotBlank` annotations to entity
2. **DTOs** - Entity doubles as API format (quick but couples API to DB)
3. **Service layer** - Business logic in controller (OK for small apps)
4. **Exception handler** - Try-catch in each method instead

### **Add Validation (Optional):**
```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// In your Module entity:
@Column(nullable = false)
@NotBlank(message = "Title is required")
private String title;

@Column(name = "order_index", nullable = false)
@NotNull(message = "Order index is required")
private Integer orderIndex;
```

### **Dependency for Validation:**
```xml
<!-- In pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## **When to Add DTOs/Service Layer:**

| **When Your App Grows...** | **Add This** |
|---------------------------|--------------|
| API needs different field names | DTOs |
| Complex business rules | Service layer |
| Multiple error types | Global Exception Handler |
| Multiple data sources | Service layer |

## **Your Guide's Omission:**
Your guide probably assumed:
1. Small tutorial app
2. Quick results over perfect architecture
3. You'd Google "Spring Boot best practices" later

## **Bottom Line:**
Your original 3-file approach (Entity + Repository + Controller) works for **learning** and **small projects**. Add DTOs/services later when you need them.

**This code above will compile and run right now.** Test with:
```
GET    /api/modules/1
POST   /api/modules/1    { "title": "Intro", "summary": "...", "orderIndex": 1 }
PUT    /api/modules/1    { "title": "Updated Intro" }
DELETE /api/modules/1
```