package com.helthcaresystem.appointment_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class AvailabilityConfigRequest {
    private Long doctorId;
    private List<String> availableDays;
    private List<AvailabilityTimeSlotRequest> defaultSlots;
}
