package com.medisync.symptom_checker_service.repository;

import com.medisync.symptom_checker_service.entity.SymptomCheckRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SymptomCheckRecordRepository extends JpaRepository<SymptomCheckRecord, Long> {
    List<SymptomCheckRecord> findByPatientIdOrderByCreatedAtDesc(String patientId);
}