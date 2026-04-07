package com.landin.backend.domain.reward.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.reward.dto.UserRewardResponse;
import com.landin.backend.domain.reward.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    /**
     * GET /api/rewards?status=available|used|expired
     */
    @GetMapping
    public ApiResponse<List<UserRewardResponse>> getRewards(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(rewardService.getRewards(userId, status));
    }

    /**
     * POST /api/rewards/{rewardId}/use
     */
    @PostMapping("/{rewardId}/use")
    public ApiResponse<UserRewardResponse> useReward(
            @PathVariable UUID rewardId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(rewardService.useReward(userId, rewardId), "리워드 사용 완료");
    }
}
