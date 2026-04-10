package com.landin.backend.domain.nft.repository;

import com.landin.backend.domain.nft.entity.NftMintStatus;
import com.landin.backend.domain.nft.entity.UserNft;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserNftRepository extends JpaRepository<UserNft, UUID> {
    @EntityGraph(attributePaths = {"event"})
    List<UserNft> findByUserId(UUID userId);

    @EntityGraph(attributePaths = {"event"})
    List<UserNft> findByUserIdAndEventId(UUID userId, String eventId);

    @EntityGraph(attributePaths = {"user", "event", "step", "nftTemplate"})
    Optional<UserNft> findDetailedById(UUID id);

    List<UserNft> findByUserIdAndMintStatusIn(UUID userId, Collection<NftMintStatus> statuses);

    long countByUserId(UUID userId);
}
