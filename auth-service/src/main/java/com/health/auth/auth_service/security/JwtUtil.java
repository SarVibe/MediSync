package com.health.auth.auth_service.security;


import com.health.auth.auth_service.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
public class JwtUtil {

    private final SecretKey signingKey;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiry}") long accessTokenExpiry,
            @Value("${app.jwt.refresh-token-expiry}") long refreshTokenExpiry) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
    }

    // ── Access token ──────────────────────────────────────────────────────────
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("status", user.getStatus().name());
        claims.put("profileId", user.getProfileId());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getId().toString())
                .id(UUID.randomUUID().toString()) // jti — used for blacklisting
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiry))
                .signWith(signingKey)
                .compact();
    }

    // ── Refresh token (opaque — stored hashed in DB) ──────────────────────────
    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiry))
                .signWith(signingKey)
                .compact();
    }

    // ── Parse & validate ──────────────────────────────────────────────────────
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserId(String token) {
        return parseToken(token).getSubject();
    }

    public String extractJti(String token) {
        return parseToken(token).getId();
    }

    public String extractRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public String extractProfileId(String token) {
        return parseToken(token).get("profileId", String.class);
    }

    public Date extractExpiration(String token) {
        return parseToken(token).getExpiration();
    }

    public long getRemainingTtlSeconds(String token) {
        Date expiry = extractExpiration(token);
        long remaining = expiry.getTime() - System.currentTimeMillis();
        return Math.max(remaining / 1000, 0);
    }

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid token: {}", e.getMessage());
            return false;
        }
    }

    public long getAccessTokenExpirySeconds() {
        return accessTokenExpiry / 1000;
    }

    public long getRefreshTokenExpirySeconds() {
        return refreshTokenExpiry / 1000;
    }
}
