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
        BOOKED, CANCELLED, RESCHEDULED
    }

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}