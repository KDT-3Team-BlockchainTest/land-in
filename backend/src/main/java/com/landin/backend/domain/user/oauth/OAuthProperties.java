package com.landin.backend.domain.user.oauth;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.oauth")
public class OAuthProperties {
    private OAuthProviderProperties google = new OAuthProviderProperties();
    private OAuthProviderProperties kakao = new OAuthProviderProperties();

    public OAuthProviderProperties getProvider(OAuthProvider provider) {
        return switch (provider) {
            case GOOGLE -> google;
            case KAKAO -> kakao;
        };
    }
}
