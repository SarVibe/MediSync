package com.example.telemedicine_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tele_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeleSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    @Column(nullable = false, unique = true)
    private Long appointmentId;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false, length = 500)
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum Status { ACTIVE, COMPLETED, CANCELLED }

    @PrePersist
    public void prePersist() {
        this.status    = Status.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }
}
