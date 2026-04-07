package com.landin.backend.domain.user.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.user.dto.AuthResponse;
import com.landin.backend.domain.user.dto.LoginRequest;
import com.landin.backend.domain.user.dto.SignupRequest;
import com.landin.backend.domain.user.dto.UserProfileResponse;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import com.landin.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .avatarUrl(request.getAvatarUrl())
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .accessToken(jwtTokenProvider.generateToken(user.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .accessToken(jwtTokenProvider.generateToken(user.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserProfileResponse.from(user);
    }
}
