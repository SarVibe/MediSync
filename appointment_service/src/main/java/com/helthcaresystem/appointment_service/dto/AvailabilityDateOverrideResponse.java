package com.helthcaresystem.appointment_service.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Value
@Builder
public class AvailabilityDateOverrideResponse {
    LocalDate date;
    String dayOfWeek;
    boolean unavailable;
    List<AvailabilityTimeSlotResponse> slots;
}
