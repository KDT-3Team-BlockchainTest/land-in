package com.landin.backend.domain.reward.dto;

import com.landin.backend.domain.reward.entity.RewardStatus;
import com.landin.backend.domain.reward.entity.UserReward;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UserRewardResponse {
    private UUID id;
    private String eventId;
    private String eventTitle;
    private String title;
    private String description;
    private String partnerName;
    private String howToUse;
    private String couponCode;
    private RewardStatus status;
    private LocalDateTime issuedAt;
    private LocalDate validUntil;
    private LocalDateTime usedAt;
    private String emoji;
    private String accentColor;

    public static UserRewardResponse from(UserReward reward) {
        return UserRewardResponse.builder()
                .id(reward.getId())
                .eventId(reward.getEvent().getId())
                .eventTitle(reward.getEvent().getTitle())
                .title(reward.getRewardTemplate().getTitle())
                .description(reward.getRewardTemplate().getDescription())
                .partnerName(reward.getRewardTemplate().getPartnerName())
                .howToUse(reward.getRewardTemplate().getHowToUse())
                .couponCode(reward.getCouponCode())
                .status(reward.getStatus())
                .issuedAt(reward.getIssuedAt())
                .validUntil(reward.getValidUntil())
                .usedAt(reward.getUsedAt())
                .emoji(reward.getRewardTemplate().getEmoji())
                .accentColor(reward.getRewardTemplate().getAccentColor())
                .build();
    }
}
