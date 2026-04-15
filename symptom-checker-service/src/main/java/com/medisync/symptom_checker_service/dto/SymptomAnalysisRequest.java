package com.medisync.symptom_checker_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SymptomAnalysisRequest {

    @NotEmpty(message = "At least one symptom is required")
    private List<@NotBlank(message = "Symptom cannot be blank") String> symptoms;

    @NotBlank(message = "Severity is required")
    private String severity; // mild, moderate, severe

    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 365, message = "Duration is too large")
    private Integer durationDays;
}