package com.landin.backend.domain.event.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.event.dto.EventDetailResponse;
import com.landin.backend.domain.event.dto.EventSummaryResponse;
import com.landin.backend.domain.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    /**
     * GET /api/events?status=active|featured|upcoming|ended
     * 인증 없이 공개 접근 가능
     */
    @GetMapping
    public ApiResponse<List<EventSummaryResponse>> getEvents(
            @RequestParam(required = false) String status) {
        return ApiResponse.ok(eventService.getEvents(status));
    }

    /**
     * GET /api/events/{eventId}
     * 인증 시 스텝별 사용자 상태(done/current/locked) 포함
     */
    @GetMapping("/{eventId}")
    public ApiResponse<EventDetailResponse> getEventDetail(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = userDetails != null ? UUID.fromString(userDetails.getUsername()) : null;
        return ApiResponse.ok(eventService.getEventDetail(eventId, userId));
    }
}
