package com.helthcaresystem.appointment_service.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "doctor_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long doctorId;

    private LocalTime startTime;
    private LocalTime endTime;

    private String dayOfWeek; // MONDAY, TUESDAY, etc.

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        AVAILABLE, UNAVAILABLE
    }
}