package com.landin.backend.domain.nfc.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.nfc.dto.NfcVerifyRequest;
import com.landin.backend.domain.nfc.dto.NfcVerifyResponse;
import com.landin.backend.domain.nfc.service.NfcService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/nfc")
@RequiredArgsConstructor
public class NfcController {

    private final NfcService nfcService;

    /**
     * POST /api/nfc/verify
     * NFC 태그 검증 → 스텝 완료 → NFT 발행 → 리워드 발급 (단일 트랜잭션)
     */
    @PostMapping("/verify")
    public ApiResponse<NfcVerifyResponse> verify(
            @Valid @RequestBody NfcVerifyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(nfcService.verify(userId, request), "NFC 인증 성공");
    }
}
