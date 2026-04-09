package com.helthcaresystem.appointment_service.client;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class DoctorProfileClient {

    private final RestClient restClient;

    public DoctorProfileClient(RestClient.Builder restClientBuilder,
                               @Value("${profile.service.base-url:http://localhost:8083}") String profileServiceBaseUrl) {
        this.restClient = restClientBuilder.baseUrl(profileServiceBaseUrl).build();
    }

    public Map<Long, DoctorOption> getDoctorOptions(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return Collections.emptyMap();
        }

        try {
            DoctorPublicSummaryApiResponse response = restClient.get()
                    .uri("/api/profiles/doctors/public")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(DoctorPublicSummaryApiResponse.class);

            List<DoctorOption> options = response == null || response.getData() == null
                    ? List.of()
                    : response.getData();

            return options.stream().collect(Collectors.toMap(DoctorOption::getUserId, Function.identity(), (left, right) -> left));
        } catch (RestClientResponseException ex) {
            return Collections.emptyMap();
        }
    }

    public Map<Long, PatientOption> getPatientOptions(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return Collections.emptyMap();
        }

        try {
            PatientOptionsApiResponse response = restClient.get()
                    .uri("/api/profiles/patients/options")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(PatientOptionsApiResponse.class);

            List<PatientOption> options = response == null || response.getData() == null
                    ? List.of()
                    : response.getData();

            return options.stream().collect(Collectors.toMap(PatientOption::getUserId, Function.identity(), (left, right) -> left));
        } catch (RestClientResponseException ex) {
            return Collections.emptyMap();
        }
    }

    @Data
    public static class DoctorOptionsApiResponse {
        private boolean success;
        private String message;
        private List<DoctorOption> data;
    }

    @Data
    public static class DoctorPublicSummaryApiResponse {
        private boolean success;
        private String message;
        private List<DoctorOption> data;
    }

    @Data
    public static class PatientOptionsApiResponse {
        private boolean success;
        private String message;
        private List<PatientOption> data;
    }

    @Data
    public static class DoctorOption {
        private Long userId;
        private String fullName;
        private String specialization;
        private String qualifications;
        private Integer experienceYears;
        private String profileImageUrl;
    }

    @Data
    public static class PatientOption {
        private Long userId;
        private String fullName;
    }
}
