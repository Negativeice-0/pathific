package com.pathific.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pathific.app.entity.ModuleItem;

public interface ModuleItemRepository extends JpaRepository<ModuleItem, Long> {
     List<ModuleItem> findByModuleIdOrderByPositionAsc(Long moduleId); 
}