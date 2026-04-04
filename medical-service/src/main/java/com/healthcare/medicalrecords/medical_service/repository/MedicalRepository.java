package com.healthcare.medicalrecords.medical_service.repository;

import com.healthcare.medicalrecords.medical_service.dto.GetMedicalRecordDto;
import com.healthcare.medicalrecords.medical_service.model.MedicalRecords;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRepository extends JpaRepository<MedicalRecords, Long> {
    List<GetMedicalRecordDto> findAllByPatientId(Long patientId);
}
