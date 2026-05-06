package com.capstone.server.auth;

import java.time.LocalDateTime;

import com.capstone.server.user.User;
import com.capstone.server.user.UserRole;
import com.capstone.server.user.UserStatus;

public record AuthUserResponse(
	Long id,
	String username,
	String email,
	String name,
	String nickname,
	String phone,
	UserRole role,
	UserStatus status,
	LocalDateTime createdAt
) {

	public static AuthUserResponse from(User user) {
		return new AuthUserResponse(
			user.getId(),
			user.getUsername(),
			user.getEmail(),
			user.getName(),
			user.getNickname(),
			user.getPhone(),
			user.getRole(),
			user.getStatus(),
			user.getCreatedAt()
		);
	}
}
