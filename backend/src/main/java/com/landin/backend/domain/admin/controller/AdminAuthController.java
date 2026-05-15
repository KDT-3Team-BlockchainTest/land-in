package com.landin.backend.domain.admin.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.admin.dto.AdminAuthResponse;
import com.landin.backend.domain.admin.dto.AdminLoginRequest;
import com.landin.backend.domain.admin.dto.AdminProfileResponse;
import com.landin.backend.domain.admin.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ApiResponse<AdminAuthResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ApiResponse.ok(adminAuthService.login(request), "관리자 로그인 성공");
    }

    @GetMapping("/me")
    public ApiResponse<AdminProfileResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(adminAuthService.getProfile(adminId));
    }
}
