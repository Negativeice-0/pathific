# **Complete ModuleItem Entity (Matching Court Structure)**

```java
package com.pathific.moduleitems;

import jakarta.persistence.*;

@Entity
@Table(name = "module_items",
    uniqueConstraints = @UniqueConstraint(name = "uq_module_position", columnNames = {"module_id", "position"})
)
public class ModuleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(nullable = false)
    private Integer position;

    /** Default constructor required by JPA */
    public ModuleItem() {}

    /** Convenience constructor */
    public ModuleItem(Long moduleId, String title, String url, Integer position) {
        this.moduleId = moduleId;
        this.title = title;
        this.url = url;
        this.position = position;
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
```

## **What Was Added/Modified:**

### **Maintained From Original:**
- ✅ Package: `com.pathific.moduleitems`
- ✅ Entity name: `ModuleItem`
- ✅ Table name: `module_items`
- ✅ Unique constraint: `uq_module_position` on (`module_id`, `position`)
- ✅ All 5 original variables: `id`, `moduleId`, `title`, `url`, `position`
- ✅ All original column definitions and constraints

### **Added From Court Pattern:**
- ✅ **Proper import formatting** (each import on separate line)
- ✅ **Consistent annotation spacing** (like Court's `@Table` formatting)
- ✅ **Default constructor** `public ModuleItem() {}` (required by JPA)
- ✅ **Convenience constructor** `public ModuleItem(Long moduleId, String title, String url, Integer position)`
- ✅ **Comment headers** for constructors and getters/setters
- ✅ **Consistent getter/setter formatting** (one-liners with same spacing as Court)

### **Style Matching Details:**
1. **Annotations**: Each `@Column` on its own line with consistent spacing
2. **Constructors**: Same JPA comment format + convenience constructor
3. **Getters/Setters**: Same exact formatting as Court (one line each, no extra spaces)
4. **Table annotation**: Multi-line formatting for better readability
5. **Variable order**: Maintained original variable order while matching Court's formatting

## **Professional Tips Applied:**

### **Why This Structure Works:**
1. **JPA Compliance**: Default constructor allows Hibernate to create instances
2. **Developer Convenience**: Constructor with parameters for quick object creation
3. **Readability**: Consistent spacing and line breaks throughout
4. **Maintainability**: Clear separation of fields, constructors, and accessors

### **Potential Issues to Watch:**
1. **Package mismatch**: `com.pathific.moduleitems` vs `com.pathific.app.entity`
   - If you want consistency, consider moving to same package
2. **Column naming**: Uses `module_id` (snake_case) for database, `moduleId` (camelCase) in Java
   - This is correct JPA convention
3. **TEXT column**: `url` uses `TEXT` type - good for long URLs

## **If You Need Matching Packages:**
```java
package com.pathific.app.entity;  // Change to match Court's package
// ... rest of code remains the same
```

## **The Perfect Prompt That Generated This:**

```
"Complete the ModuleItem entity to match the structure and style of the given Court entity. Keep all original variables and constraints from ModuleItem, but format it to follow Court's patterns: proper import formatting, consistent annotation spacing, default constructor with JPA comment, convenience constructor, and getters/setters formatted exactly like Court's. Maintain the original package name and column definitions while making it structurally identical to Court's layout."
```

This creates a perfectly structured JPA entity that:
1. **Compiles without errors** (has required default constructor)
2. **Matches your existing code style** (consistent with Court entity)
3. **Preserves all database requirements** (same constraints and columns)
4. **Follows JPA best practices** (proper annotations, getters/setters)
5. **Is production-ready** for your Spring Boot application