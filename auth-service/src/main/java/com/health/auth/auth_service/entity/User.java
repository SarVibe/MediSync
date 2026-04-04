package com.health.auth.auth_service.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter // Lombok annotation to generate getters for all fields
@Setter // Lombok annotation to generate setters for all fields
@NoArgsConstructor // Lombok annotation to generate a no-args constructor
@AllArgsConstructor // Lombok annotation to generate a constructor with all fields
@Builder // Lombok annotation to generate a builder for the class
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(nullable = true)
    private String name;

    @Column(unique = true, nullable = true)
    private String email;

    @Column(name = "password_hash", nullable = true)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.PATIENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "is_profile_completed", nullable = false)
    @Builder.Default
    private Boolean isProfileCompleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    @JsonProperty("approval_status")
    private DoctorRequestStatus approvalStatus = DoctorRequestStatus.NONE;

    @Column(name = "is_first_login", nullable = false)
    @Builder.Default
    private Boolean isFirstLogin = false;

    @Column(name = "is_verified", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1")
    @Builder.Default
    private Boolean isVerified = true;

    @Column(name = "profile_id")
    private String profileId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        PATIENT, DOCTOR, ADMIN
    }

    public enum UserStatus {
        PENDING,    // Doctor awaiting admin approval
        ACTIVE,     // Normal active user
        BLOCKED,    // Blocked by admin
        REJECTED    // Doctor registration rejected
    }

    public enum DoctorRequestStatus {
        NONE,
        PENDING,
        APPROVED,
        REJECTED
    }
}
