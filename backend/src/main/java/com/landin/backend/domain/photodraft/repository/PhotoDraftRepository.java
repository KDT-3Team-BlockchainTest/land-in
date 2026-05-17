package com.landin.backend.domain.photodraft.repository;

import com.landin.backend.domain.photodraft.entity.PhotoDraft;
import com.landin.backend.domain.photodraft.entity.PhotoDraftStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhotoDraftRepository extends JpaRepository<PhotoDraft, UUID> {

    List<PhotoDraft> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<PhotoDraft> findByIdAndUserId(UUID draftId, UUID userId);

    boolean existsByUserIdAndVisitId(UUID userId, String visitId);

    List<PhotoDraft> findByUserIdAndStatusNotIn(UUID userId, List<PhotoDraftStatus> excludedStatuses);
}
