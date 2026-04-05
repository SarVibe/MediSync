package com.health.auth.auth_service.dto;

import com.health.auth.auth_service.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

// ── Patient registration ──────────────────────────────────────────────────────
public class RegisterRequest {

    @Data
    public static class PatientDoctorRegisterRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+94[0-9]{9}$", message = "Phone must be in format +94XXXXXXXXX")
        private String phone;

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;
    }

    // ── UNIFIED: Phone-only auth (login/register) ─────────────────────────────
    @Data
    public static class UnifiedAuthRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+94[0-9]{9}$", message = "Phone must be in format +94XXXXXXXXX")
        private String phone;
    }

    // ── OTP ───────────────────────────────────────────────────────────────────
    @Data
    public static class SendOtpRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+94[0-9]{9}$", message = "Phone must be in format +94XXXXXXXXX")
        private String phone;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+94[0-9]{9}$", message = "Phone must be in format +94XXXXXXXXX")
        private String phone;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be numeric")
        private String otp;
    }

    // ── Admin login / 2FA ─────────────────────────────────────────────────────
    @Data
    public static class AdminLoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AdminVerify2FARequest {
        @NotBlank(message = "Challenge token is required")
        private String challengeToken;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be numeric")
        private String otp;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank(message = "Old password is required")
        private String oldPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
                message = "Password must contain uppercase, lowercase, number and special character"
        )
        private String newPassword;

        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;
    }

    @Data
    public static class AdminForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    @Data
    public static class AdminResetPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be numeric")
        private String otp;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
                message = "Password must contain uppercase, lowercase, number and special character"
        )
        private String newPassword;

        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;
    }

    // ── Token refresh / logout ────────────────────────────────────────────────
    @Data
    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    // ── Admin user management ─────────────────────────────────────────────────
    @Data
    public static class CreateUserRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+94[0-9]{9}$", message = "Phone must be in format +94XXXXXXXXX")
        private String phone;

        @NotBlank(message = "Name is required")
        private String name;

        @NotNull(message = "Role is required")
        private User.Role role;

        @NotBlank(message = "Temporary password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String temporaryPassword;
    }

    @Data
    public static class BlockUserRequest {
        private String reason;
    }

    @Data
    public static class RejectDoctorRequest {
        @NotBlank(message = "Rejection reason is required")
        private String reason;
    }
}