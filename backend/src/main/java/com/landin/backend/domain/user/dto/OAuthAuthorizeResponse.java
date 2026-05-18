package com.landin.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OAuthAuthorizeResponse {
    private String authorizationUrl;
}
