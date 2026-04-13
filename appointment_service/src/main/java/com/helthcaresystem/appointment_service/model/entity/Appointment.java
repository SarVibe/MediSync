package com.helthcaresystem.appointment_service.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private Long doctorId;

    private String reason;
    private String cancellationReason;
    private String statusReasonType;
    private String paymentSessionId;
    private LocalDateTime paymentExpiresAt;
    private boolean reminderDayBeforeSent;
    private boolean reminderOneHourBeforeSent;
    private boolean reminderTwoHourPendingAcceptanceSent;
    private boolean expiredUnacceptedNotified;

    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PENDING_PAYMENT, BOOKED, ACCEPTED, COMPLETED, CANCELLED, REJECTED, RESCHEDULED, EXPIRED
    }

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Automatically set before insert
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        reminderDayBeforeSent = false;
        reminderOneHourBeforeSent = false;
        reminderTwoHourPendingAcceptanceSent = false;
        expiredUnacceptedNotified = false;
    }

    // Automatically update before update
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
