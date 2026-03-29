package com.healthcare.notification.notification_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MessageNotificationRequest(
        @NotBlank(message = "Recipient mobile number is required")
        @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Recipient mobile number must be valid")
        String to,

        @NotBlank(message = "OTP purpose is required")
        @Size(max = 120, message = "OTP purpose must be at most 120 characters")
        String otpPurpose,

        @NotBlank(message = "OTP code is required")
        @Size(max = 20, message = "OTP code must be at most 20 characters")
        String otpCode,

        @NotBlank(message = "OTP validity text is required")
        @Size(max = 80, message = "OTP validity text must be at most 80 characters")
        String validity
) {
}
