package com.landin.backend.domain.admin.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.admin.dto.AdminEventRequest;
import com.landin.backend.domain.admin.dto.AdminEventResponse;
import com.landin.backend.domain.admin.service.AdminEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final AdminEventService adminEventService;

    @GetMapping
    public ApiResponse<List<AdminEventResponse>> list(@AuthenticationPrincipal UserDetails userDetails) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(adminEventService.listEvents(adminId));
    }

    @GetMapping("/{eventId}")
    public ApiResponse<AdminEventResponse> get(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(adminEventService.getEvent(adminId, eventId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminEventResponse> create(
            @Valid @RequestBody AdminEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(adminEventService.createEvent(adminId, request), "이벤트가 생성되었습니다.");
    }

    @PutMapping("/{eventId}")
    public ApiResponse<AdminEventResponse> update(
            @PathVariable String eventId,
            @Valid @RequestBody AdminEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(adminEventService.updateEvent(adminId, eventId, request), "이벤트가 수정되었습니다.");
    }

    @DeleteMapping("/{eventId}")
    public ApiResponse<Void> delete(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        adminEventService.deleteEvent(adminId, eventId);
        return ApiResponse.ok(null, "이벤트가 삭제되었습니다.");
    }
}
