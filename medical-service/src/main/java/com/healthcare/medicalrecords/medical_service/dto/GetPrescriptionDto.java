package com.healthcare.medicalrecords.medical_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record GetPrescriptionDto(Long id, Long patientId, Long doctorId, Long appointmentId, String prescriptionUrl, LocalDate validUntil, LocalDateTime createdAt) {
}
