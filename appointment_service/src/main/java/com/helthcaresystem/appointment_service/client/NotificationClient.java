package com.helthcaresystem.appointment_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NotificationClient {

    private final RestClient restClient;
    private final String smsPath;
    private final String emailPath;

    public NotificationClient(RestClient.Builder restClientBuilder,
                              @Value("${notification.service.base-url:http://localhost:8082}") String notificationServiceBaseUrl,
                              @Value("${notification.service.sms-path:/api/notifications/message}") String smsPath,
                              @Value("${notification.service.email-path:/api/notifications/email}") String emailPath) {
        this.restClient = restClientBuilder.baseUrl(notificationServiceBaseUrl).build();
        this.smsPath = smsPath;
        this.emailPath = emailPath;
    }

    public void sendSms(String to, String header, String contentHeader, String content) {
        restClient.post()
                .uri(smsPath)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MessageNotificationRequest(to, header, contentHeader, content, null, null))
                .retrieve()
                .toBodilessEntity();
    }

    public void sendEmail(String to, String subject, String body) {
        restClient.post()
                .uri(emailPath)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new EmailNotificationRequest(to, subject, body, false))
                .retrieve()
                .toBodilessEntity();
    }

    private record MessageNotificationRequest(
            String to,
            String header,
            String contentHeader,
            String content,
            String footnote,
            String footer
    ) {
    }

    private record EmailNotificationRequest(
            String to,
            String subject,
            String body,
            Boolean html
    ) {
    }
}
