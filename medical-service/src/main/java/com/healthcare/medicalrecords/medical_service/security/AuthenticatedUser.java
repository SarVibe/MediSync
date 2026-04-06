package com.healthcare.medicalrecords.medical_service.security;

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
}

