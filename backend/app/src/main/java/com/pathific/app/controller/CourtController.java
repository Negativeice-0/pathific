package com.pathific.app.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pathific.app.entity.Court;
import com.pathific.app.repository.CourtRepository;

/**
 * Courts API:
 * - GET /api/courts: list all courts
 * - POST /api/courts: create a court
 * - GET /api/courts/{id}: get court by id
 */
@RestController
@RequestMapping("/api/courts")
public class CourtController {

    private final CourtRepository repo;

    public CourtController(CourtRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Court> allCourts() {
        return repo.findAll();
    }

    @PostMapping
    public ResponseEntity<Court> createCourt(@RequestBody Court court) {
        // Basic guard: name and description must be present
        if (court.getName() == null || court.getName().isBlank()
                || court.getDescription() == null || court.getDescription().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        // Ensure createdAt is set if missing
        if (court.getCreatedAt() == null) {
            court.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        }
        Court saved = repo.save(court);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Court> getCourt(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
