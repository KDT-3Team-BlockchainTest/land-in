package com.landin.backend.domain.step.repository;

import com.landin.backend.domain.step.entity.NfcTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface NfcTagRepository extends JpaRepository<NfcTag, UUID> {
    Optional<NfcTag> findByTagUid(String tagUid);
}
