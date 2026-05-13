package com.landin.backend.domain.event.dto;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class EventSummaryResponse {

    private String id;
    private String title;
    private String city;
    private String country;
    private EventStatus status;
    private boolean featured;
    private LocalDate startDate;
    private LocalDate endDate;
    private String heroImageUrl;
    private String heroImageFallbackUrl;
    private String partnerName;
    private String partnerLogoUrl;
    private String themeColor;
    private String rewardTitle;
    private String rewardDescription;
    private int totalSteps;

    public static EventSummaryResponse of(Event event, int totalSteps) {
        return of(event, totalSteps, null, null);
    }

    public static EventSummaryResponse of(Event event, int totalSteps, String rewardTitle, String rewardDescription) {
        return EventSummaryResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .city(event.getCity())
                .country(event.getCountry())
                .status(event.getStatus())
                .featured(event.isFeatured())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .heroImageUrl(event.getHeroImageUrl())
                .heroImageFallbackUrl(event.getHeroImageFallbackUrl())
                .partnerName(event.getPartnerName())
                .partnerLogoUrl(event.getPartnerLogoUrl())
                .themeColor(event.getThemeColor())
                .rewardTitle(rewardTitle)
                .rewardDescription(rewardDescription)
                .totalSteps(totalSteps)
                .build();
    }
}
