package com.landin.backend.domain.nft.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.nft.dto.GrantRewardResponse;
import com.landin.backend.domain.nft.dto.MintPolygonRequest;
import com.landin.backend.domain.nft.dto.MintRequestResponse;
import com.landin.backend.domain.nft.service.NftMintRequestService;
import com.landin.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * NFT 민팅 API (기획서 4.1 플로우 대응)
 *
 * <pre>
 * POST /api/mobile/nfts/{draftId}/mint-polygon         - Polygon 민팅 요청
 * GET  /api/mobile/nfts/{mintRequestId}/status         - 민팅 상태 폴링
 * POST /api/mobile/nfts/{mintRequestId}/grant-reward   - 포인트 지급 요청
 * POST /api/admin/nft-mints/{mintRequestId}/retry      - 관리자 Fabric 재동기화
 * </pre>
 */
@RestController
@RequiredArgsConstructor
public class NftMintController {

    private final NftMintRequestService nftMintRequestService;
    private final JwtTokenProvider jwtTokenProvider;

    // ─── Mobile endpoints ────────────────────────────────────────────────────

    @PostMapping("/api/mobile/nfts/{draftId}/mint-polygon")
    public ResponseEntity<ApiResponse<MintRequestResponse>> mintPolygon(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID draftId,
            @RequestBody @Valid MintPolygonRequest request
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        MintRequestResponse response = nftMintRequestService.mintPolygon(userId, draftId, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/api/mobile/nfts/{mintRequestId}/status")
    public ResponseEntity<ApiResponse<MintRequestResponse>> getStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID mintRequestId
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(nftMintRequestService.getStatus(userId, mintRequestId)));
    }

    @PostMapping("/api/mobile/nfts/{mintRequestId}/grant-reward")
    public ResponseEntity<ApiResponse<GrantRewardResponse>> grantReward(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID mintRequestId
    ) {
        UUID userId = jwtTokenProvider.getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(nftMintRequestService.grantReward(userId, mintRequestId)));
    }

    // ─── Admin endpoints ─────────────────────────────────────────────────────

    @PostMapping("/api/admin/nft-mints/{mintRequestId}/retry")
    public ResponseEntity<ApiResponse<MintRequestResponse>> adminRetry(
            @PathVariable UUID mintRequestId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(nftMintRequestService.adminRetry(mintRequestId)));
    }
}
