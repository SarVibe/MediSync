package com.health.auth.auth_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class InternalRequest {

    @Data
    public static class DoctorUpgradeRequest {
        @NotNull(message = "userId is required")
        private Long userId;
    }

    @Data
    public static class SyncUserNameRequest {
        @NotNull(message = "userId is required")
        private Long userId;

        @NotBlank(message = "name is required")
        @Size(min = 2, max = 120)
        private String name;
    }

    @Data
    public static class SyncProfileCompletionRequest {
        @NotNull(message = "userId is required")
        private Long userId;

        @NotNull(message = "isProfileCompleted is required")
        private Boolean isProfileCompleted;
    }
}

