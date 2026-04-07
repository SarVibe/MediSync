package com.health.profile.profile_service.dto;

import com.health.profile.profile_service.entity.BloodGroup;
import com.health.profile.profile_service.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

public class ProfileRequest {

    @Data
    public static class InitProfileRequest {
        @NotNull(message = "userId is required")
        private Long userId;

        @NotBlank(message = "name is required")
        @Size(min = 2, max = 120)
        private String name;

        @NotBlank(message = "role is required")
        private String role;
    }

    @Data
    public static class InitProfileUploadRequest {
        @NotNull(message = "userId is required")
        private Long userId;

        @NotBlank(message = "name is required")
        @Size(min = 2, max = 120)
        private String name;

        @NotBlank(message = "role is required")
        private String role;

        private MultipartFile profileImage;
    }

    @Data
    public static class DoctorStatusUpdateRequest {
        @NotNull(message = "userId is required")
        private Long userId;

        @NotBlank(message = "status is required")
        private String status;

        @Size(max = 500)
        private String reason;
    }

    @Data
    public static class PatientProfileUpsertRequest {
        @Size(min = 2, max = 120)
        private String fullName;

        @Size(max = 500)
        private String address;

        private BloodGroup bloodGroup;

        private Gender gender;

        @Past(message = "dob must be in the past")
        private LocalDate dob;

        @Size(max = 500)
        private String profilePictureUrl;

        @Size(max = 2000)
        private String basicHealthInfo;
    }

    @Data
    public static class PatientProfilePictureUploadRequest {
        @NotNull(message = "profileImage is required")
        private MultipartFile profileImage;
    }

    @Data
    public static class DoctorUpgradeRequest {
        @NotBlank(message = "fullName is required")
        @Size(min = 2, max = 120)
        private String fullName;

        @NotNull(message = "gender is required")
        private Gender gender;

        @NotBlank(message = "specialization is required")
        @Size(min = 2, max = 120)
        private String specialization;

        @NotBlank(message = "qualifications are required")
        @Size(min = 2, max = 1000)
        private String qualifications;

        @NotNull(message = "experienceYears is required")
        @Min(value = 0, message = "experienceYears must be >= 0")
        private Integer experienceYears;

        @NotBlank(message = "profilePictureUrl is required")
        @Size(max = 500)
        private String profilePictureUrl;
    }

    @Data
    public static class DoctorUpgradeUploadRequest {
        @NotBlank(message = "fullName is required")
        @Size(min = 2, max = 120)
        private String fullName;

        @NotNull(message = "gender is required")
        private Gender gender;

        @NotBlank(message = "specialization is required")
        @Size(min = 2, max = 120)
        private String specialization;

        @NotBlank(message = "qualifications are required")
        @Size(min = 2, max = 1000)
        private String qualifications;

        @NotNull(message = "experienceYears is required")
        @Min(value = 0, message = "experienceYears must be >= 0")
        private Integer experienceYears;

        @NotNull(message = "profileImage is required")
        private MultipartFile profileImage;
    }

    @Data
    public static class DoctorProfileUpdateRequest {
        @Size(min = 2, max = 120)
        private String fullName;

        private Gender gender;

        @Size(min = 2, max = 120)
        private String specialization;

        @Size(min = 2, max = 1000)
        private String qualifications;

        @Min(value = 0, message = "experienceYears must be >= 0")
        private Integer experienceYears;

        @Size(max = 500)
        private String profilePictureUrl;
    }
}

