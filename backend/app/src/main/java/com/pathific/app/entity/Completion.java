package com.pathific.app.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "completions",
    uniqueConstraints = @UniqueConstraint(name = "uq_user_module", columnNames = {"user_id", "module_id"})
)
public class Completion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt = Instant.now();

    /** Default constructor required by JPA */
    public Completion() {}

    /** Convenience constructor */
    public Completion(Long userId, Long moduleId) {
        this.userId = userId;
        this.moduleId = moduleId;
        this.completedAt = Instant.now();
    }

    /** Convenience constructor with custom completion time */
    public Completion(Long userId, Long moduleId, Instant completedAt) {
        this.userId = userId;
        this.moduleId = moduleId;
        this.completedAt = completedAt;
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}