package com.example.telemedicine_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NotificationClient {

    private final RestClient restClient;
    private final String smsPath;

    public NotificationClient(RestClient.Builder restClientBuilder,
                              @Value("${notification.service.base-url}") String notificationServiceBaseUrl,
                              @Value("${notification.service.sms-path}") String smsPath) {
        this.restClient = restClientBuilder.baseUrl(notificationServiceBaseUrl).build();
        this.smsPath = smsPath;
    }

    public void sendSms(String to, String header, String contentHeader, String content) {
        restClient.post()
                .uri(smsPath)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MessageNotificationRequest(to, header, contentHeader, content, null, null))
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
}
