package com.medisync.symptom_checker_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalysisOverviewDto {
    private String riskLabel;
    private String riskDescription;
    private String nextActionLabel;
}
