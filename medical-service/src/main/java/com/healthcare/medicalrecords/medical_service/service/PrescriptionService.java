package com.healthcare.medicalrecords.medical_service.service;

import com.healthcare.medicalrecords.medical_service.dto.GetPrescriptionDto;
import com.healthcare.medicalrecords.medical_service.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;

    public List<GetPrescriptionDto> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }
}
