package com.landin.backend.domain.photodraft.entity;

import com.landin.backend.common.entity.BaseTimeEntity;
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
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/** 사진 초안 엔티티 (기획서 13.2 photo_drafts 테이블) */
@Entity
@Table(
        name = "photo_drafts",
        indexes = {
                @Index(name = "idx_photo_draft_user", columnList = "user_id"),
                @Index(name = "idx_photo_draft_visit", columnList = "visit_id")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PhotoDraft extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Fabric 원장의 visitId (Spring Boot UUID) */
    @Column(nullable = false, length = 36)
    private String visitId;

    /** NFC 태그가 속한 step UUID (이벤트 step 참조) */
    @Column(length = 36)
    private String stepId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PhotoDraftStatus status;

    @Column(length = 512)
    private String originalS3Url;

    @Column(length = 512)
    private String editedS3Url;

    @Column(length = 512)
    private String thumbnailUrl;

    @Column(length = 50)
    private String filterType;

    @Column(length = 50)
    private String frameId;

    /** 중복 업로드 방지용 SHA-256 (이미지 원본 해시) */
    @Column(length = 128)
    private String imageHash;

    /** 이미지 검수 상태: PENDING | APPROVED | REJECTED */
    @Column(length = 50)
    private String moderationStatus;

    @Column(length = 500)
    private String moderationReason;

    /** Draft 만료 시각 (기본 30일 또는 캠페인 종료일 + 7일 중 짧은 것) */
    private LocalDateTime expiresAt;

    // ─── 상태 전이 메서드 ────────────────────────────────────────────────────

    public void markUploading() {
        this.status = PhotoDraftStatus.UPLOADING;
    }

    public void markUploadedToS3(String originalS3Url, String thumbnailUrl, String imageHash) {
        this.status = PhotoDraftStatus.UPLOADED_TO_S3;
        this.originalS3Url = originalS3Url;
        this.thumbnailUrl = thumbnailUrl;
        this.imageHash = imageHash;
    }

    public void applyEdit(String filterType, String frameId, String editedS3Url) {
        this.status = PhotoDraftStatus.EDITING;
        this.filterType = filterType;
        this.frameId = frameId;
        this.editedS3Url = editedS3Url;
    }

    public void markSelectedForMint() {
        this.status = PhotoDraftStatus.SELECTED_FOR_MINT;
    }

    public void markReadyForIpfs() {
        this.moderationStatus = "APPROVED";
        this.status = PhotoDraftStatus.READY_FOR_IPFS;
    }

    public void markDeleted() {
        this.status = PhotoDraftStatus.DELETED;
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
