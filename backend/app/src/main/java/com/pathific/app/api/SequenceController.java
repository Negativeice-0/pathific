package com.pathific.app.api;

import com.pathific.app.entity.SequenceItem;
import com.pathific.app.repository.SequenceItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sequences")
public class SequenceController {

    private final SequenceItemRepository repo;

    public SequenceController(SequenceItemRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{courtId}")
    public List<SequenceItem> list(@PathVariable Long courtId) {
        return repo.findByCourtIdOrderByOrderIndex(courtId);
    }

    @PostMapping
    public ResponseEntity<SequenceItem> create(@RequestBody SequenceItem item) {
        // enforce uniqueness by courtId + orderIndex
        return ResponseEntity.ok(repo.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SequenceItem> update(@PathVariable Long id, @RequestBody SequenceItem item) {
        return repo.findById(id)
                .map(existing -> {
                    existing.setTitle(item.getTitle());
                    existing.setOrderIndex(item.getOrderIndex());
                    return ResponseEntity.ok(repo.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
