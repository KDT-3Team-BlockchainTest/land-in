package com.landin.backend.domain.admin.dto;

import com.landin.backend.domain.reward.entity.RewardTemplate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminRewardResponse {

    private String title;
    private String description;
    private String partnerName;
    private String howToUse;
    private int validityDays;
    private String emoji;
    private String accentColor;

    public static AdminRewardResponse from(RewardTemplate template) {
        if (template == null) return null;
        return AdminRewardResponse.builder()
                .title(template.getTitle())
                .description(template.getDescription())
                .partnerName(template.getPartnerName())
                .howToUse(template.getHowToUse())
                .validityDays(template.getValidityDays())
                .emoji(template.getEmoji())
                .accentColor(template.getAccentColor())
                .build();
    }
}
