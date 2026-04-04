package com.health.auth.auth_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.health.auth.auth_service.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    // ── Standard API wrapper ──────────────────────────────────────────────────
    @Data // Lombok annotation to generate getters for all fields
    @Builder // Lombok annotation to generate a builder for the class
    @NoArgsConstructor // Lombok annotation to generate a no-args constructor
    @AllArgsConstructor // Lombok annotation to generate a constructor with all fields
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
        private LocalDateTime timestamp;

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        public static <T> ApiResponse<T> success(String message) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    // ── Token pair returned after successful auth ─────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenResponse {
        private String token;
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private Long expiresIn; // seconds
        private User.Role role;
        private Boolean isProfileCompleted;
        @JsonProperty("approval_status")
        private User.DoctorRequestStatus approvalStatus;
        private User.UserStatus status;
        private UserInfo user;
    }

    // ── Minimal user info embedded in token response ──────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private User.Role role;
        private User.UserStatus status;
        private Boolean isFirstLogin;
        private Boolean isVerified;
    }

    // ── Challenge token for admin 2FA step 1 ─────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeResponse {
        private String challengeToken;
        private String message;
        private Long expiresInSeconds;
    }

    // ── OTP sent confirmation ─────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpResponse {
        private String message;
        private Long resendAfterSeconds;
        private Boolean isNewUser; // NEW: null/false for existing users, true for new registrations
    }

    // ── Validate endpoint response (consumed by API Gateway) ─────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidateResponse {
        private Long userId;
        private String role;
        private String status;
        private String profileId;
        private String jti;
    }
}