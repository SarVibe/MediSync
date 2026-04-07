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

    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        BOOKED, ACCEPTED, COMPLETED, CANCELLED, RESCHEDULED
    }

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Automatically set before insert
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    // Automatically update before update
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
