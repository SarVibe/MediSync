package com.example.telemedicine_service.security;

public record AuthenticatedUser(Long userId, String role, String status, String profileId) {

    public boolean hasRole(String expectedRole) {
        if (expectedRole == null || role == null) {
            return false;
        }
        String normalizedExpected = normalize(expectedRole);
        String normalizedActual = normalize(role);
        return normalizedExpected.equalsIgnoreCase(normalizedActual);
    }

    private String normalize(String value) {
        String normalized = value.trim().toUpperCase();
        return normalized.startsWith("ROLE_") ? normalized.substring(5) : normalized;
    }
}
