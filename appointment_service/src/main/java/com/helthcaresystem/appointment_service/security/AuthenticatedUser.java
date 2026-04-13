package com.helthcaresystem.appointment_service.security;

public record AuthenticatedUser(Long userId, String role, String status, String profileId) {

    public boolean hasRole(String expectedRole) {
        if (expectedRole == null || role == null) {
            return false;
        }

        String normalizedExpectedRole = normalizeRole(expectedRole);
        String normalizedActualRole = normalizeRole(role);
        return normalizedExpectedRole.equalsIgnoreCase(normalizedActualRole);
    }

    private String normalizeRole(String value) {
        String normalized = value.trim().toUpperCase();
        return normalized.startsWith("ROLE_") ? normalized.substring(5) : normalized;
    }
}
