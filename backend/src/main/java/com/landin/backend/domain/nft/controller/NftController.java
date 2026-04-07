package com.landin.backend.domain.nft.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.nft.dto.UserNftResponse;
import com.landin.backend.domain.nft.entity.UserNft;
import com.landin.backend.domain.nft.repository.UserNftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/nfts")
@RequiredArgsConstructor
public class NftController {

    private final UserNftRepository userNftRepository;

    /**
     * GET /api/nfts?eventId=xxx (eventId 없으면 전체)
     */
    @GetMapping
    public ApiResponse<List<UserNftResponse>> getNfts(
            @RequestParam(required = false) String eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());

        List<UserNft> nfts = (eventId != null && !eventId.isBlank())
                ? userNftRepository.findByUserIdAndEventId(userId, eventId)
                : userNftRepository.findByUserId(userId);

        return ApiResponse.ok(nfts.stream().map(UserNftResponse::from).toList());
    }
}
