package com.health.auth.auth_service.service;


import com.health.auth.auth_service.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClientProfileService {

    @Value("${app.profile-service.base-url}")
    private String profileServiceUrl;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    private final WebClient.Builder webClientBuilder;

    /**
     * Called after registration to initialize an empty profile.
     * Returns the profileId created by Profile Service.
     */
    public String initializeProfile(Long userId, String name, User.Role role) {
        try {
            Map<String, Object> body = Map.of(
                    "userId", userId,
                    "name", name,
                    "role", role.name()
            );

            Map<?, ?> response = webClientBuilder.build()
                    .post()
                    .uri(profileServiceUrl + "/api/profiles/init")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // Synchronous — we need profileId before returning

            if (response != null && response.containsKey("profileId")) {
                return response.get("profileId").toString();
            }
        } catch (Exception e) {
            log.error("Failed to initialize profile for userId={}: {}", userId, e.getMessage());
            // Don't fail registration — profileId can be set later
            // In production, use an event/message queue for resilience
        }
        return null;
    }

    /**
     * Notify Profile Service when a doctor is approved/rejected.
     */
    public void notifyDoctorStatusChange(Long userId, String status, String reason) {
        try {
            Map<String, Object> body = reason != null
                    ? Map.of("userId", userId, "status", status, "reason", reason)
                    : Map.of("userId", userId, "status", status);

            webClientBuilder.build()
                    .post()
                    .uri(profileServiceUrl + "/api/profiles/status-update")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .subscribe(
                            v -> log.info("Profile Service notified for userId={} status={}", userId, status),
                            e -> log.error("Failed to notify Profile Service: {}", e.getMessage())
                    );
        } catch (Exception e) {
            log.error("Profile Service notification failed: {}", e.getMessage());
        }
    }
}