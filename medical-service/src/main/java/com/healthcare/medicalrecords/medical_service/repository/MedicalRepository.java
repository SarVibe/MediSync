package com.healthcare.medicalrecords.medical_service.repository;

import com.healthcare.medicalrecords.medical_service.model.MedicalRecords;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRepository extends JpaRepository<MedicalRecords, Long> {
}
