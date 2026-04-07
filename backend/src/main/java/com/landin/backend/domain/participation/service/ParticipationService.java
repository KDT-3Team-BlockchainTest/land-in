package com.landin.backend.domain.participation.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.event.entity.Event;
import com.landin.backend.domain.event.entity.EventStatus;
import com.landin.backend.domain.event.repository.EventRepository;
import com.landin.backend.domain.participation.entity.EventParticipation;
import com.landin.backend.domain.participation.repository.EventParticipationRepository;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final EventParticipationRepository participationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public void joinEvent(UUID userId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

        // active 이벤트만 참여 가능
        if (event.getStatus() != EventStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.EVENT_NOT_JOINABLE);
        }

        if (participationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new BusinessException(ErrorCode.ALREADY_JOINED);
        }

        User user = userRepository.getReferenceById(userId);

        EventParticipation participation = EventParticipation.builder()
                .user(user)
                .event(event)
                .joinedAt(LocalDateTime.now())
                .build();

        participationRepository.save(participation);
    }

    @Transactional(readOnly = true)
    public List<String> getJoinedEventIds(UUID userId) {
        return participationRepository.findEventIdsByUserId(userId);
    }
}
