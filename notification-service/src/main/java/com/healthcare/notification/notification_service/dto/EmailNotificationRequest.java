package com.healthcare.notification.notification_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmailNotificationRequest(
        @NotBlank(message = "Recipient email is required")
        @Email(message = "Recipient email must be valid")
        String to,

        @NotBlank(message = "Email subject is required")
        @Size(max = 200, message = "Email subject must be at most 200 characters")
        String subject,

        @NotBlank(message = "Email body is required")
        @Size(max = 5000, message = "Email body must be at most 5000 characters")
        String body,

        Boolean html
) {
}

