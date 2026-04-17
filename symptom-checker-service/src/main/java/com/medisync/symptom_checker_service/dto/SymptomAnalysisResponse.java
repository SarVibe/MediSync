package com.medisync.symptom_checker_service.dto;


import com.medisync.symptom_checker_service.enums.NextAction;
import com.medisync.symptom_checker_service.enums.RiskLevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SymptomAnalysisResponse {
    private Long recordId;
    private String patientId;
    private List<String> symptoms;
    private String severity;
    private Integer durationDays;
    private RiskLevel riskLevel;
    private List<String> possibleConditions;
    private NextAction nextAction;
    private AnalysisOverviewDto overview;
    private DoctorRecommendationDto doctorRecommendation;
    private List<String> nextSteps;
    private List<String> analysisHighlights;
    private String disclaimer;
    private String summary;
    private LocalDateTime createdAt;
    private List<HealthResourceDto> trustedResources;
}
