package com.landin.backend.domain.collection.service;

import com.landin.backend.domain.collection.dto.CollectionResponse;
import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import com.landin.backend.domain.participation.entity.EventParticipation;
import com.landin.backend.domain.participation.repository.EventParticipationRepository;
import com.landin.backend.domain.step.repository.StepCompletionRepository;
import com.landin.backend.domain.step.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final EventParticipationRepository participationRepository;
    private final StepRepository stepRepository;
    private final StepCompletionRepository stepCompletionRepository;

    @Transactional(readOnly = true)
    public List<CollectionResponse> getCollections(UUID userId, String status) {
        List<EventParticipation> participations = participationRepository.findByUserId(userId);

        List<CollectionResponse> collections = participations.stream()
                .map(ep -> buildCollectionResponse(ep, userId))
                .toList();

        if (status == null || status.isBlank()) {
            return collections;
        }

        CollectionResponse.CollectionStatus filter =
                CollectionResponse.CollectionStatus.valueOf(status.toUpperCase());
        return collections.stream()
                .filter(c -> c.getCollectionStatus() == filter)
                .toList();
    }

    private CollectionResponse buildCollectionResponse(EventParticipation ep, UUID userId) {
        Event event = ep.getEvent();
        String eventId = event.getId();

        long totalSteps = stepRepository.countByEventId(eventId);
        long completedSteps = stepCompletionRepository.countByUserIdAndStepEventId(userId, eventId);

        CollectionResponse.CollectionStatus collectionStatus;
        if (event.getStatus() == EventStatus.ENDED) {
            collectionStatus = CollectionResponse.CollectionStatus.ENDED;
        } else if (completedSteps >= totalSteps && totalSteps > 0) {
            collectionStatus = CollectionResponse.CollectionStatus.COMPLETED;
        } else {
            collectionStatus = CollectionResponse.CollectionStatus.ONGOING;
        }

        return CollectionResponse.builder()
                .eventId(eventId)
                .eventTitle(event.getTitle())
                .city(event.getCity())
                .country(event.getCountry())
                .eventStatus(event.getStatus())
                .collectionStatus(collectionStatus)
                .heroImageUrl(event.getHeroImageUrl())
                .themeColor(event.getThemeColor())
                .partnerName(event.getPartnerName())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .joinedAt(ep.getJoinedAt())
                .totalSteps((int) totalSteps)
                .completedSteps((int) completedSteps)
                .build();
    }
}
