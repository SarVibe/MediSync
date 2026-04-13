package com.helthcaresystem.appointment_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AppointmentRequest {

    @NotNull
    private Long doctorId;

    @NotBlank
    private String reason;

    private LocalDateTime scheduledAt;
    private String date;
    private String time;

    public LocalDateTime resolveScheduledAt() {
        if (scheduledAt != null) {
            return scheduledAt;
        }
        if (date == null || time == null) {
            throw new IllegalArgumentException("Appointment date and time are required.");
        }
        return LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time));
    }
}
