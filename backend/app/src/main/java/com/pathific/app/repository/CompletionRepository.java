package com.pathific.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pathific.app.entity.Completion; 
public interface CompletionRepository extends JpaRepository<Completion, Long> {
     Optional<Completion> findByUserIdAndModuleId(Long userId, Long moduleId); }
