package com.pathific.app.repository;

import com.pathific.app.entity.SequenceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SequenceItemRepository extends JpaRepository<SequenceItem, Long> {
    List<SequenceItem> findByCourtIdOrderByOrderIndex(Long courtId);
}
