package com.example.telemedicine_service.dto;

import com.example.telemedicine_service.entity.VideoSessionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class VideoSessionDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSessionRequest {
        @NotNull(message = "appointmentId is required")
        private Long appointmentId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinSessionRequest {
        @NotNull(message = "appointmentId is required")
        private Long appointmentId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EndSessionRequest {
        @NotNull(message = "appointmentId is required")
        private Long appointmentId;
        private VideoSessionStatus finalStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinSessionResponse {
        private VideoSessionResponse session;
        private boolean joinAllowed;
        private LocalDateTime joinWindowStartsAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoSessionResponse {
        private Long id;
        private Long appointmentId;
        private Long doctorId;
        private Long patientId;
        private String doctorName;
        private String patientName;
        private String roomId;
        private String meetingLink;
        private VideoSessionStatus status;
        private LocalDateTime scheduledTime;
        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
        private LocalDateTime createdAt;
    }
}
