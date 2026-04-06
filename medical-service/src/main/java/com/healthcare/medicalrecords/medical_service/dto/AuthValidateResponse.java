package com.healthcare.medicalrecords.medical_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthValidateResponse {
    private boolean success;
    private String message;
    private ValidateData data;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ValidateData {
        private Long userId;
        private String role;
        private String status;
        private String profileId;
        private String jti;
    }
}
