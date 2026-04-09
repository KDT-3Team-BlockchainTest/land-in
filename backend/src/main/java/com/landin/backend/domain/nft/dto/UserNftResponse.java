package com.landin.backend.domain.nft.dto;

import com.landin.backend.domain.nft.entity.NftMintStatus;
import com.landin.backend.domain.nft.entity.UserNft;
import com.landin.backend.domain.step.entity.NftRarity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UserNftResponse {
    private UUID id;
    private String eventId;
    private String eventTitle;
    private String name;
    private String imageUrl;
    private NftRarity rarity;
    private LocalDateTime mintedAt;
    private NftMintStatus mintStatus;
    private Long onChainChainId;
    private String contractAddress;
    private String tokenUri;
    private String tokenId;
    private String transactionHash;
    private LocalDateTime onChainMintedAt;
    private String mintFailureReason;

    public static UserNftResponse from(UserNft nft) {
        return UserNftResponse.builder()
                .id(nft.getId())
                .eventId(nft.getEvent().getId())
                .eventTitle(nft.getEvent().getTitle())
                .name(nft.getName())
                .imageUrl(nft.getImageUrl())
                .rarity(nft.getRarity())
                .mintedAt(nft.getMintedAt())
                .mintStatus(nft.getEffectiveMintStatus())
                .onChainChainId(nft.getOnChainChainId())
                .contractAddress(nft.getContractAddress())
                .tokenUri(nft.getTokenUri())
                .tokenId(nft.getTokenId())
                .transactionHash(nft.getTransactionHash())
                .onChainMintedAt(nft.getOnChainMintedAt())
                .mintFailureReason(nft.getMintFailureReason())
                .build();
    }
}
