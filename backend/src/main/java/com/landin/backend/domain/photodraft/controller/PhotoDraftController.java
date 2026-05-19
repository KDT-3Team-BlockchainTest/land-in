package com.landin.backend.domain.photodraft.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.photodraft.dto.CreatePhotoDraftRequest;
import com.landin.backend.domain.photodraft.dto.EditPhotoDraftRequest;
import com.landin.backend.domain.photodraft.dto.IpfsStatusResponse;
import com.landin.backend.domain.photodraft.dto.PhotoDraftResponse;
import com.landin.backend.domain.photodraft.service.PhotoDraftService;
import com.landin.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * 사진 초안 API (기획서 9.2 화면 7·8·17 대응)
 *
 * <pre>
 * POST   /api/mobile/photo-drafts                        - 사진 초안 생성 (이미지 업로드 포함)
 * PATCH  /api/mobile/photo-drafts/{draftId}/edit         - 편집 정보 저장
 * POST   /api/mobile/photo-drafts/{draftId}/prepare-ipfs - IPFS 업로드 시작
 * GET    /api/mobile/photo-drafts/{draftId}/ipfs-status  - IPFS 진행 상태 조회
 * GET    /api/mobile/photo-drafts                        - 내 초안 목록
 * DELETE /api/mobile/photo-drafts/{draftId}              - 초안 삭제
 * </pre>
 */
@RestController
@RequestMapping("/api/mobile/photo-drafts")
@RequiredArgsConstructor
public class PhotoDraftController {

    private final PhotoDraftService photoDraftService;
    private final JwtTokenProvider jwtTokenProvider;

    /** 사진 초안 생성 — multipart/form-data (이미지 + JSON 메타) */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PhotoDraftResponse>> createDraft(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("metadata") @Valid CreatePhotoDraftRequest request,
            @RequestPart("image") MultipartFile imageFile
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        PhotoDraftResponse response = photoDraftService.createDraft(userId, request, imageFile);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /** 편집 정보 저장 (필터·프레임·배지·날짜 스탬프) */
    @PatchMapping("/{draftId}/edit")
    public ResponseEntity<ApiResponse<PhotoDraftResponse>> editDraft(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID draftId,
            @RequestBody EditPhotoDraftRequest request
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(photoDraftService.editDraft(userId, draftId, request)));
    }

    /** IPFS 업로드 시작 */
    @PostMapping("/{draftId}/prepare-ipfs")
    public ResponseEntity<ApiResponse<IpfsStatusResponse>> prepareIpfs(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID draftId
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(photoDraftService.prepareIpfs(userId, draftId)));
    }

    /** IPFS 업로드 진행 상태 폴링 */
    @GetMapping("/{draftId}/ipfs-status")
    public ResponseEntity<ApiResponse<IpfsStatusResponse>> getIpfsStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID draftId
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(photoDraftService.getIpfsStatus(userId, draftId)));
    }

    /** 내 초안 목록 조회 */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PhotoDraftResponse>>> listMyDrafts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(photoDraftService.listMyDrafts(userId)));
    }

    /** 초안 삭제 */
    @DeleteMapping("/{draftId}")
    public ResponseEntity<ApiResponse<Void>> deleteDraft(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID draftId
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        photoDraftService.deleteDraft(userId, draftId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
