package com.landin.backend.domain.step.repository;

import com.landin.backend.domain.step.entity.StepCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface StepCompletionRepository extends JpaRepository<StepCompletion, UUID> {

    boolean existsByUserIdAndStepId(UUID userId, UUID stepId);

    List<StepCompletion> findByUserIdAndStepIdIn(UUID userId, List<UUID> stepIds);

    @Query("SELECT sc.step.id FROM StepCompletion sc WHERE sc.user.id = :userId AND sc.step.event.id = :eventId")
    Set<UUID> findCompletedStepIdsByUserIdAndEventId(UUID userId, String eventId);

    long countByUserIdAndStepEventId(UUID userId, String eventId);

    long countByUserId(UUID userId);
}
