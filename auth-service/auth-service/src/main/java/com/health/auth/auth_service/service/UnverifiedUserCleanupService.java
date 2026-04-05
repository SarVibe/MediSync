package com.health.auth.auth_service.service;

import com.health.auth.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnverifiedUserCleanupService {

    private final UserRepository userRepository;

    @Value("${app.user.cleanup.unverified-hours}")
    private long unverifiedHours;

    @Scheduled(cron = "0 0 * * * *")
    public void cleanupUnverifiedUsers() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(unverifiedHours);
        long deleted = userRepository.deleteByIsVerifiedFalseAndCreatedAtBefore(cutoff);
        if (deleted > 0) {
            log.info("Cleaned up {} stale unverified users (cutoff={}h)", deleted, unverifiedHours);
        }
    }
}

