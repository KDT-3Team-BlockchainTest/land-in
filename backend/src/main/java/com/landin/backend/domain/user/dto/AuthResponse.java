package com.landin.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AuthResponse {
    private UUID id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String accessToken;
}
