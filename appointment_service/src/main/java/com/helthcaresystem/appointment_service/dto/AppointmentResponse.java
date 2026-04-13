package com.helthcaresystem.appointment_service.dto;

import com.helthcaresystem.appointment_service.model.entity.Appointment;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Value
@Builder
public class AppointmentResponse {
    Long id;
    Long patientId;
    Long doctorId;
    String patientName;
    String doctorName;
    String doctorSpecialization;
    String doctorQualifications;
    Integer doctorExperienceYears;
    String reason;
    String cancellationReason;
    String statusReasonType;
    String status;
    LocalDateTime scheduledAt;
    String date;
    String time;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static AppointmentResponse fromEntity(Appointment appointment) {
        return fromEntity(
                appointment,
                "Patient #" + appointment.getPatientId(),
                "Doctor #" + appointment.getDoctorId(),
                "",
                "",
                null
        );
    }

    public static AppointmentResponse fromEntity(Appointment appointment,
                                                 String patientName,
                                                 String doctorName,
                                                 String doctorSpecialization,
                                                 String doctorQualifications,
                                                 Integer doctorExperienceYears) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .patientName(patientName)
                .doctorName(doctorName)
                .doctorSpecialization(doctorSpecialization)
                .doctorQualifications(doctorQualifications)
                .doctorExperienceYears(doctorExperienceYears)
                .reason(appointment.getReason())
                .cancellationReason(appointment.getCancellationReason())
                .statusReasonType(appointment.getStatusReasonType())
                .status(appointment.getStatus().name())
                .scheduledAt(appointment.getScheduledAt())
                .date(appointment.getScheduledAt() != null ? appointment.getScheduledAt().toLocalDate().toString() : null)
                .time(appointment.getScheduledAt() != null ? appointment.getScheduledAt().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")) : null)
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}
