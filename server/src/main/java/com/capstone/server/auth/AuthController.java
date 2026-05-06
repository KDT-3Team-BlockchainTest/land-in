package com.capstone.server.auth;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.capstone.server.common.api.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/signup")
	public ApiResponse<AuthUserResponse> signup(@Valid @RequestBody SignupRequest request) {
		return ApiResponse.ok("Signed up.", authService.signup(request));
	}

	@PostMapping("/login")
	public ApiResponse<AuthUserResponse> login(@Valid @RequestBody LoginRequest request) {
		return ApiResponse.ok("Logged in.", authService.login(request));
	}
}
