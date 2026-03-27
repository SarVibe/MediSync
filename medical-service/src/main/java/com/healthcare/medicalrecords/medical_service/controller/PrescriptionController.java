package com.healthcare.medicalrecords.medical_service.controller;

import com.healthcare.medicalrecords.medical_service.dto.GetPrescriptionDto;
import com.healthcare.medicalrecords.medical_service.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    @GetMapping("/{patientId}")
    public List<GetPrescriptionDto> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return prescriptionService.getPrescriptionsByPatientId(patientId);
    }

    @PostMapping("/{patientId}")
    public String createPrescription(@PathVariable Long patientId) {
        return
    }
}
