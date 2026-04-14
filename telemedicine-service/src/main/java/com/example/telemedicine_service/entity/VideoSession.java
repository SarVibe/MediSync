package com.example.telemedicine_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_sessions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_video_session_appointment", columnNames = "appointment_id"),
                @UniqueConstraint(name = "uk_video_session_room", columnNames = "room_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "room_id", nullable = false, length = 120)
    private String roomId;

    @Column(name = "meeting_link", nullable = false, length = 255)
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VideoSessionStatus status;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = VideoSessionStatus.SCHEDULED;
        }
    }
}
