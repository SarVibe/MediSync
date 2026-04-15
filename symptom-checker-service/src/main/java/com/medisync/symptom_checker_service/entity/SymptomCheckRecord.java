package com.medisync.symptom_checker_service.entity;


import com.medisync.symptom_checker_service.enums.NextAction;
import com.medisync.symptom_checker_service.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "symptom_check_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomCheckRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "symptoms", nullable = false, length = 1000)
    private String symptoms;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "next_action", nullable = false)
    private NextAction nextAction;

    @Column(name = "possible_conditions", nullable = false, length = 1000)
    private String possibleConditions;

    @Column(name = "summary", nullable = false, length = 1500)
    private String summary;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}