package com.example.telemedicine_service.client;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ProfileClient {

    private final RestClient restClient;

    public ProfileClient(RestClient.Builder restClientBuilder,
                         @Value("${profile.service.base-url}") String profileServiceBaseUrl) {
        this.restClient = restClientBuilder.baseUrl(profileServiceBaseUrl).build();
    }

    public Map<Long, String> getDoctorNames(String authHeader) {
        ProfileOptionApiResponse response = restClient.get()
                .uri("/api/profiles/doctors/options")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .body(ProfileOptionApiResponse.class);
        return toMap(response);
    }

    public Map<Long, String> getPatientNames(String authHeader) {
        ProfileOptionApiResponse response = restClient.get()
                .uri("/api/profiles/patients/options")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .body(ProfileOptionApiResponse.class);
        return toMap(response);
    }

    private Map<Long, String> toMap(ProfileOptionApiResponse response) {
        if (response == null || response.getData() == null) {
            return Map.of();
        }
        return response.getData().stream()
                .collect(Collectors.toMap(ProfileOptionDto::getUserId, ProfileOptionDto::getFullName, (a, b) -> a));
    }

    @Data
    public static class ProfileOptionApiResponse {
        private boolean success;
        private String message;
        private List<ProfileOptionDto> data;
    }

    @Data
    public static class ProfileOptionDto {
        private Long userId;
        private String fullName;
    }
}
