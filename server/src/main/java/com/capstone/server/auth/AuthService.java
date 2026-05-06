package com.capstone.server.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.capstone.server.common.api.ApiException;
import com.capstone.server.user.User;
import com.capstone.server.user.UserRepository;
import com.capstone.server.user.UserStatus;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public AuthUserResponse signup(SignupRequest request) {
		if (userRepository.existsByUsername(request.username())) {
			throw new ApiException(HttpStatus.CONFLICT, "USERNAME_ALREADY_EXISTS", "Username already exists.");
		}

		if (userRepository.existsByEmail(request.email())) {
			throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email already exists.");
		}

		User user = new User(
			request.username(),
			request.email(),
			passwordEncoder.encode(request.password()),
			request.name(),
			request.nickname(),
			request.phone(),
			request.role()
		);

		return AuthUserResponse.from(userRepository.save(user));
	}

	@Transactional(readOnly = true)
	public AuthUserResponse login(LoginRequest request) {
		User user = userRepository.findByUsername(request.username())
			.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "LOGIN_FAILED", "Invalid username or password."));

		if (user.getStatus() != UserStatus.ACTIVE || !passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "LOGIN_FAILED", "Invalid username or password.");
		}

		return AuthUserResponse.from(user);
	}
}
