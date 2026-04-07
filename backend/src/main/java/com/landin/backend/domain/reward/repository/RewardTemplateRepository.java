package com.landin.backend.domain.reward.repository;

import com.landin.backend.domain.reward.entity.RewardTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RewardTemplateRepository extends JpaRepository<RewardTemplate, UUID> {
    Optional<RewardTemplate> findByEventId(String eventId);
}
