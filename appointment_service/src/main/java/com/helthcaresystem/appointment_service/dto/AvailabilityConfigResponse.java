package com.helthcaresystem.appointment_service.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class AvailabilityConfigResponse {
    Long doctorId;
    List<String> availableDays;
    List<AvailabilityTimeSlotResponse> defaultSlots;
    List<AvailabilityDateOverrideResponse> dateOverrides;
    boolean usingDefaultSchedule;
}
