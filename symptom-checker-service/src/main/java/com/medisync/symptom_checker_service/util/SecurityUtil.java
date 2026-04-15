package com.medisync.symptom_checker_service.util;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

public class SecurityUtil {

    private SecurityUtil() {
    }

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized user");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            Map<String, Object> claims = jwt.getClaims();

            Object userId = claims.get("userId");
            if (userId != null) {
                return userId.toString();
            }

            Object sub = claims.get("sub");
            if (sub != null) {
                return sub.toString();
            }
        }

        throw new RuntimeException("User ID not found in token");
    }
}
