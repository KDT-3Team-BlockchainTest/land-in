package com.capstone.server.auth;

import com.capstone.server.user.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignupRequest(
	@NotBlank
	@Size(min = 3, max = 50)
	String username,

	@NotBlank
	@Email
	@Size(max = 255)
	String email,

	@NotBlank
	@Size(min = 8, max = 100)
	String password,

	@NotBlank
	@Size(max = 100)
	String name,

	@NotBlank
	@Size(max = 50)
	String nickname,

	@Size(max = 30)
	String phone,

	@NotNull
	UserRole role
) {
}
