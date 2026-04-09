package com.landin.backend.domain.participation.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.participation.service.ParticipationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class ParticipationController {

    private final ParticipationService participationService;

    @PostMapping("/{eventId}/join")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> joinEvent(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        participationService.joinEvent(userId, eventId);
        return ApiResponse.ok(null, "이벤트 참여 완료");
    }

    @GetMapping("/joined")
    public ApiResponse<List<String>> getJoinedEventIds(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(participationService.getJoinedEventIds(userId));
    }
}
