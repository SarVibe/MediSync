package com.example.telemedicine_service.security;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class AuthValidationClient {

    private final RestClient restClient;

    public AuthValidationClient(RestClient.Builder restClientBuilder,
                                @Value("${auth.service.base-url}") String authServiceBaseUrl) {
        this.restClient = restClientBuilder.baseUrl(authServiceBaseUrl).build();
    }

    public AuthenticatedUser validateToken(String authHeader) {
        try {
            AuthValidateApiResponse response = restClient.post()
                    .uri("/auth/validate")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(AuthValidateApiResponse.class);

            if (response == null || response.getData() == null) {
                throw new IllegalArgumentException("Authentication service returned an empty validation response.");
            }

            ValidatePayload payload = response.getData();
            return new AuthenticatedUser(
                    payload.getUserId(),
                    payload.getRole(),
                    payload.getStatus(),
                    payload.getProfileId()
            );
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException("Invalid or expired token.");
        }
    }

    @Data
    public static class AuthValidateApiResponse {
        private boolean success;
        private String message;
        private ValidatePayload data;
    }

    @Data
    public static class ValidatePayload {
        private Long userId;
        private String role;
        private String status;
        private String profileId;
        private String jti;
    }
}
