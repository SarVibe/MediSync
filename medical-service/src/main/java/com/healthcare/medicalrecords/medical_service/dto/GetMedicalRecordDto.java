package com.healthcare.medicalrecords.medical_service.dto;

import java.time.LocalDateTime;

public record GetMedicalRecordDto(Long id, Long patientId, String fileUrl, String recordType, String description, LocalDateTime createdAt) {
}
