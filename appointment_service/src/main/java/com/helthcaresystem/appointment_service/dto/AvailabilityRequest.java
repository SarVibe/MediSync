package com.helthcaresystem.appointment_service.dto;

import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class AvailabilityRequest {
    private Long doctorId;

    @NotBlank
    private String dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    private Boolean available;

    public DoctorAvailability.Status resolveStatus() {
        return Boolean.FALSE.equals(available)
                ? DoctorAvailability.Status.UNAVAILABLE
                : DoctorAvailability.Status.AVAILABLE;
    }
}
