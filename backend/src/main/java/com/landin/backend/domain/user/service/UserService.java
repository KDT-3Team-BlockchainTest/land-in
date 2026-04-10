package com.landin.backend.domain.user.service;

import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.config.BlockchainProperties;
import com.landin.backend.domain.nft.service.OnChainNftMintService;
import com.landin.backend.domain.user.dto.AuthResponse;
import com.landin.backend.domain.user.dto.LoginRequest;
import com.landin.backend.domain.user.dto.SignupRequest;
import com.landin.backend.domain.user.dto.UserProfileResponse;
import com.landin.backend.domain.user.dto.WalletConnectRequest;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import com.landin.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final OnChainNftMintService onChainNftMintService;
    private final BlockchainProperties blockchainProperties;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = Objects.requireNonNull(
                User.builder()
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .displayName(request.getDisplayName())
                        .avatarUrl(request.getAvatarUrl())
                        .build(),
                "User must not be null"
        );

        user = Objects.requireNonNull(userRepository.save(user), "Saved user must not be null");

        return AuthResponse.builder()
                .id(Objects.requireNonNull(user.getId(), "Saved user id must not be null"))
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .walletAddress(user.getWalletAddress())
                .walletChainId(user.getWalletChainId())
                .walletProvider(user.getWalletProvider())
                .walletConnectedAt(user.getWalletConnectedAt())
                .accessToken(jwtTokenProvider.generateToken(Objects.requireNonNull(user.getId(), "Saved user id must not be null")))
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
                .walletAddress(user.getWalletAddress())
                .walletChainId(user.getWalletChainId())
                .walletProvider(user.getWalletProvider())
                .walletConnectedAt(user.getWalletConnectedAt())
                .accessToken(jwtTokenProvider.generateToken(user.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "User id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse connectWallet(UUID userId, WalletConnectRequest request) {
        if (!Objects.equals(request.getChainId(), blockchainProperties.getChainId())) {
            throw new BusinessException(ErrorCode.INVALID_WALLET_NETWORK);
        }

        User user = userRepository.findById(Objects.requireNonNull(userId, "User id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.updateWalletConnection(
                request.getWalletAddress().trim(),
                request.getChainId(),
                request.getWalletProvider() == null ? "injected" : request.getWalletProvider().trim()
        );

        onChainNftMintService.scheduleRetryAfterCommit(Objects.requireNonNull(user.getId(), "User id must not be null"));
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse disconnectWallet(UUID userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "User id must not be null"))
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.clearWalletConnection();
        return UserProfileResponse.from(user);
    }
}
