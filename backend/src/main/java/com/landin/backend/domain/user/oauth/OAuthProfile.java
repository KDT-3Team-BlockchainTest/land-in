package com.landin.backend.domain.user.oauth;

public record OAuthProfile(
        OAuthProvider provider,
        String providerUserId,
        String email,
        String displayName,
        String avatarUrl
) {
}
