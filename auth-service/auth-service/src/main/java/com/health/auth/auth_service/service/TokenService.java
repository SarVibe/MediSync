package com.health.auth.auth_service.service;



import com.health.auth.auth_service.entity.RefreshToken;
import com.health.auth.auth_service.entity.User;
import com.health.auth.auth_service.exception.AuthException;
import com.health.auth.auth_service.repository.RefreshTokenRepository;
import com.health.auth.auth_service.security.JwtUtil;
import com.health.auth.auth_service.util.TokenBlacklistUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenService {

    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistUtil blacklistUtil;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiryMs;

    // ── Issue both tokens ─────────────────────────────────────────────────────
    @Transactional
    public TokenPair issueTokenPair(User user) {
        String accessToken  = jwtUtil.generateAccessToken(user);
        String rawRefresh   = jwtUtil.generateRefreshToken(user);
        String hashedRefresh = hashRefreshToken(rawRefresh);
        String refreshJti = jwtUtil.extractJti(rawRefresh);

        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .token(hashedRefresh)
                .tokenJti(refreshJti)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiryMs / 1000))
                .build();
        refreshTokenRepository.save(entity);

        return new TokenPair(accessToken, rawRefresh);
    }

    // ── Rotate refresh token ──────────────────────────────────────────────────
    @Transactional
    public TokenPair rotateRefreshToken(String rawRefreshToken, User user) {
        String refreshJti = jwtUtil.extractJti(rawRefreshToken);

        RefreshToken matched = refreshTokenRepository.findByTokenJti(refreshJti)
                .orElseThrow(() -> new AuthException("Invalid refresh token.", HttpStatus.UNAUTHORIZED));

        if (!matched.getUser().getId().equals(user.getId())
                || !hashRefreshToken(rawRefreshToken).equals(matched.getToken())) {
            throw new AuthException("Invalid refresh token.", HttpStatus.UNAUTHORIZED);
        }

        if (matched.isExpired()) {
            matched.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(matched);
            throw new AuthException("Refresh token expired. Please login again.", HttpStatus.UNAUTHORIZED);
        }

        if (matched.isRevokedOrUsed()) {
            // Replay detection: once a rotated token is seen again, revoke active sessions.
            revokeAllUserTokens(user);
            throw new AuthException("Refresh token reuse detected. Please login again.", HttpStatus.UNAUTHORIZED);
        }

        matched.setUsedAt(LocalDateTime.now());
        matched.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(matched);

        // Issue new pair
        return issueTokenPair(user);
    }

    // ── Blacklist access token on logout ──────────────────────────────────────
    public void blacklistAccessToken(String accessToken) {
        try {
            String jti = jwtUtil.extractJti(accessToken);
            long ttl   = jwtUtil.getRemainingTtlSeconds(accessToken);
            blacklistUtil.blacklist(jti, ttl);
        } catch (Exception e) {
            log.warn("Could not blacklist token: {}", e.getMessage());
        }
    }

    // ── Revoke all refresh tokens for user (on block) ─────────────────────────
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user, LocalDateTime.now());
        log.info("All refresh tokens revoked for userId={}", user.getId());
    }

    @Transactional
    public void revokeRefreshToken(String rawRefreshToken, User user) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        if (!jwtUtil.isTokenValid(rawRefreshToken)) {
            return;
        }

        String jti = jwtUtil.extractJti(rawRefreshToken);
        refreshTokenRepository.findByUserAndTokenJti(user, jti).ifPresent(token -> {
            if (hashRefreshToken(rawRefreshToken).equals(token.getToken()) && token.getRevokedAt() == null) {
                token.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(token);
            }
        });
    }

    private String hashRefreshToken(String rawRefreshToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawRefreshToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }

    // ── Validate access token ─────────────────────────────────────────────────
    public Claims validateAccessToken(String token) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new AuthException("Invalid token", HttpStatus.UNAUTHORIZED);
        }
        String jti = jwtUtil.extractJti(token);
        if (blacklistUtil.isBlacklisted(jti)) {
            throw new AuthException("Token has been invalidated", HttpStatus.UNAUTHORIZED);
        }
        return jwtUtil.parseToken(token);
    }

    // ── Scheduled cleanup of expired refresh tokens ───────────────────────────
    @Scheduled(cron = "0 0 2 * * *") // 2am daily
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteAllExpired(LocalDateTime.now());
        log.info("Expired refresh tokens cleaned up");
    }

    public record TokenPair(String accessToken, String refreshToken) {}
}