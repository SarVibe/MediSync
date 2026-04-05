package com.health.auth.auth_service.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenBlacklistUtil {

    private final StringRedisTemplate redisTemplate;

    private static final String BLACKLIST_PREFIX = "blacklist:";

    // ── Blacklist an access token by its jti ──────────────────────────────────
    public void blacklist(String jti, long ttlSeconds) {
        if (ttlSeconds <= 0) return; // Already expired, no need to blacklist
        redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + jti,
                "1",
                Duration.ofSeconds(ttlSeconds)
        );
        log.debug("Token blacklisted: jti={}", jti);
    }

    // ── Check if a jti is blacklisted ─────────────────────────────────────────
    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + jti));
    }
}
