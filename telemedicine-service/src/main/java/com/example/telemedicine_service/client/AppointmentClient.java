package com.example.telemedicine_service.client;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;

@Component
public class AppointmentClient {

    private final RestClient restClient;

    public AppointmentClient(RestClient.Builder restClientBuilder,
                             @Value("${appointment.service.base-url}") String appointmentServiceBaseUrl) {
        this.restClient = restClientBuilder.baseUrl(appointmentServiceBaseUrl).build();
    }

    public AppointmentData getAppointmentById(String authHeader, Long appointmentId) {
        AppointmentApiResponse response = restClient.get()
                .uri("/api/appointments/{id}", appointmentId)
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(AppointmentApiResponse.class);

        if (response == null) {
            throw new IllegalArgumentException("Appointment service returned an empty response.");
        }
        return response;
    }

    public void updateAppointmentStatus(String authHeader, Long appointmentId, String status, String reason) {
        restClient.put()
                .uri("/api/appointments/{id}/status", appointmentId)
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new AppointmentStatusUpdateRequest(status, reason))
                .retrieve()
                .toBodilessEntity();
    }

    public record AppointmentStatusUpdateRequest(String status, String reason) {
    }

    public interface AppointmentData {
        Long getId();
        Long getPatientId();
        Long getDoctorId();
        String getPatientName();
        String getDoctorName();
        String getStatus();
        LocalDateTime getScheduledAt();
        LocalDateTime getCreatedAt();
        LocalDateTime getUpdatedAt();
    }

    @Data
    public static class AppointmentApiResponse implements AppointmentData {
        private Long id;
        private Long patientId;
        private Long doctorId;
        private String patientName;
        private String doctorName;
        private String status;
        private LocalDateTime scheduledAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
