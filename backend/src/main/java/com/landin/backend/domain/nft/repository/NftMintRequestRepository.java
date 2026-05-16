package com.landin.backend.domain.nft.repository;

import com.landin.backend.domain.nft.entity.NftMintRequest;
import com.landin.backend.domain.nft.entity.NftMintRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NftMintRequestRepository extends JpaRepository<NftMintRequest, UUID> {

    Optional<NftMintRequest> findByIdAndUserId(UUID mintRequestId, UUID userId);

    List<NftMintRequest> findByMintStatusIn(List<NftMintRequestStatus> statuses);

    boolean existsByDraftId(UUID draftId);
}
