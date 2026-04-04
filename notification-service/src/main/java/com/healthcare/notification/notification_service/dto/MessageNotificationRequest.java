package com.healthcare.notification.notification_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MessageNotificationRequest(
        @NotBlank(message = "Recipient mobile number is required")
        @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Recipient mobile number must be valid")
        String to,

        @NotBlank(message = "Message header is required")
        @Size(max = 120, message = "Message header must be at most 120 characters")
        String header,

        @Size(max = 120, message = "Content header must be at most 120 characters")
        String contentHeader,

        @NotBlank(message = "Message content is required")
        @Size(max = 500, message = "Message content must be at most 500 characters")
        String content,

        @Size(max = 120, message = "Footnote must be at most 120 characters")
        String footnote,

        @Size(max = 120, message = "Footer must be at most 120 characters")
        String footer
) {
}
