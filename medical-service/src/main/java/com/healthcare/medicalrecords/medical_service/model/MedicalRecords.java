package com.healthcare.medicalrecords.medical_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecords {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This comes from Profile Service → don't use @ManyToOne
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "record_type", nullable = false)
    private String recordType; // e.g., LAB_REPORT, XRAY, PRESCRIPTION

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
