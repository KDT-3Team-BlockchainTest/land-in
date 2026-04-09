package com.landin.backend.domain.user.controller;

import com.landin.backend.common.response.ApiResponse;
import com.landin.backend.domain.user.dto.AuthResponse;
import com.landin.backend.domain.user.dto.LoginRequest;
import com.landin.backend.domain.user.dto.SignupRequest;
import com.landin.backend.domain.user.dto.UserProfileResponse;
import com.landin.backend.domain.user.dto.WalletConnectRequest;
import com.landin.backend.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ApiResponse.ok(userService.signup(request), "회원가입 성공");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(userService.login(request), "로그인 성공");
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(userService.getProfile(userId));
    }

    @PatchMapping("/wallet")
    public ApiResponse<UserProfileResponse> connectWallet(
            @Valid @RequestBody WalletConnectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(userService.connectWallet(userId, request), "지갑 연결 성공");
    }

    @DeleteMapping("/wallet")
    public ApiResponse<UserProfileResponse> disconnectWallet(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ApiResponse.ok(userService.disconnectWallet(userId), "지갑 연결 해제 성공");
    }
}
