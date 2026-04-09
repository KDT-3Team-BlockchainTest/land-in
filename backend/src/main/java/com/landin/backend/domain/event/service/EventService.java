package com.landin.backend.domain.event.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.event.dto.EventDetailResponse;
import com.landin.backend.domain.event.dto.EventSummaryResponse;
import com.landin.backend.domain.event.dto.StepResponse;
import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import com.landin.backend.domain.event.repository.EventRepository;
import com.landin.backend.domain.participation.repository.EventParticipationRepository;
import com.landin.backend.domain.step.entity.NftTemplate;
import com.landin.backend.domain.step.entity.Step;
import com.landin.backend.domain.step.repository.NftTemplateRepository;
import com.landin.backend.domain.step.repository.StepCompletionRepository;
import com.landin.backend.domain.step.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final StepRepository stepRepository;
    private final NftTemplateRepository nftTemplateRepository;
    private final StepCompletionRepository stepCompletionRepository;
    private final EventParticipationRepository eventParticipationRepository;

    @Transactional(readOnly = true)
    public List<EventSummaryResponse> getEvents(String status) {
        List<Event> events;
        if (status == null || status.isBlank()) {
            events = eventRepository.findAll();
        } else if ("featured".equalsIgnoreCase(status)) {
            events = eventRepository.findByFeaturedTrue();
        } else {
            EventStatus eventStatus = EventStatus.valueOf(status.toUpperCase());
            events = eventRepository.findByStatus(eventStatus);
        }

        return events.stream()
                .map(e -> EventSummaryResponse.of(e, (int) stepRepository.countByEventId(e.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDetailResponse getEventDetail(String eventId, UUID userId) {
        Event event = eventRepository.findById(Objects.requireNonNull(eventId, "Event id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

        List<Step> steps = stepRepository.findByEventIdOrderByOrderIndex(eventId);
        boolean joined = userId != null && eventParticipationRepository.existsByUserIdAndEventId(userId, eventId);

        Set<UUID> completedStepIds = userId != null
                ? stepCompletionRepository.findCompletedStepIdsByUserIdAndEventId(userId, eventId)
                : Collections.emptySet();

        List<StepResponse> stepResponses = buildStepResponses(steps, completedStepIds, joined);
        int completedCount = completedStepIds.size();

        return EventDetailResponse.of(event, stepResponses, completedCount, joined);
    }

    private List<StepResponse> buildStepResponses(List<Step> steps, Set<UUID> completedStepIds, boolean joined) {
        List<StepResponse> result = new ArrayList<>();
        boolean foundCurrent = false;

        for (Step step : steps) {
            NftTemplate nftTemplate = nftTemplateRepository.findByStepId(step.getId()).orElse(null);
            StepResponse.StepState state;

            if (completedStepIds.contains(step.getId())) {
                state = step.isFinalStep() ? StepResponse.StepState.REWARD : StepResponse.StepState.DONE;
            } else if (joined && !foundCurrent) {
                state = StepResponse.StepState.CURRENT;
                foundCurrent = true;
            } else {
                state = StepResponse.StepState.LOCKED;
            }

            result.add(StepResponse.of(step, nftTemplate, state));
        }

        return result;
    }
}
