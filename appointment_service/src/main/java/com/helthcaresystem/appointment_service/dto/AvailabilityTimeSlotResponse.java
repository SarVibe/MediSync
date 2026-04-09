package com.helthcaresystem.appointment_service.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalTime;

@Value
@Builder
public class AvailabilityTimeSlotResponse {
    LocalTime startTime;
    LocalTime endTime;
}
