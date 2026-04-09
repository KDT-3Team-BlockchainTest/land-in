package com.landin.backend.domain.user.dto;

import com.landin.backend.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UserProfileResponse {
    private UUID id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String walletAddress;
    private Long walletChainId;
    private String walletProvider;
    private LocalDateTime walletConnectedAt;

    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .walletAddress(user.getWalletAddress())
                .walletChainId(user.getWalletChainId())
                .walletProvider(user.getWalletProvider())
                .walletConnectedAt(user.getWalletConnectedAt())
                .build();
    }
}
