package com.helthcaresystem.payment_service.service;

import com.helthcaresystem.payment_service.client.AuthUserClient;
import com.helthcaresystem.payment_service.client.NotificationClient;
import com.helthcaresystem.payment_service.model.entity.PaymentTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentNotificationService {

    private final AuthUserClient authUserClient;
    private final NotificationClient notificationClient;

    public void notifyPaymentSuccess(PaymentTransaction transaction) {
        String amount = formatAmount(transaction.getAmountMinor());
        String details = buildDetails(transaction);
        String content = "Payment success. Amount: %s. %s.".formatted(amount, details);
        notifyPatientAndAdmins(transaction, "Payment Update", "Payment Success", content);
    }

    public void notifyPaymentFailed(PaymentTransaction transaction, String reason) {
        String details = buildDetails(transaction);
        String content = "Payment failed. %s. %s.".formatted(safeReason(reason), details);
        notifyPatientAndAdmins(transaction, "Payment Update", "Payment Failed", content);
    }

    public void notifyRefundSuccess(PaymentTransaction transaction) {
        String amount = formatAmount(transaction.getRefundedAmountMinor());
        String details = buildDetails(transaction);
        String content = "Refund success. Refund amount: %s. %s.".formatted(amount, details);
        notifyPatientAndAdmins(transaction, "Payment Update", "Refund Success", content);
    }

    public void notifyRefundFailed(PaymentTransaction transaction, String reason) {
        String details = buildDetails(transaction);
        String content = "Refund failed. %s. %s.".formatted(safeReason(reason), details);
        notifyPatientAndAdmins(transaction, "Payment Update", "Refund Failed", content);
    }

    private void notifyPatientAndAdmins(PaymentTransaction transaction,
                                        String header,
                                        String contentHeader,
                                        String content) {
        Map<Long, AuthUserClient.UserContactOption> contacts = authUserClient.getUserContactOptions(
                List.of(transaction.getPatientId(), transaction.getDoctorId())
        );

        AuthUserClient.UserContactOption patientContact = contacts.get(transaction.getPatientId());
        sendSms(patientContact, header, contentHeader, content);

        for (AuthUserClient.UserContactOption adminContact : authUserClient.getAdminContactOptions()) {
            sendSms(adminContact, header, contentHeader, content);
        }
    }

    private void sendSms(AuthUserClient.UserContactOption contact,
                         String header,
                         String contentHeader,
                         String content) {
        if (contact == null) {
            return;
        }
        String phone = normalizePhone(contact.getPhone());
        if (phone == null) {
            log.warn("Skipping payment SMS because phone is missing/invalid for userId={}", contact.getUserId());
            return;
        }
        try {
            notificationClient.sendSms(phone, header, contentHeader, content);
        } catch (Exception ex) {
            log.warn("Failed to send payment SMS to {}: {}", phone, ex.getMessage());
        }
    }

    private String buildDetails(PaymentTransaction transaction) {
        String booking = transaction.getAppointmentId() == null
                ? "APT-" + transaction.getStripeSessionId()
                : "APT-" + transaction.getAppointmentId();
        String doctorName = safeValue(transaction.getDoctorName(), "Doctor #" + transaction.getDoctorId());

        AuthUserClient.UserContactOption patientContact = authUserClient
                .getUserContactOptions(List.of(transaction.getPatientId()))
                .get(transaction.getPatientId());
        String patientName = patientContact == null
                ? "Patient #" + transaction.getPatientId()
                : safeValue(patientContact.getName(), "Patient #" + transaction.getPatientId());

        return "Booking No: %s, Date: %s, Time: %s, Doctor: %s, Patient: %s"
                .formatted(
                        booking,
                        safeValue(transaction.getAppointmentDate(), "-"),
                        safeValue(transaction.getAppointmentTime(), "-"),
                        doctorName,
                        patientName
                );
    }

    private String safeReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return "Reason not provided";
        }
        return reason.trim();
    }

    private String safeValue(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private String formatAmount(Long minor) {
        if (minor == null) {
            return "0.00";
        }
        return "%.2f".formatted(minor / 100.0);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String raw = phone.trim();
        boolean hasPlus = raw.startsWith("+");
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() < 9 || digits.length() > 15) {
            return null;
        }
        return hasPlus ? "+" + digits : digits;
    }
}
