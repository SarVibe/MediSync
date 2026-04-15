package com.medisync.symptom_checker_service.service;

import com.medisync.symptom_checker_service.dto.HealthResourceDto;
import com.medisync.symptom_checker_service.dto.SymptomAnalysisRequest;
import com.medisync.symptom_checker_service.dto.SymptomAnalysisResponse;
import com.medisync.symptom_checker_service.dto.SymptomHistoryResponse;
import com.medisync.symptom_checker_service.entity.SymptomCheckRecord;
import com.medisync.symptom_checker_service.enums.NextAction;
import com.medisync.symptom_checker_service.enums.RiskLevel;
import com.medisync.symptom_checker_service.repository.SymptomCheckRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SymptomCheckerService {

    private final SymptomCheckRecordRepository repository;
    private final SerperSearchService serperSearchService;

    public SymptomAnalysisResponse analyzeAndSave(String patientId, SymptomAnalysisRequest request) {

        List<String> normalizedSymptoms = Optional.ofNullable(request.getSymptoms())
                .orElse(Collections.emptyList())
                .stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();

        RiskLevel riskLevel = calculateRisk(
                normalizedSymptoms,
                request.getSeverity(),
                request.getDurationDays());

        List<String> conditions = detectPossibleConditions(normalizedSymptoms);
        NextAction nextAction = determineNextAction(riskLevel);
        String summary = buildSummary(normalizedSymptoms, riskLevel, conditions, nextAction);

        List<HealthResourceDto> trustedResources = Collections.emptyList();
        if (riskLevel != RiskLevel.HIGH) {
            trustedResources = serperSearchService.searchTrustedResources(normalizedSymptoms);
        }

        SymptomCheckRecord saved = repository.save(
                SymptomCheckRecord.builder()
                        .patientId(patientId)
                        .symptoms(String.join(", ", normalizedSymptoms))
                        .severity(request.getSeverity().toUpperCase())
                        .durationDays(request.getDurationDays())
                        .riskLevel(riskLevel)
                        .nextAction(nextAction)
                        .possibleConditions(String.join(", ", conditions))
                        .summary(summary)
                        .createdAt(LocalDateTime.now())
                        .build());

        return SymptomAnalysisResponse.builder()
                .recordId(saved.getId())
                .patientId(saved.getPatientId())
                .symptoms(normalizedSymptoms)
                .severity(saved.getSeverity())
                .durationDays(saved.getDurationDays())
                .riskLevel(saved.getRiskLevel())
                .possibleConditions(conditions)
                .nextAction(saved.getNextAction())
                .summary(saved.getSummary())
                .createdAt(saved.getCreatedAt())
                .trustedResources(trustedResources)
                .build();
    }

    public List<SymptomHistoryResponse> getPatientHistory(String patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(record -> SymptomHistoryResponse.builder()
                        .recordId(record.getId())
                        .symptoms(splitCommaString(record.getSymptoms()))
                        .severity(record.getSeverity())
                        .durationDays(record.getDurationDays())
                        .riskLevel(record.getRiskLevel())
                        .possibleConditions(splitCommaString(record.getPossibleConditions()))
                        .nextAction(record.getNextAction())
                        .summary(record.getSummary())
                        .createdAt(record.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private RiskLevel calculateRisk(List<String> symptoms, String severity, Integer durationDays) {
        String severityValue = severity == null ? "" : severity.toLowerCase(Locale.ROOT);
        int safeDurationDays = durationDays == null ? 0 : durationDays;

        Set<String> emergencySymptoms = Set.of(
                "chest pain",
                "shortness of breath",
                "difficulty breathing",
                "loss of consciousness",
                "seizure",
                "severe bleeding");

        boolean hasEmergencySymptom = symptoms.stream().anyMatch(emergencySymptoms::contains);

        if (hasEmergencySymptom || "severe".equals(severityValue)) {
            return RiskLevel.HIGH;
        }

        if (safeDurationDays >= 7 || "moderate".equals(severityValue)) {
            return RiskLevel.MEDIUM;
        }

        return RiskLevel.LOW;
    }

    private List<String> detectPossibleConditions(List<String> symptoms) {
        Set<String> symptomSet = new HashSet<>(symptoms);
        List<String> conditions = new ArrayList<>();

        if (symptomSet.contains("fever") && symptomSet.contains("cough")) {
            conditions.add("Flu");
            conditions.add("Viral Infection");
        }

        if (symptomSet.contains("headache") && symptomSet.contains("nausea")) {
            conditions.add("Migraine");
        }

        if (symptomSet.contains("stomach pain") || symptomSet.contains("vomiting")) {
            conditions.add("Gastritis");
            conditions.add("Food Poisoning");
        }

        if (symptomSet.contains("chest pain") || symptomSet.contains("shortness of breath")) {
            conditions.add("Cardiac or Respiratory Issue");
        }

        if (symptomSet.contains("sore throat") && symptomSet.contains("fever")) {
            conditions.add("Throat Infection");
        }

        if (conditions.isEmpty()) {
            conditions.add("General Medical Evaluation Recommended");
        }

        return conditions.stream().distinct().toList();
    }

    private NextAction determineNextAction(RiskLevel riskLevel) {
        return switch (riskLevel) {
            case HIGH -> NextAction.EMERGENCY;
            case MEDIUM -> NextAction.BOOK_DOCTOR;
            case LOW -> NextAction.SELF_CARE;
        };
    }

    private String buildSummary(
            List<String> symptoms,
            RiskLevel riskLevel,
            List<String> conditions,
            NextAction nextAction) {
        return "Based on the given symptoms (" + String.join(", ", symptoms) + "), the estimated risk is "
                + riskLevel
                + ". Possible conditions include: "
                + String.join(", ", conditions)
                + ". Recommended next step: "
                + nextAction
                + ".";
    }

    private List<String> splitCommaString(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(v -> !v.isBlank())
                .toList();
    }
}