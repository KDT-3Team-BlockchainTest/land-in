package com.landin.backend.domain.user.oauth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OAuthProviderProperties {
    private String clientId = "";
    private String clientSecret = "";
    private String redirectUri = "";
    private String authorizationUri = "";
    private String tokenUri = "";
    private String userInfoUri = "";
}
