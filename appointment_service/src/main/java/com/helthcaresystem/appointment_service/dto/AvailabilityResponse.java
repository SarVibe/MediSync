package com.helthcaresystem.appointment_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalTime;

@Value
@Builder
public class AvailabilityResponse {
    Long id;
    Long doctorId;
    String day;
    String dayOfWeek;
    LocalDate date;
    LocalTime startTime;
    LocalTime endTime;
    String status;
    @JsonProperty("available")
    boolean available;

    public static AvailabilityResponse fromEntity(DoctorAvailability slot) {
        boolean isAvailable = slot.getStatus() == DoctorAvailability.Status.AVAILABLE;
        return AvailabilityResponse.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctorId())
                .day(slot.getDayOfWeek())
                .dayOfWeek(slot.getDayOfWeek())
                .date(slot.getSpecificDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getStatus().name())
                .available(isAvailable)
                .build();
    }
}
