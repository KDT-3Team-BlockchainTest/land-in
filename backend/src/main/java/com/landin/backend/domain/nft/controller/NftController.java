package com.landin.backend.domain.nft.controller;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.nft.dto.UserNftResponse;
import com.landin.backend.domain.nft.entity.UserNft;
import com.landin.backend.domain.nft.repository.UserNftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/nfts")
@RequiredArgsConstructor
public class NftController {

    private final UserNftRepository userNftRepository;

    @GetMapping
    public ApiResponse<List<UserNftResponse>> getNfts(
            @RequestParam(required = false) String eventId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());

        List<UserNft> nfts = (eventId != null && !eventId.isBlank())
                ? userNftRepository.findByUserIdAndEventId(userId, eventId)
                : userNftRepository.findByUserId(userId);

        return ApiResponse.ok(nfts.stream().map(UserNftResponse::from).toList());
    }

    @GetMapping("/{nftId}")
    public ApiResponse<UserNftResponse> getNft(
            @PathVariable UUID nftId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());

        UserNft nft = userNftRepository.findDetailedById(nftId)
                .filter(candidate -> candidate.getUser() != null && userId.equals(candidate.getUser().getId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.NFT_NOT_FOUND));

        return ApiResponse.ok(UserNftResponse.from(nft));
    }

    @GetMapping("/{nftId}/metadata")
    public Map<String, Object> getMetadata(@PathVariable UUID nftId) {
        UserNft nft = userNftRepository.findDetailedById(nftId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NFT_NOT_FOUND));

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("name", nft.getName());
        metadata.put(
                "description",
                nft.getNftTemplate().getDescription() != null
                        ? nft.getNftTemplate().getDescription()
                        : nft.getEvent().getTitle() + " commemorative NFT"
        );
        metadata.put("image", nft.getImageUrl());
        metadata.put("attributes", List.of(
                Map.of("trait_type", "Event", "value", nft.getEvent().getTitle()),
                Map.of("trait_type", "Step", "value", nft.getStep().getPlaceName()),
                Map.of("trait_type", "Rarity", "value", nft.getRarity().name()),
                Map.of("trait_type", "Mint Status", "value", nft.getEffectiveMintStatus().name())
        ));
        return metadata;
    }
}
