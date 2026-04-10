package com.helthcaresystem.payment_service.client;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

@Component
public class AppointmentClient {
    private final RestClient restClient;

    public AppointmentClient(RestClient.Builder builder,
                             @Value("${appointment.service.base-url}") String appointmentServiceBaseUrl) {
        this.restClient = builder.baseUrl(appointmentServiceBaseUrl).build();
    }

    public AppointmentPayload createPendingPaymentAppointment(String authHeader,
                                                              CreatePendingAppointmentRequest request) {
        return postToAppointmentService("/api/appointments/pending-payment", authHeader, request);
    }

    public AppointmentPayload confirmPendingPaymentAppointment(String authHeader, ConfirmPendingAppointmentRequest request) {
        return postToAppointmentService("/api/appointments/pending-payment/confirm", authHeader, request);
    }

    public AppointmentPayload cancelPendingPaymentAppointment(String authHeader, ConfirmPendingAppointmentRequest request) {
        return postToAppointmentService("/api/appointments/pending-payment/cancel", authHeader, request);
    }

    private AppointmentPayload postToAppointmentService(String uri, String authHeader, Object requestBody) {
        try {
            return restClient.post()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .body(requestBody)
                    .retrieve()
                    .body(AppointmentPayload.class);
        } catch (RestClientResponseException ex) {
            String body = ex.getResponseBodyAsString();
            String message = extractMessage(body);
            if (message == null || message.isBlank()) {
                message = ex.getStatusText();
            }
            if (message == null || message.isBlank()) {
                message = "No response body returned.";
            }
            throw new IllegalArgumentException(
                    "Appointment service call failed (" + ex.getStatusCode().value() + "): " + message
            );
        } catch (ResourceAccessException ex) {
            throw new IllegalArgumentException("Appointment service is unreachable: " + ex.getMessage());
        }
    }

    private String extractMessage(String rawBody) {
        if (rawBody == null || rawBody.isBlank()) {
            return null;
        }
        String marker = "\"message\":\"";
        int start = rawBody.indexOf(marker);
        if (start >= 0) {
            int valueStart = start + marker.length();
            int valueEnd = rawBody.indexOf('"', valueStart);
            if (valueEnd > valueStart) {
                return rawBody.substring(valueStart, valueEnd);
            }
        }
        return rawBody;
    }

    @Data
    public static class CreatePendingAppointmentRequest {
        private Long doctorId;
        private String reason;
        private String date;
        private String time;
        private String paymentSessionId;
    }

    @Data
    public static class ConfirmPendingAppointmentRequest {
        private String paymentSessionId;
    }

    @Data
    public static class AppointmentPayload {
        private Long id;
        private Long patientId;
        private Long doctorId;
        private String status;
        private String date;
        private String time;
    }
}
