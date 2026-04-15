package com.medisync.symptom_checker_service.controller;


import com.medisync.symptom_checker_service.dto.SymptomAnalysisRequest;
import com.medisync.symptom_checker_service.dto.SymptomAnalysisResponse;
import com.medisync.symptom_checker_service.dto.SymptomHistoryResponse;
import com.medisync.symptom_checker_service.service.SymptomCheckerService;
import com.medisync.symptom_checker_service.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/symptom-checker")
@RequiredArgsConstructor
public class SymptomCheckerController {

    private final SymptomCheckerService symptomCheckerService;

    @PostMapping("/analyze")
    public ResponseEntity<SymptomAnalysisResponse> analyzeSymptoms(
            @Valid @RequestBody SymptomAnalysisRequest request
    ) {
        String patientId = SecurityUtil.getCurrentUserId();
        SymptomAnalysisResponse response = symptomCheckerService.analyzeAndSave(patientId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SymptomHistoryResponse>> getMyHistory() {
        String patientId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(symptomCheckerService.getPatientHistory(patientId));
    }
}
