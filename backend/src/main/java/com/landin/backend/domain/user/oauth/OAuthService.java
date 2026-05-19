package com.landin.backend.domain.user.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.landin.backend.common.exception.BusinessException;
import com.landin.backend.common.exception.ErrorCode;
import com.landin.backend.domain.user.dto.AuthResponse;
import com.landin.backend.domain.user.dto.OAuthAuthorizeResponse;
import com.landin.backend.domain.user.entity.User;
import com.landin.backend.domain.user.repository.UserRepository;
import com.landin.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class OAuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final OAuthProperties properties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    private final RestClient restClient = RestClient.create();

    public OAuthAuthorizeResponse buildAuthorizationUrl(OAuthProvider provider, String redirectUri, String next) {
        OAuthProviderProperties providerProperties = getConfiguredProvider(provider);
        String state = encodeState(redirectUri, next);

        String authorizationUrl = UriComponentsBuilder
                .fromUriString(providerProperties.getAuthorizationUri())
                .queryParam("response_type", "code")
                .queryParam("client_id", providerProperties.getClientId())
                .queryParam("redirect_uri", providerProperties.getRedirectUri())
                .queryParam("scope", provider == OAuthProvider.GOOGLE ? "openid email profile" : "profile_nickname profile_image account_email")
                .queryParam("state", state)
                .build()
                .toUriString();

        return OAuthAuthorizeResponse.builder()
                .authorizationUrl(authorizationUrl)
                .build();
    }

    @Transactional
    public URI handleCallback(OAuthProvider provider, String code, String state) {
        Map<String, String> decodedState = decodeState(state);
        String redirectUri = Objects.requireNonNullElse(decodedState.get("redirectUri"), "http://localhost:5173/oauth/callback");
        String next = Objects.requireNonNullElse(decodedState.get("next"), "/");

        OAuthProviderProperties providerProperties = getConfiguredProvider(provider);
        String accessToken = exchangeCode(provider, providerProperties, code);
        OAuthProfile profile = fetchProfile(provider, providerProperties, accessToken);
        AuthResponse auth = loginOrCreate(profile);

        String userJson = writeUserJson(auth);
        return UriComponentsBuilder
                .fromUriString(redirectUri)
                .queryParam("oauth_token", auth.getAccessToken())
                .queryParam("oauth_user", userJson)
                .queryParam("next", next)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();
    }

    public URI buildErrorRedirect(String state, String message) {
        String redirectUri = "http://localhost:5173/oauth/callback";
        String next = "/";

        try {
            Map<String, String> decodedState = decodeState(state);
            redirectUri = requireLocalRedirectUri(decodedState.get("redirectUri"));
            next = Objects.requireNonNullElse(decodedState.get("next"), "/");
        } catch (BusinessException ignored) {
            // Fall back to the local frontend callback if the provider state is missing or invalid.
        }

        return UriComponentsBuilder
                .fromUriString(redirectUri)
                .queryParam("oauth_error", Objects.requireNonNullElse(message, ErrorCode.OAUTH_FAILED.getMessage()))
                .queryParam("next", next)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();
    }

    private OAuthProviderProperties getConfiguredProvider(OAuthProvider provider) {
        OAuthProviderProperties providerProperties = properties.getProvider(provider);
        if (isBlank(providerProperties.getClientId()) || isBlank(providerProperties.getRedirectUri())) {
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }
        if (provider == OAuthProvider.GOOGLE && isBlank(providerProperties.getClientSecret())) {
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }
        return providerProperties;
    }

    private String exchangeCode(OAuthProvider provider, OAuthProviderProperties providerProperties, String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", providerProperties.getClientId());
        if (!isBlank(providerProperties.getClientSecret())) {
            form.add("client_secret", providerProperties.getClientSecret());
        }
        form.add("redirect_uri", providerProperties.getRedirectUri());
        form.add("code", code);

        JsonNode response;
        try {
            response = restClient.post()
                    .uri(providerProperties.getTokenUri())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("OAuth token exchange failed. provider={}", provider, e);
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }

        String accessToken = response == null ? null : response.path("access_token").asText(null);
        if (isBlank(accessToken)) {
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }
        return accessToken;
    }

    private OAuthProfile fetchProfile(OAuthProvider provider, OAuthProviderProperties providerProperties, String accessToken) {
        JsonNode response;
        try {
            response = restClient.get()
                    .uri(providerProperties.getUserInfoUri())
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("OAuth user profile request failed. provider={}", provider, e);
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }

        if (response == null) {
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }

        return switch (provider) {
            case GOOGLE -> googleProfile(response);
            case KAKAO -> kakaoProfile(response);
        };
    }

    private OAuthProfile googleProfile(JsonNode node) {
        String providerUserId = node.path("sub").asText();
        String email = node.path("email").asText();
        String name = node.path("name").asText(email);
        String picture = node.path("picture").asText(null);
        return new OAuthProfile(OAuthProvider.GOOGLE, providerUserId, normalizeEmail(email), name, picture);
    }

    private OAuthProfile kakaoProfile(JsonNode node) {
        String providerUserId = node.path("id").asText();
        JsonNode account = node.path("kakao_account");
        JsonNode profile = account.path("profile");
        String email = account.path("email").asText("kakao_" + providerUserId + "@oauth.landin.local");
        String name = profile.path("nickname").asText("Kakao User");
        String picture = profile.path("thumbnail_image_url").asText(null);
        return new OAuthProfile(OAuthProvider.KAKAO, providerUserId, normalizeEmail(email), name, picture);
    }

    private AuthResponse loginOrCreate(OAuthProfile profile) {
        User user = userRepository.findByEmail(profile.email())
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(profile.email())
                        .password(passwordEncoder.encode(randomPassword()))
                        .displayName(profile.displayName())
                        .avatarUrl(profile.avatarUrl())
                        .build()));

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

    private String encodeState(String redirectUri, String next) {
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "redirectUri", requireLocalRedirectUri(redirectUri),
                    "next", Objects.requireNonNullElse(next, "/")
            ));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }
    }

    private Map<String, String> decodeState(String state) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(state);
            return objectMapper.readValue(decoded, objectMapper.getTypeFactory().constructMapType(Map.class, String.class, String.class));
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }
    }

    private String requireLocalRedirectUri(String redirectUri) {
        String value = Objects.requireNonNullElse(redirectUri, "http://localhost:5173/oauth/callback").trim();
        if (value.startsWith("http://localhost:") || value.startsWith("http://127.0.0.1:")) {
            return value;
        }
        throw new BusinessException(ErrorCode.OAUTH_FAILED);
    }

    private String writeUserJson(AuthResponse auth) {
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "id", auth.getId(),
                    "email", auth.getEmail(),
                    "displayName", auth.getDisplayName(),
                    "avatarUrl", auth.getAvatarUrl() == null ? "" : auth.getAvatarUrl(),
                    "walletAddress", auth.getWalletAddress() == null ? "" : auth.getWalletAddress(),
                    "walletChainId", auth.getWalletChainId() == null ? "" : auth.getWalletChainId(),
                    "walletProvider", auth.getWalletProvider() == null ? "" : auth.getWalletProvider(),
                    "walletConnectedAt", auth.getWalletConnectedAt() == null ? "" : auth.getWalletConnectedAt()
            ));
            return json;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.OAUTH_FAILED);
        }
    }

    private String randomPassword() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String normalizeEmail(String email) {
        return Objects.requireNonNull(email, "Email must not be null").trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
