package com.helthcaresystem.payment_service.dto;

import com.helthcaresystem.payment_service.model.entity.PaymentTransaction;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class PaymentTransactionResponse {
    Long id;
    String sessionId;
    String paymentIntentId;
    Long appointmentId;
    Long patientId;
    String patientName;
    Long doctorId;
    String doctorName;
    String doctorSpecialization;
    String appointmentDate;
    String appointmentTime;
    String reason;
    Long amount;
    Long amountMinor;
    String currency;
    String status;
    String failureReason;
    LocalDateTime paidAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static PaymentTransactionResponse fromEntity(PaymentTransaction transaction) {
        return PaymentTransactionResponse.builder()
                .id(transaction.getId())
                .sessionId(transaction.getStripeSessionId())
                .paymentIntentId(transaction.getStripePaymentIntentId())
                .appointmentId(transaction.getAppointmentId())
                .patientId(transaction.getPatientId())
                .patientName("Patient #" + transaction.getPatientId())
                .doctorId(transaction.getDoctorId())
                .doctorName(transaction.getDoctorName())
                .doctorSpecialization(transaction.getDoctorSpecialization())
                .appointmentDate(transaction.getAppointmentDate())
                .appointmentTime(transaction.getAppointmentTime())
                .reason(transaction.getReason())
                .amount(transaction.getAmountMinor() == null ? 0L : transaction.getAmountMinor() / 100L)
                .amountMinor(transaction.getAmountMinor())
                .currency(transaction.getCurrency())
                .status(transaction.getStatus().name())
                .failureReason(transaction.getFailureReason())
                .paidAt(transaction.getPaidAt())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
