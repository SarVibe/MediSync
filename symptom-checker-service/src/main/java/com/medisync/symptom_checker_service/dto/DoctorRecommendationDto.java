package com.medisync.symptom_checker_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorRecommendationDto {
    private String specialization;
    private String doctorTitle;
    private String reason;
    private String bookingHint;
}
