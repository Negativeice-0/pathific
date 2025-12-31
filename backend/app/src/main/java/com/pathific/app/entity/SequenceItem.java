package com.pathific.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sequence_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"court_id", "order_index"}))
public class SequenceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="court_id", nullable=false)
    private Long courtId;

    @Column(nullable=false)
    private String title;

    @Column(name="order_index", nullable=false)
    private Integer orderIndex;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
