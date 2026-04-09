package com.landin.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class AuthResponse {
    private UUID id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String walletAddress;
    private Long walletChainId;
    private String walletProvider;
    private LocalDateTime walletConnectedAt;
    private String accessToken;
}
