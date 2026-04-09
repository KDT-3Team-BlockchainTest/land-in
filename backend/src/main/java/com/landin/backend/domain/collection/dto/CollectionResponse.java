package com.landin.backend.domain.collection.dto;

import com.landin.backend.domain.event.entity.EventStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class CollectionResponse {

    public enum CollectionStatus { ONGOING, COMPLETED, ENDED }

    private String eventId;
    private String eventTitle;
    private String city;
    private String country;
    private EventStatus eventStatus;
    private CollectionStatus collectionStatus;
    private String heroImageUrl;
    private String themeColor;
    private String partnerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime joinedAt;
    private int totalSteps;
    private int completedSteps;
}
