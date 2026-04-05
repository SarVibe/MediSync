package com.health.auth.auth_service.dto;

public record EmailNotificationRequest(
        String to,
        String subject,
        String body,
        Boolean html
) {
}

