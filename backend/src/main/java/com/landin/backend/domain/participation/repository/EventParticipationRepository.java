package com.landin.backend.domain.participation.repository;

import com.landin.backend.domain.participation.entity.EventParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EventParticipationRepository extends JpaRepository<EventParticipation, UUID> {

    boolean existsByUserIdAndEventId(UUID userId, String eventId);

    List<EventParticipation> findByUserId(UUID userId);

    @Query("SELECT ep.event.id FROM EventParticipation ep WHERE ep.user.id = :userId")
    List<String> findEventIdsByUserId(UUID userId);
}
