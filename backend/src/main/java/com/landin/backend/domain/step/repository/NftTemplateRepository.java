package com.landin.backend.domain.step.repository;

import com.landin.backend.domain.step.entity.NftTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface NftTemplateRepository extends JpaRepository<NftTemplate, UUID> {
    Optional<NftTemplate> findByStepId(UUID stepId);
}
