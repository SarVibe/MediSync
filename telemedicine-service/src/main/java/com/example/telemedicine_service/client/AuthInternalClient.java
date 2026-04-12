package com.example.telemedicine_service.client;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class AuthInternalClient {

    private final RestClient restClient;
    private final String internalApiKey;

    public AuthInternalClient(RestClient.Builder restClientBuilder,
                              @Value("${auth.service.base-url}") String authServiceBaseUrl,
                              @Value("${app.internal.api-key}") String internalApiKey) {
        this.restClient = restClientBuilder.baseUrl(authServiceBaseUrl).build();
        this.internalApiKey = internalApiKey;
    }

    public List<UserContact> getUserContacts(List<Long> userIds) {
        ContactApiResponse response = restClient.post()
                .uri("/auth/internal/users/contact-options")
                .header("X-Internal-Api-Key", internalApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new UserContactsRequest(userIds))
                .retrieve()
                .body(ContactApiResponse.class);

        if (response == null || response.getData() == null) {
            throw new IllegalArgumentException("Auth service returned empty contact data.");
        }
        return response.getData();
    }

    public record UserContactsRequest(List<Long> userIds) {
    }

    @Data
    public static class ContactApiResponse {
        private boolean success;
        private String message;
        private List<UserContact> data;
    }

    @Data
    public static class UserContact {
        private Long userId;
        private String name;
        private String email;
        private String phone;
    }
}
