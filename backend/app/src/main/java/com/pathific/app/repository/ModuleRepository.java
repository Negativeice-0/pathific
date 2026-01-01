package com.pathific.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pathific.app.entity.Module;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    // This method name follows Spring Data JPA naming convention
    // Spring automatically implements: SELECT * FROM modules WHERE court_id = ? ORDER BY order_index ASC
    List<Module> findByCourtIdOrderByOrderIndexAsc(Long courtId);
}