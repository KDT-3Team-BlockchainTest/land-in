package com.landin.backend.domain.step.repository;

import com.landin.backend.domain.step.entity.Step;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StepRepository extends JpaRepository<Step, UUID> {
    List<Step> findByEventIdOrderByOrderIndex(String eventId);
    long countByEventId(String eventId);
}
