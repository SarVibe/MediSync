package com.healthcare.medicalrecords.medical_service.client;

import com.healthcare.medicalrecords.medical_service.exception.AuthException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
@SuppressWarnings("unused")
public class AuthRoleClient {

    @Value("${app.auth-service.base-url}")
    private String authServiceBaseUrl;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public void submitDoctorUpgradeRequest(Long userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Api-Key", internalApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(Map.of("userId", userId), headers);

        try {
            restTemplate.exchange(
                    authServiceBaseUrl + "/auth/internal/doctor-upgrade-request",
                    HttpMethod.POST,
                    request,
                    String.class
            );
        } catch (Exception ex) {
            log.warn("Failed to submit doctor upgrade request to auth service: {}", ex.getMessage());
            throw new AuthException("Unable to submit doctor upgrade request.", HttpStatus.BAD_GATEWAY);
        }
    }

    public void syncUserName(Long userId, String name) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Api-Key", internalApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(Map.of("userId", userId, "name", name), headers);

        try {
            restTemplate.exchange(
                    authServiceBaseUrl + "/auth/internal/sync-user-name",
                    HttpMethod.POST,
                    request,
                    String.class
            );
        } catch (Exception ex) {
            log.warn("Failed to sync user name to auth service: userId={}, error={}", userId, ex.getMessage());
            throw new AuthException("Unable to sync user name.", HttpStatus.BAD_GATEWAY);
        }
    }

    public void syncProfileCompletion(Long userId, boolean isProfileCompleted) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Api-Key", internalApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(
                Map.of("userId", userId, "isProfileCompleted", isProfileCompleted),
                headers
        );

        try {
            restTemplate.exchange(
                    authServiceBaseUrl + "/auth/internal/sync-profile-completion",
                    HttpMethod.POST,
                    request,
                    String.class
            );
        } catch (Exception ex) {
            log.warn("Failed to sync profile completion to auth service: userId={}, error={}", userId, ex.getMessage());
            throw new AuthException("Unable to sync profile completion.", HttpStatus.BAD_GATEWAY);
        }
    }
}
