package com.helthcaresystem.appointment_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class AvailabilityTimeSlotRequest {
    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;
}
