package com.medisync.symptom_checker_service.service;

import com.medisync.symptom_checker_service.dto.AnalysisOverviewDto;
import com.medisync.symptom_checker_service.dto.DoctorRecommendationDto;
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

    private static final Map<String, Integer> SYMPTOM_WEIGHTS = createSymptomWeights();

    public SymptomAnalysisResponse analyzeAndSave(String patientId, SymptomAnalysisRequest request) {
        String normalizedSeverity = normalizeSeverity(request != null ? request.getSeverity() : null);
        int safeDurationDays = request != null && request.getDurationDays() != null
                ? request.getDurationDays()
                : 0;

        List<String> normalizedSymptoms = normalizeSymptoms(request != null ? request.getSymptoms() : null);
        RiskLevel riskLevel = calculateRisk(normalizedSymptoms, normalizedSeverity, safeDurationDays);
        List<String> conditions = detectPossibleConditions(normalizedSymptoms);
        NextAction nextAction = determineNextAction(riskLevel);
        DoctorRecommendation recommendation = recommendDoctor(normalizedSymptoms, riskLevel);
        String summary = buildSummary(normalizedSymptoms, riskLevel, conditions, nextAction, recommendation);
        List<String> nextSteps = buildNextSteps(nextAction, recommendation);
        List<String> analysisHighlights = buildAnalysisHighlights(normalizedSymptoms, conditions, recommendation);
        String disclaimer = buildDisclaimer(riskLevel);

        List<HealthResourceDto> trustedResources = Collections.emptyList();
        if (riskLevel != RiskLevel.HIGH && !normalizedSymptoms.isEmpty()) {
            trustedResources = serperSearchService.searchTrustedResources(normalizedSymptoms);
        }

        SymptomCheckRecord saved = repository.save(
                SymptomCheckRecord.builder()
                        .patientId(patientId)
                        .symptoms(String.join(", ", normalizedSymptoms))
                        .severity(normalizedSeverity.toUpperCase(Locale.ROOT))
                        .durationDays(safeDurationDays)
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
                .overview(AnalysisOverviewDto.builder()
                        .riskLabel(formatRiskLabel(saved.getRiskLevel()))
                        .riskDescription(buildRiskDescription(saved.getRiskLevel()))
                        .nextActionLabel(formatNextActionLabel(saved.getNextAction()))
                        .build())
                .doctorRecommendation(DoctorRecommendationDto.builder()
                        .specialization(recommendation.specialization())
                        .doctorTitle(recommendation.doctorTitle())
                        .reason(recommendation.reason())
                        .bookingHint(recommendation.bookingHint())
                        .build())
                .nextSteps(nextSteps)
                .analysisHighlights(analysisHighlights)
                .disclaimer(disclaimer)
                .summary(saved.getSummary())
                .createdAt(saved.getCreatedAt())
                .trustedResources(trustedResources)
                .build();
    }

    public List<SymptomHistoryResponse> getPatientHistory(String patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
    }

    public Optional<SymptomHistoryResponse> getLatestPatientHistory(String patientId) {
        return repository.findFirstByPatientIdOrderByCreatedAtDesc(patientId)
                .map(this::toHistoryResponse);
    }

    private List<String> normalizeSymptoms(List<String> symptoms) {
        return Optional.ofNullable(symptoms)
                .orElse(Collections.emptyList())
                .stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();
    }

    private RiskLevel calculateRisk(List<String> symptoms, String severity, int durationDays) {
        int score = 0;

        for (String symptom : symptoms) {
            score += SYMPTOM_WEIGHTS.getOrDefault(symptom, 1);
        }

        switch (severity) {
            case "severe" -> score += 3;
            case "moderate" -> score += 2;
            case "mild" -> score += 1;
            default -> {
            }
        }

        if (durationDays >= 7) {
            score += 3;
        } else if (durationDays >= 3) {
            score += 2;
        }

        if (isEmergencyCase(symptoms)) {
            return RiskLevel.HIGH;
        }

        if (score >= 10) {
            return RiskLevel.HIGH;
        }
        if (score >= 5) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }

    private boolean isEmergencyCase(List<String> symptoms) {
        Set<String> symptomSet = new HashSet<>(symptoms);

        return (symptomSet.contains("chest pain") && symptomSet.contains("shortness of breath"))
                || symptomSet.contains("difficulty breathing")
                || symptomSet.contains("loss of consciousness")
                || symptomSet.contains("seizure")
                || symptomSet.contains("severe bleeding");
    }

    private List<String> detectPossibleConditions(List<String> symptoms) {
        Set<String> symptomSet = new HashSet<>(symptoms);
        List<String> conditions = new ArrayList<>();

        if (symptomSet.contains("fever") && symptomSet.contains("cough")) {
            conditions.add("Flu or Viral Infection");
        }

        if (symptomSet.contains("headache") && symptomSet.contains("nausea")) {
            conditions.add("Migraine");
        }

        if (symptomSet.contains("stomach pain") && symptomSet.contains("vomiting")) {
            conditions.add("Gastrointestinal Issue");
        }

        if (symptomSet.contains("chest pain") || symptomSet.contains("shortness of breath")) {
            conditions.add("Cardiac or Respiratory Condition");
        }

        if (symptomSet.contains("sore throat") && symptomSet.contains("fever")) {
            conditions.add("Throat Infection");
        }

        if (symptomSet.contains("rash") || symptomSet.contains("itching")) {
            conditions.add("Skin Condition");
        }

        if (conditions.isEmpty()) {
            conditions.add("General Medical Evaluation Recommended");
        }

        return conditions.stream().distinct().toList();
    }

    private DoctorRecommendation recommendDoctor(List<String> symptoms, RiskLevel riskLevel) {
        Set<String> symptomSet = new HashSet<>(symptoms);

        if (symptomSet.contains("chest pain")
                || symptomSet.contains("shortness of breath")
                || symptomSet.contains("difficulty breathing")) {
            return new DoctorRecommendation(
                    "Cardiology",
                    "Cardiologist",
                    "Chest discomfort or breathing-related symptoms may need heart and circulation assessment.",
                    riskLevel == RiskLevel.HIGH
                            ? "Use emergency care immediately if the symptoms are active or worsening."
                            : "Book the earliest available cardiology or urgent primary care appointment.");
        }

        if (symptomSet.contains("rash") || symptomSet.contains("itching")) {
            return new DoctorRecommendation(
                    "Dermatology",
                    "Dermatologist",
                    "Skin-related symptoms are usually evaluated best by a skin specialist.",
                    "Look for a dermatologist or a general physician if specialty care is not available.");
        }

        if (symptomSet.contains("stomach pain") || symptomSet.contains("vomiting")) {
            return new DoctorRecommendation(
                    "Gastroenterology",
                    "Gastroenterologist",
                    "Digestive symptoms often require gastrointestinal review.",
                    "Choose a gastroenterologist if symptoms persist, recur, or interfere with eating and hydration.");
        }

        if (symptomSet.contains("headache")
                || symptomSet.contains("dizziness")
                || symptomSet.contains("seizure")) {
            return new DoctorRecommendation(
                    "Neurology",
                    "Neurologist",
                    "Neurological symptoms may benefit from specialist assessment.",
                    riskLevel == RiskLevel.HIGH
                            ? "Seek urgent care immediately for severe neurological symptoms."
                            : "Book a neurology visit if symptoms are persistent, unusual, or worsening.");
        }

        if (symptomSet.contains("sore throat")
                || symptomSet.contains("fever")
                || symptomSet.contains("cough")) {
            return new DoctorRecommendation(
                    "General Medicine",
                    "General Physician",
                    "Common infection-related symptoms are usually appropriate for a general physician first.",
                    "Start with a general physician, who can escalate to a specialist if needed.");
        }

        return new DoctorRecommendation(
                "General Medicine",
                "General Physician",
                "A general physician is the safest first contact when symptoms do not strongly match one specialty.",
                "Book a general physician for an initial evaluation and referral if necessary.");
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
            NextAction nextAction,
            DoctorRecommendation recommendation) {

        String riskMessage = buildRiskDescription(riskLevel);

        String symptomText = symptoms.isEmpty() ? "none provided" : String.join(", ", symptoms);

        return riskMessage
                + " Symptoms reported: " + symptomText
                + ". Possible conditions: " + String.join(", ", conditions)
                + ". Recommended specialty: " + recommendation.specialization()
                + " (" + recommendation.doctorTitle() + ")"
                + ". Suggested action: " + formatNextActionLabel(nextAction) + ".";
    }

    private String buildRiskDescription(RiskLevel riskLevel) {
        return switch (riskLevel) {
            case HIGH -> "The symptoms indicate a potentially serious condition requiring immediate attention.";
            case MEDIUM -> "The symptoms suggest a moderate health concern that should be evaluated by a doctor.";
            case LOW -> "The symptoms appear mild and may be managed with basic care.";
        };
    }

    private String formatRiskLabel(RiskLevel riskLevel) {
        return switch (riskLevel) {
            case HIGH -> "High Risk";
            case MEDIUM -> "Medium Risk";
            case LOW -> "Low Risk";
        };
    }

    private String formatNextActionLabel(NextAction nextAction) {
        return switch (nextAction) {
            case EMERGENCY -> "Seek emergency care";
            case BOOK_DOCTOR -> "Book a doctor appointment";
            case SELF_CARE -> "Start with self-care";
        };
    }

    private List<String> buildNextSteps(NextAction nextAction, DoctorRecommendation recommendation) {
        List<String> steps = new ArrayList<>();

        switch (nextAction) {
            case EMERGENCY -> {
                steps.add("Seek immediate emergency medical attention.");
                steps.add("Do not delay care if symptoms are active, severe, or rapidly worsening.");
            }
            case BOOK_DOCTOR -> {
                steps.add("Book a doctor appointment soon for a clinical assessment.");
                steps.add("Track symptom changes, temperature, pain level, and any new warning signs.");
            }
            case SELF_CARE -> {
                steps.add("Monitor symptoms closely over the next 24 to 48 hours.");
                steps.add("Rest, stay hydrated, and use basic symptom relief if appropriate.");
            }
        }

        steps.add(recommendation.bookingHint());
        return steps;
    }

    private List<String> buildAnalysisHighlights(
            List<String> symptoms,
            List<String> conditions,
            DoctorRecommendation recommendation) {
        List<String> highlights = new ArrayList<>();

        if (!symptoms.isEmpty()) {
            highlights.add("Reported symptoms: " + String.join(", ", symptoms) + ".");
        }

        if (!conditions.isEmpty()) {
            highlights.add("Most relevant match: " + conditions.get(0) + ".");
        }

        highlights.add("Recommended specialty: " + recommendation.specialization() + ".");
        highlights.add(recommendation.reason());
        return highlights;
    }

    private String buildDisclaimer(RiskLevel riskLevel) {
        return riskLevel == RiskLevel.HIGH
                ? "This tool is not a substitute for emergency medical evaluation."
                : "This AI assessment is informational only and should not replace professional medical advice.";
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

    private SymptomHistoryResponse toHistoryResponse(SymptomCheckRecord record) {
        return SymptomHistoryResponse.builder()
                .recordId(record.getId())
                .symptoms(splitCommaString(record.getSymptoms()))
                .severity(record.getSeverity())
                .durationDays(record.getDurationDays())
                .riskLevel(record.getRiskLevel())
                .possibleConditions(splitCommaString(record.getPossibleConditions()))
                .nextAction(record.getNextAction())
                .summary(record.getSummary())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private String normalizeSeverity(String severity) {
        if (severity == null || severity.isBlank()) {
            return "mild";
        }

        String normalized = severity.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "mild", "moderate", "severe" -> normalized;
            default -> "mild";
        };
    }

    private static Map<String, Integer> createSymptomWeights() {
        Map<String, Integer> weights = new HashMap<>();
        weights.put("fever", 2);
        weights.put("cough", 1);
        weights.put("headache", 1);
        weights.put("nausea", 1);
        weights.put("vomiting", 2);
        weights.put("stomach pain", 2);
        weights.put("sore throat", 1);
        weights.put("chest pain", 5);
        weights.put("shortness of breath", 5);
        weights.put("difficulty breathing", 5);
        weights.put("dizziness", 2);
        weights.put("loss of consciousness", 5);
        weights.put("seizure", 5);
        weights.put("severe bleeding", 5);
        weights.put("rash", 2);
        weights.put("itching", 1);
        return Collections.unmodifiableMap(weights);
    }

    private record DoctorRecommendation(
            String specialization,
            String doctorTitle,
            String reason,
            String bookingHint) {
    }
}
