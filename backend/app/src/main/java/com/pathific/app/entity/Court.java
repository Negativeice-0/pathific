package com.pathific.app.entity;

import java.sql.Timestamp;

import jakarta.persistence.*;

/**
 * Court entity represents a curator court.
 * - name: unique court name
 * - description: short summary
 * - createdAt: server-side timestamp
 */
@Entity
@Table(name = "courts")
public class Court {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String name;

    @Column(nullable=false, columnDefinition = "TEXT")
    private String description;

    @Column(name="created_at", nullable=false)
    private Timestamp createdAt;

    /** Default constructor required by JPA */
    public Court() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    /** Convenience constructor */
    public Court(String name, String description) {
        this.name = name;
        this.description = description;
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
