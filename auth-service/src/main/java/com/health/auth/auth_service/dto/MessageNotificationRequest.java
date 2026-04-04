package com.health.auth.auth_service.dto;

public record MessageNotificationRequest(
        String to,
        String header,
        String contentHeader,
        String content,
        String footnote,
        String footer
) {
}

