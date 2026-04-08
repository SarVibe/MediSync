package com.helthcaresystem.appointment_service.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Value
@Builder
public class AvailabilityDayResponse {
    Long doctorId;
    LocalDate date;
    boolean unavailable;
    boolean fullyBooked;
    List<AvailabilityResponse> slots;
}
