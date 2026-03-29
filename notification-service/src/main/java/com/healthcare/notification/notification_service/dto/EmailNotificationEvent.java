package com.healthcare.notification.notification_service.dto;

public record EmailNotificationEvent(
        String to,
        String subject,
        String body,
        Boolean html
) {
    public static EmailNotificationEvent fromRequest(EmailNotificationRequest request) {
        return new EmailNotificationEvent(
                request.to(),
                request.subject(),
                request.body(),
                request.html()
        );
    }

    public EmailNotificationRequest toRequest() {
        return new EmailNotificationRequest(to, subject, body, html);
    }
}

