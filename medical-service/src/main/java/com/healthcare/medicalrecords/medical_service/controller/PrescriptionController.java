package com.healthcare.medicalrecords.medical_service.controller;

import com.healthcare.medicalrecords.medical_service.dto.GetPrescriptionDto;
import com.healthcare.medicalrecords.medical_service.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    @GetMapping("/{patientId:\\d+}")
    public List<GetPrescriptionDto> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return prescriptionService.getPrescriptionsByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<GetPrescriptionDto> getPrescriptionsByDoctor(@PathVariable Long doctorId) {
        return prescriptionService.getPrescriptionsByDoctorId(doctorId);
    }

    @GetMapping("/all")
    public List<GetPrescriptionDto> getAllPrescriptions() {
        return prescriptionService.getAllPrescriptions();
    }

    @PostMapping(path = "{doctorId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public GetPrescriptionDto createPrescription(
            @PathVariable Long doctorId,
            @RequestParam("patientId") Long patientId,
            @RequestParam("appointmentId") Long appointmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validUntil,
            @RequestParam("image") MultipartFile image
    ) {
        GetPrescriptionDto getPrescriptionDto = prescriptionService.createPrescription(doctorId, patientId, appointmentId, validUntil, image);
        return ResponseEntity.ok().body(getPrescriptionDto).getBody();
    }

    @DeleteMapping("/{prescriptionId}")
    public String deletePrescription(@PathVariable Long prescriptionId) {
        return prescriptionService.deletePrescription(prescriptionId);
    }
}
