package com.landin.backend.domain.admin.dto;

import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class AdminEventResponse {

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
    private String partnerName;
    private String themeColor;

    private List<AdminStepResponse> steps;
    private AdminRewardResponse reward;

    public static AdminEventResponse of(Event event, List<AdminStepResponse> steps, AdminRewardResponse reward) {
        return AdminEventResponse.builder()
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
                .partnerName(event.getPartnerName())
                .themeColor(event.getThemeColor())
                .steps(steps)
                .reward(reward)
                .build();
    }
}
