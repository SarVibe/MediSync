package com.health.profile.profile_service.dto;

import com.health.profile.profile_service.entity.BloodGroup;
import com.health.profile.profile_service.entity.DoctorApprovalStatus;
import com.health.profile.profile_service.entity.Gender;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProfileResponse {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileInitResponse {
        private String profileId;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientProfileDto {
        private Long id;
        private Long userId;
        private String fullName;
        private String address;
        private BloodGroup bloodGroup;
        private Gender gender;
        private LocalDate dob;
        private String profilePictureUrl;
        private String basicHealthInfo;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorProfileDto {
        private Long id;
        private Long userId;
        private String fullName;
        private Gender gender;
        private String specialization;
        private String qualifications;
        private Integer experienceYears;
        private String profileImageUrl;
        private DoctorApprovalStatus approvalStatus;
        private String rejectionReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorPublicSummaryDto {
        private Long userId;
        private String fullName;
        private String specialization;
        private String qualifications;
        private Integer experienceYears;
        private String profileImageUrl;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileOptionDto {
        private Long userId;
        private String fullName;
    }
}

