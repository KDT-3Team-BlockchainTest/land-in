package com.landin.backend.domain.photodraft.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.photodraft.dto.CreatePhotoDraftRequest;
import com.landin.backend.domain.photodraft.dto.EditPhotoDraftRequest;
import com.landin.backend.domain.photodraft.dto.IpfsStatusResponse;
import com.landin.backend.domain.photodraft.dto.PhotoDraftResponse;
import com.landin.backend.domain.photodraft.entity.PhotoDraft;
import com.landin.backend.domain.photodraft.entity.PhotoDraftStatus;
import com.landin.backend.domain.photodraft.repository.PhotoDraftRepository;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhotoDraftService {

    private static final int DRAFT_EXPIRE_DAYS = 30;

    private final PhotoDraftRepository photoDraftRepository;
    private final UserRepository userRepository;

    /**
     * 사진 초안을 생성하고 S3 업로드 처리 후 Draft 상태를 반환한다.
     * S3 실제 업로드는 추후 S3Service 연동으로 교체할 stub 포함.
     */
    @Transactional
    public PhotoDraftResponse createDraft(UUID userId, CreatePhotoDraftRequest request, MultipartFile imageFile) {
        User user = userRepository.getReferenceById(Objects.requireNonNull(userId));

        PhotoDraft draft = PhotoDraft.builder()
                .user(user)
                .visitId(Objects.requireNonNull(request.getVisitId(), "visitId required"))
                .stepId(request.getStepId())
                .status(PhotoDraftStatus.DRAFT_CREATED)
                .moderationStatus("PENDING")
                .expiresAt(LocalDateTime.now().plusDays(DRAFT_EXPIRE_DAYS))
                .build();

        draft = photoDraftRepository.save(draft);

        // TODO: S3 업로드 연동 후 markUploadedToS3() 호출
        // 현재는 파일명만 기록하여 UPLOADED_TO_S3 상태로 전환
        if (imageFile != null && !imageFile.isEmpty()) {
            draft.markUploading();
            String mockS3Url = "s3://landin-drafts/" + draft.getId() + "/original/" + imageFile.getOriginalFilename();
            String mockThumbUrl = "s3://landin-drafts/" + draft.getId() + "/thumb/" + imageFile.getOriginalFilename();
            draft.markUploadedToS3(mockS3Url, mockThumbUrl, "sha256-placeholder");
            log.info("[PhotoDraftService] Draft created (S3 stub). draftId={}, visitId={}", draft.getId(), draft.getVisitId());
        }

        return PhotoDraftResponse.from(photoDraftRepository.save(draft));
    }

    /**
     * 사진 편집 정보(필터·프레임·배지)를 저장한다.
     */
    @Transactional
    public PhotoDraftResponse editDraft(UUID userId, UUID draftId, EditPhotoDraftRequest request) {
        PhotoDraft draft = findOwnedDraft(userId, draftId);
        String editedUrl = draft.getOriginalS3Url(); // TODO: S3 편집본 경로로 교체
        draft.applyEdit(request.getFilterType(), request.getFrameId(), editedUrl);
        return PhotoDraftResponse.from(photoDraftRepository.save(draft));
    }

    /**
     * IPFS 업로드를 시작한다. 실제 IPFS 업로드는 비동기 Job으로 처리된다.
     * 현재는 상태를 SELECTED_FOR_MINT로 전환하는 stub이다.
     */
    @Transactional
    public IpfsStatusResponse prepareIpfs(UUID userId, UUID draftId) {
        PhotoDraft draft = findOwnedDraft(userId, draftId);

        if (draft.getStatus() == PhotoDraftStatus.DRAFT_CREATED
                || draft.getStatus() == PhotoDraftStatus.UPLOADING) {
            throw new BusinessException(ErrorCode.DRAFT_NOT_READY_FOR_IPFS);
        }

        draft.markSelectedForMint();
        photoDraftRepository.save(draft);

        // TODO: 비동기 IPFS 업로드 Job 트리거
        log.info("[PhotoDraftService] IPFS prepare requested. draftId={}", draftId);

        return IpfsStatusResponse.builder()
                .status("UPLOADING_IMAGE")
                .build();
    }

    /**
     * IPFS 업로드 진행 상태를 조회한다.
     * 실제 구현에서는 NftMintRequest 상태를 기반으로 응답한다.
     */
    @Transactional(readOnly = true)
    public IpfsStatusResponse getIpfsStatus(UUID userId, UUID draftId) {
        PhotoDraft draft = findOwnedDraft(userId, draftId);

        // TODO: NftMintRequest.imageCid / metadataCid 상태 기반 응답으로 교체
        return IpfsStatusResponse.builder()
                .status(draft.getStatus().name())
                .build();
    }

    /**
     * 내 사진 초안 목록을 조회한다 (만료·삭제 제외).
     */
    @Transactional(readOnly = true)
    public List<PhotoDraftResponse> listMyDrafts(UUID userId) {
        return photoDraftRepository
                .findByUserIdAndStatusNotIn(userId, List.of(PhotoDraftStatus.EXPIRED, PhotoDraftStatus.DELETED))
                .stream()
                .map(PhotoDraftResponse::from)
                .toList();
    }

    /**
     * 사진 초안을 삭제한다.
     */
    @Transactional
    public void deleteDraft(UUID userId, UUID draftId) {
        PhotoDraft draft = findOwnedDraft(userId, draftId);
        draft.markDeleted();
        photoDraftRepository.save(draft);
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private PhotoDraft findOwnedDraft(UUID userId, UUID draftId) {
        return photoDraftRepository.findByIdAndUserId(draftId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PHOTO_DRAFT_NOT_FOUND));
    }
}
