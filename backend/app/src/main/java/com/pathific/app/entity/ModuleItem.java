package com.pathific.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

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
