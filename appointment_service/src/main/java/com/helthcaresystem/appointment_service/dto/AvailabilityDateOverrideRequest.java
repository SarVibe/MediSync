package com.helthcaresystem.appointment_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AvailabilityDateOverrideRequest {
    private Long doctorId;

    @NotNull
    private LocalDate date;

    private Boolean unavailable;
    private List<AvailabilityTimeSlotRequest> slots;
}
