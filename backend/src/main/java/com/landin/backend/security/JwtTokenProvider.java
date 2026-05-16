package com.landin.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    public static final String ROLE_USER = "USER";
    public static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_CLAIM = "role";

    private final SecretKey key;
    private final long expiration;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.key = Keys.hmacShaKeyFor(
                Objects.requireNonNull(jwtProperties.secret(), "JWT secret must not be null").getBytes()
        );
        this.expiration = jwtProperties.expiration();
    }

    public String generateToken(UUID userId) {
        return generateToken(userId, ROLE_USER);
    }

    public String generateToken(UUID subjectId, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .subject(Objects.requireNonNull(subjectId, "JWT subject id must not be null").toString())
                .claim(ROLE_CLAIM, Objects.requireNonNullElse(role, ROLE_USER))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public UUID getUserIdFromUserDetails(UserDetails userDetails) {
        return UUID.fromString(userDetails.getUsername());
    }

    public String getRole(String token) {
        Object role = parseClaims(token).get(ROLE_CLAIM);
        return role == null ? ROLE_USER : role.toString();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
