package com.health.auth.auth_service.service;

import com.health.auth.auth_service.dto.EmailNotificationRequest;
import com.health.auth.auth_service.dto.MessageNotificationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    @Value("${app.notification-service.base-url}")
    private String notificationServiceBaseUrl;

    @Value("${app.notification-service.sms-path:/api/notifications/message}")
    private String smsPath;

    @Value("${app.notification-service.email-path:/api/notifications/email}")
    private String emailPath;

    private final WebClient.Builder webClientBuilder;

    public void sendOtp(String phone, String otp) {
        MessageNotificationRequest request = new MessageNotificationRequest(
                phone,
                "MediSync Healthcare Platform OTP",
                "Verification Code",
                otp,
                "Valid for 5 minutes.",
                "Do not share this code with anyone.");
        sendSmsNotification(request, "OTP", maskPhone(phone));
    }

    public void sendAdminOtp(String email, String otp) {
        EmailNotificationRequest request = new EmailNotificationRequest(
                email,
                "MediSync Healthcare Platform Admin 2FA OTP",
                String.format("Your admin 2FA code is: %s. Valid for 5 minutes.", otp),
                false);
        sendEmailNotification(request, "ADMIN_2FA", maskEmail(email));
    }

    public void sendAdminPasswordResetOtp(String email, String otp) {
        EmailNotificationRequest request = new EmailNotificationRequest(
                email,
                "MediSync Healthcare Platform Admin Password Reset OTP",
                String.format("Your password reset OTP is: %s. It expires in 5 minutes.", otp),
                false);
        sendEmailNotification(request, "ADMIN_PASSWORD_RESET", maskEmail(email));
    }

    public void sendDoctorApprovalSms(String phone, String doctorName) {
        MessageNotificationRequest request = new MessageNotificationRequest(
                phone,
                "MediSync Healthcare Platform Doctor Onboarding",
                "Registration Approved",
                String.format("Dear %s, your registration has been approved. You can now log in.", doctorName),
                null,
                null);
        sendSmsNotification(request, "DOCTOR_APPROVAL", maskPhone(phone));
    }

    public void sendDoctorRejectionSms(String phone, String doctorName, String reason) {
        MessageNotificationRequest request = new MessageNotificationRequest(
                phone,
                "MediSync Healthcare Platform Doctor Onboarding",
                "Registration Rejected",
                String.format("Dear Dr. %s, your registration has been rejected.", doctorName),
                reason == null || reason.isBlank() ? null : "Reason: " + reason,
                null);
        sendSmsNotification(request, "DOCTOR_REJECTION", maskPhone(phone));
    }

    private void sendSmsNotification(MessageNotificationRequest request, String messageType, String maskedRecipient) {
        try {
            webClientBuilder.build()
                    .post()
                    .uri(notificationServiceBaseUrl + smsPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Notification queued via notification-service: type={}, recipient={}", messageType,
                    maskedRecipient);
        } catch (Exception e) {
            log.error("Failed to queue {} notification for {}: {}", messageType, maskedRecipient, e.getMessage());
            // Keep auth flows resilient even if notification-service is temporarily
            // unavailable.
        }
    }

    private void sendEmailNotification(EmailNotificationRequest request, String messageType, String maskedRecipient) {
        try {
            webClientBuilder.build()
                    .post()
                    .uri(notificationServiceBaseUrl + emailPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Notification queued via notification-service: type={}, recipient={}", messageType,
                    maskedRecipient);
        } catch (Exception e) {
            log.error("Failed to queue {} notification for {}: {}", messageType, maskedRecipient, e.getMessage());
            // Keep auth flows resilient even if notification-service is temporarily
            // unavailable.
        }
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return "**";
        }
        int visiblePrefix = Math.min(6, phone.length());
        return phone.substring(0, visiblePrefix) + "**";
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "**";
        }

        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "**";
        }

        return email.substring(0, Math.min(3, atIndex)) + "***" + email.substring(atIndex);
    }
}