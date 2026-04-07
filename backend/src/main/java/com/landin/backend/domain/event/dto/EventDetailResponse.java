package com.landin.backend.domain.event.dto;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class EventDetailResponse {

    private String id;
    private String title;
    private String city;
    private String country;
    private EventStatus status;
    private boolean featured;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String heroImageUrl;
    private String heroImageFallbackUrl;
    private String mapImageUrl;
    private String partnerName;
    private String partnerLogoUrl;
    private String themeColor;
    private List<StepResponse> steps;
    private int completedSteps;
    private int totalSteps;
    private boolean joined;

    public static EventDetailResponse of(Event event, List<StepResponse> steps,
                                          int completedSteps, boolean joined) {
        return EventDetailResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .city(event.getCity())
                .country(event.getCountry())
                .status(event.getStatus())
                .featured(event.isFeatured())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .description(event.getDescription())
                .heroImageUrl(event.getHeroImageUrl())
                .heroImageFallbackUrl(event.getHeroImageFallbackUrl())
                .mapImageUrl(event.getMapImageUrl())
                .partnerName(event.getPartnerName())
                .partnerLogoUrl(event.getPartnerLogoUrl())
                .themeColor(event.getThemeColor())
                .steps(steps)
                .completedSteps(completedSteps)
                .totalSteps(steps.size())
                .joined(joined)
                .build();
    }
}
