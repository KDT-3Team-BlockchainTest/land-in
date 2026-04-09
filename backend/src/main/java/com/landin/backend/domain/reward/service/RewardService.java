package com.landin.backend.domain.reward.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.reward.dto.UserRewardResponse;
import com.landin.backend.domain.reward.entity.RewardStatus;
import com.landin.backend.domain.reward.entity.UserReward;
import com.landin.backend.domain.reward.repository.UserRewardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final UserRewardRepository userRewardRepository;

    @Transactional(readOnly = true)
    public List<UserRewardResponse> getRewards(UUID userId, String status) {
        List<UserReward> rewards;
        if (status == null || status.isBlank()) {
            rewards = userRewardRepository.findByUserId(userId);
        } else {
            rewards = userRewardRepository.findByUserIdAndStatus(userId, RewardStatus.valueOf(status.toUpperCase()));
        }

        // 만료 여부를 읽을 때 계산 (배치 없이)
        LocalDate today = LocalDate.now();
        return rewards.stream()
                .map(r -> {
                    if (Objects.requireNonNull(r.getStatus(), "Reward status must not be null") == RewardStatus.AVAILABLE
                            && Objects.requireNonNull(r.getValidUntil(), "Reward expiry must not be null").isBefore(today)) {
                        r.expire();
                    }
                    return UserRewardResponse.from(r);
                })
                .toList();
    }

    @Transactional
    public UserRewardResponse useReward(UUID userId, UUID rewardId) {
        UserReward reward = userRewardRepository.findById(Objects.requireNonNull(rewardId, "Reward id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.REWARD_NOT_FOUND));

        if (!reward.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.REWARD_NOT_FOUND);
        }

        if (Objects.requireNonNull(reward.getStatus(), "Reward status must not be null") != RewardStatus.AVAILABLE) {
            throw new BusinessException(ErrorCode.REWARD_NOT_AVAILABLE);
        }

        if (Objects.requireNonNull(reward.getValidUntil(), "Reward expiry must not be null").isBefore(LocalDate.now())) {
            reward.expire();
            throw new BusinessException(ErrorCode.REWARD_NOT_AVAILABLE);
        }

        reward.use();
        return UserRewardResponse.from(reward);
    }
}
