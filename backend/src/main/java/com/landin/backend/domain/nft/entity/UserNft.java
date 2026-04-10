package com.landin.backend.domain.nft.entity;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.step.entity.NftRarity;
import com.landin.backend.domain.step.entity.NftTemplate;
import com.landin.backend.domain.step.entity.Step;
import com.landin.backend.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "user_nfts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "step_id"}),
        indexes = @Index(name = "idx_user_nft_user_event", columnList = "user_id, event_id")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserNft {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private Step step;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nft_template_id", nullable = false)
    private NftTemplate nftTemplate;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NftRarity rarity;

    @Column(nullable = false)
    private LocalDateTime mintedAt;

    @Enumerated(EnumType.STRING)
    private NftMintStatus mintStatus;

    private Long onChainChainId;

    @Column(length = 255)
    private String contractAddress;

    @Column(length = 1024)
    private String tokenUri;

    @Column(length = 128)
    private String tokenId;

    @Column(length = 128)
    private String transactionHash;

    private LocalDateTime onChainMintedAt;

    @Column(length = 1000)
    private String mintFailureReason;

    public NftMintStatus getEffectiveMintStatus() {
        return mintStatus != null ? mintStatus : NftMintStatus.OFFCHAIN_ONLY;
    }

    public void markPendingWallet(String tokenUri, String contractAddress, Long onChainChainId, String reason) {
        applyMintState(NftMintStatus.PENDING_WALLET, tokenUri, contractAddress, onChainChainId, null, null, null, reason);
    }

    public void markPendingOnChain(String tokenUri, String contractAddress, Long onChainChainId, String reason) {
        applyMintState(NftMintStatus.PENDING_ONCHAIN, tokenUri, contractAddress, onChainChainId, null, null, null, reason);
    }

    public void markOnChainMinted(
            String tokenUri,
            String contractAddress,
            Long onChainChainId,
            String tokenId,
            String transactionHash,
            LocalDateTime onChainMintedAt
    ) {
        applyMintState(
                NftMintStatus.MINTED_ONCHAIN,
                tokenUri,
                contractAddress,
                onChainChainId,
                tokenId,
                transactionHash,
                onChainMintedAt,
                null
        );
    }

    public void markOnChainFailed(String tokenUri, String contractAddress, Long onChainChainId, String reason) {
        applyMintState(NftMintStatus.FAILED_ONCHAIN, tokenUri, contractAddress, onChainChainId, null, null, null, reason);
    }

    private void applyMintState(
            NftMintStatus mintStatus,
            String tokenUri,
            String contractAddress,
            Long onChainChainId,
            String tokenId,
            String transactionHash,
            LocalDateTime onChainMintedAt,
            String mintFailureReason
    ) {
        this.mintStatus = mintStatus;
        this.tokenUri = tokenUri;
        this.contractAddress = contractAddress;
        this.onChainChainId = onChainChainId;
        this.tokenId = tokenId;
        this.transactionHash = transactionHash;
        this.onChainMintedAt = onChainMintedAt;
        this.mintFailureReason = mintFailureReason;
    }
}
