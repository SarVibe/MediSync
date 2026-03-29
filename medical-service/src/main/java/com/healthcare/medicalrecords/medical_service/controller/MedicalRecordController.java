package com.healthcare.medicalrecords.medical_service.controller;

import com.healthcare.medicalrecords.medical_service.dto.GetMedicalRecordDto;
import com.healthcare.medicalrecords.medical_service.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @GetMapping("{patientId}")
    public List<GetMedicalRecordDto> getMedicalRecord(@PathVariable Long patientId) {
        return medicalRecordService.getMedicalRecord(patientId);
    }

    @PostMapping("{patientId}")
    public GetMedicalRecordDto uploadMedicalRecord(
            @PathVariable Long patientId,
            @RequestParam MultipartFile medicalDocument,
            @RequestParam String recordType,
            @RequestParam(required = false) String description
    ) {
        return medicalRecordService.createMedicalRecord(patientId, medicalDocument, recordType,description);
    }

    @DeleteMapping("{medicalRecordId}")
    public String deleteMedicalRecord(@PathVariable Long medicalRecordId) {
        return medicalRecordService.deleteMedicalRecord(medicalRecordId);
    }
}
