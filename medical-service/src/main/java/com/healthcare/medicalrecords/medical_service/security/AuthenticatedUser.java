package com.health.profile.profile_service.security;

public record AuthenticatedUser(Long userId, String role, String status, String profileId, String token) {
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }

    public boolean isPatient() {
        return "PATIENT".equalsIgnoreCase(role);
    }

    public boolean isDoctor() {
        return "DOCTOR".equalsIgnoreCase(role);
    }

    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }

    public boolean isPending() {
        return "PENDING".equalsIgnoreCase(status);
    }

    public boolean isRejected() {
        return "REJECTED".equalsIgnoreCase(status);
    }

    public boolean isBlocked() {
        return "BLOCKED".equalsIgnoreCase(status);
    }

    /**
     * Access to Doctor Profile (after approval)
     * Requires: role=DOCTOR AND status=ACTIVE
     */
    public boolean canAccessDoctorProfile() {
        return isDoctor() && isActive();
    }

    /**
     * Access to Doctor Application (before approval)
     * Requires: role=PATIENT AND (status=PENDING OR status=REJECTED)
     */
    public boolean canAccessDoctorApplication() {
        return isPatient() && (isActive() || isRejected());
    }

    /**
     * Can submit new doctor application or reapply after rejection
     * Requires: role=PATIENT AND (status=ACTIVE OR status=REJECTED)
     */
    public boolean canSubmitDoctorApplication() {
        return isPatient() && (isActive() || isRejected());
    }
}

