package com.landin.backend.domain.dashboard.service;

import com.landin.backend.domain.dashboard.dto.DashboardStatsResponse;
import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import com.landin.backend.domain.nft.repository.UserNftRepository;
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
public class DashboardService {

    private final UserNftRepository userNftRepository;
    private final StepCompletionRepository stepCompletionRepository;
    private final EventParticipationRepository participationRepository;
    private final StepRepository stepRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(UUID userId) {
        long nftCount = userNftRepository.countByUserId(userId);
        long landmarkCount = stepCompletionRepository.countByUserId(userId);

        List<EventParticipation> participations = participationRepository.findByUserId(userId);

        long cityCount = participations.stream()
                .map(ep -> ep.getEvent().getCity())
                .distinct()
                .count();

        long countryCount = participations.stream()
                .map(ep -> ep.getEvent().getCountry())
                .distinct()
                .count();

        long completedCollectionCount = participations.stream()
                .filter(ep -> {
                    String eventId = ep.getEvent().getId();
                    long total = stepRepository.countByEventId(eventId);
                    long completed = stepCompletionRepository.countByUserIdAndStepEventId(userId, eventId);
                    return total > 0 && completed >= total;
                })
                .count();

        long activeCollectionsCount = participations.stream()
                .filter(ep -> {
                    Event event = ep.getEvent();
                    if (event.getStatus() == EventStatus.ENDED) return false;
                    String eventId = event.getId();
                    long total = stepRepository.countByEventId(eventId);
                    long completed = stepCompletionRepository.countByUserIdAndStepEventId(userId, eventId);
                    return total > 0 && completed < total;
                })
                .count();

        return DashboardStatsResponse.builder()
                .nftCount(nftCount)
                .landmarkCount(landmarkCount)
                .cityCount(cityCount)
                .countryCount(countryCount)
                .completedCollectionCount(completedCollectionCount)
                .activeCollectionsCount(activeCollectionsCount)
                .build();
    }
}
