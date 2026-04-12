package com.example.telemedicine_service.dto;
import lombok.*;

import java.time.LocalDateTime;

public class SessionDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateRequest {
        private Long doctorId;
        private Long patientId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long          sessionId;
        private Long          appointmentId;
        private Long          doctorId;
        private Long          patientId;
        private String        meetingLink;
        private String        status;
        private LocalDateTime createdAt;
    }
}
