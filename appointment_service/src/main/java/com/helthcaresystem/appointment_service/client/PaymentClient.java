package com.helthcaresystem.appointment_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class PaymentClient {

    private final RestClient restClient;

    public PaymentClient(RestClient.Builder restClientBuilder,
                         @Value("${payment.service.base-url:http://localhost:8085}") String paymentServiceBaseUrl) {
        this.restClient = restClientBuilder.baseUrl(paymentServiceBaseUrl).build();
    }

    public void triggerAutoRefund(String authHeader, Long appointmentId, String paymentSessionId) {
        if (authHeader == null || authHeader.isBlank() || appointmentId == null) {
            return;
        }
        try {
            restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/payments/refunds/appointments/{appointmentId}/auto")
                            .queryParam("paymentSessionId", paymentSessionId == null ? "" : paymentSessionId)
                            .build(appointmentId))
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            String message = ex.getResponseBodyAsString();
            if (message == null || message.isBlank()) {
                message = ex.getStatusText();
            }
            throw new IllegalArgumentException("Payment service refund call failed: " + message);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Payment service is unreachable: " + ex.getMessage());
        }
    }
}
