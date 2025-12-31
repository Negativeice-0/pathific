package com.pathific.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pathific.app.entity.Court;

/** JPA repository for Court entity */
@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    Optional<Court> findByName(String name);
}
