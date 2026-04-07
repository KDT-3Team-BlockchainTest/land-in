package com.landin.backend.domain.reward.repository;

import com.landin.backend.domain.reward.entity.RewardStatus;
import com.landin.backend.domain.reward.entity.UserReward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRewardRepository extends JpaRepository<UserReward, UUID> {
    List<UserReward> findByUserId(UUID userId);
    List<UserReward> findByUserIdAndStatus(UUID userId, RewardStatus status);
    boolean existsByUserIdAndEventId(UUID userId, String eventId);
    long countByUserIdAndStatus(UUID userId, RewardStatus status);
}
