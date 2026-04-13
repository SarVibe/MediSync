package com.helthcaresystem.appointment_service.dto;

import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class DoctorSummaryResponse {
    Long id;
    String name;
    String specialization;
    String qualifications;
    Integer experience;
    String availability;

    public static DoctorSummaryResponse fromAvailability(Long doctorId, List<DoctorAvailability> slots) {
        return fromAvailability(doctorId, slots, "Doctor " + doctorId, "", "", null);
    }

    public static DoctorSummaryResponse fromAvailability(Long doctorId,
                                                         List<DoctorAvailability> slots,
                                                         String doctorName,
                                                         String specialization,
                                                         String qualifications,
                                                         Integer experience) {
        String availability = slots.stream()
                .filter(slot -> slot.getStatus() == DoctorAvailability.Status.AVAILABLE)
                .map(slot -> slot.getDayOfWeek() + " " + slot.getStartTime() + "-" + slot.getEndTime())
                .findFirst()
                .orElse("No availability published");

        return DoctorSummaryResponse.builder()
                .id(doctorId)
                .name(doctorName == null || doctorName.isBlank() ? "Doctor " + doctorId : doctorName)
                .specialization(specialization == null ? "" : specialization)
                .qualifications(qualifications == null ? "" : qualifications)
                .experience(experience)
                .availability(availability)
                .build();
    }
}
