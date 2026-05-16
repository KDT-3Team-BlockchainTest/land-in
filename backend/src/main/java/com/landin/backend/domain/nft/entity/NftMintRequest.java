package com.landin.backend.domain.nft.entity;

import com.landin.backend.common.entity.BaseTimeEntity;
import com.landin.backend.domain.photodraft.entity.PhotoDraft;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/** NFT 민팅 요청 엔티티 (기획서 13.2 nft_mint_requests 테이블) */
@Entity
@Table(
        name = "nft_mint_requests",
        indexes = {
                @Index(name = "idx_mint_req_user", columnList = "user_id"),
                @Index(name = "idx_mint_req_visit", columnList = "visit_id"),
                @Index(name = "idx_mint_req_status", columnList = "mint_status")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NftMintRequest extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_id")
    private PhotoDraft draft;

    @Column(nullable = false, length = 36)
    private String visitId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NftMintRequestStatus mintStatus;

    @Column(length = 256)
    private String imageCid;

    @Column(length = 256)
    private String metadataCid;

    @Column(length = 512)
    private String tokenUri;

    @Column(length = 128)
    private String ownerWalletAddress;

    @Column(length = 128)
    private String polygonTxHash;

    @Column(length = 128)
    private String polygonTokenId;

    @Column(length = 256)
    private String fabricTxId;

    @Column(length = 1000)
    private String errorReason;

    @Column(nullable = false)
    @Builder.Default
    private int retryCount = 0;

    private LocalDateTime lastRetryAt;

    // ─── 상태 전이 메서드 ────────────────────────────────────────────────────

    public void markPolygonMintRequested() {
        this.mintStatus = NftMintRequestStatus.POLYGON_MINT_REQUESTED;
    }

    public void markPolygonMinted(String polygonTxHash, String polygonTokenId) {
        this.mintStatus = NftMintRequestStatus.POLYGON_MINTED;
        this.polygonTxHash = polygonTxHash;
        this.polygonTokenId = polygonTokenId;
        this.errorReason = null;
    }

    public void markPolygonMintFailed(String reason) {
        this.mintStatus = NftMintRequestStatus.POLYGON_MINT_FAILED;
        this.errorReason = reason;
        this.retryCount++;
        this.lastRetryAt = LocalDateTime.now();
    }

    public void markFabricRecordPending() {
        this.mintStatus = NftMintRequestStatus.FABRIC_RECORD_PENDING;
    }

    public void markFabricRecorded(String fabricTxId) {
        this.mintStatus = NftMintRequestStatus.FABRIC_RECORDED;
        this.fabricTxId = fabricTxId;
        this.errorReason = null;
    }

    public void markMintedButFabricFailed(String reason) {
        this.mintStatus = NftMintRequestStatus.MINTED_BUT_FABRIC_RECORD_FAILED;
        this.errorReason = reason;
    }

    public void markRewardPending() {
        this.mintStatus = NftMintRequestStatus.REWARD_PENDING;
    }

    public void markRewardGranted() {
        this.mintStatus = NftMintRequestStatus.REWARD_GRANTED;
        this.errorReason = null;
    }

    public void markRewardFailedAfterMint(String reason) {
        this.mintStatus = NftMintRequestStatus.REWARD_FAILED_AFTER_MINT;
        this.errorReason = reason;
        this.retryCount++;
        this.lastRetryAt = LocalDateTime.now();
    }

    public void markCompleted() {
        this.mintStatus = NftMintRequestStatus.MINT_COMPLETED;
    }

    public void applyIpfsCids(String imageCid, String metadataCid) {
        this.imageCid = imageCid;
        this.metadataCid = metadataCid;
        this.tokenUri = "ipfs://" + metadataCid;
    }

    public void applyOwnerWallet(String walletAddress) {
        this.ownerWalletAddress = walletAddress;
    }
}
