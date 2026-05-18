package com.landin.backend.domain.user.oauth;

import java.util.Locale;

public enum OAuthProvider {
    GOOGLE,
    KAKAO;

    public static OAuthProvider from(String value) {
        return OAuthProvider.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
