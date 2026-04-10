package com.helthcaresystem.appointment_service.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class AuthUserClient {

    private final RestClient restClient;
    private final String internalApiKey;

    public AuthUserClient(RestClient.Builder restClientBuilder,
                          @Value("${auth.service.base-url:http://localhost:8086}") String authServiceBaseUrl,
                          @Value("${app.internal.api-key:profile-internal-dev-key}") String internalApiKey) {
        this.restClient = restClientBuilder.baseUrl(authServiceBaseUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public Map<Long, UserContactOption> getUserContactOptions(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            UserContactOptionsResponse response = restClient.post()
                    .uri("/auth/internal/users/contact-options")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new UserContactsRequest(userIds.stream().distinct().toList()))
                    .retrieve()
                    .body(UserContactOptionsResponse.class);

            List<UserContactOption> options = response == null || response.getData() == null
                    ? List.of()
                    : response.getData();

            return options.stream()
                    .collect(Collectors.toMap(UserContactOption::getUserId, Function.identity(), (left, right) -> left));
        } catch (Exception ex) {
            log.warn("Failed to fetch user contact options from auth-service: {}", ex.getMessage());
            return Collections.emptyMap();
        }
    }

    public List<UserContactOption> getAdminContactOptions() {
        try {
            UserContactOptionsResponse response = restClient.get()
                    .uri("/auth/internal/admins/contact-options")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .body(UserContactOptionsResponse.class);
            return response == null || response.getData() == null ? List.of() : response.getData();
        } catch (Exception ex) {
            log.warn("Failed to fetch admin contact options from auth-service: {}", ex.getMessage());
            return List.of();
        }
    }

    private record UserContactsRequest(List<Long> userIds) {
    }

    @Data
    public static class UserContactOptionsResponse {
        private boolean success;
        private String message;
        private List<UserContactOption> data;
    }

    @Data
    public static class UserContactOption {
        private Long userId;
        private String name;
        private String email;
        private String phone;
    }
}
