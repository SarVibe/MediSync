package com.health.profile.profile_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthValidateResponse {
    private boolean success;
    private String message;
    private ValidateData data;

    @Getter
    @Setter
    public static class ValidateData {
        private Long userId;
        private String role;
        private String status;
        private String profileId;
        private String jti;
    }
}

