package com.landin.backend.domain.dashboard.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.dashboard.dto.DashboardStatsResponse;
import com.landin.backend.domain.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;

import java.security.Principal;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
public ApiResponse<DashboardStatsResponse> getStats(Principal principal) {
    if (principal == null) {
        throw new IllegalStateException("로그인 사용자 정보가 없습니다.");
    }

    System.out.println("principal name = " + principal.getName());

    UUID userId = UUID.fromString(principal.getName());
    return ApiResponse.ok(dashboardService.getStats(userId));
}
}