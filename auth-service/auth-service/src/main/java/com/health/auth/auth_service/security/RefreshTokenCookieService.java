package com.health.auth.auth_service.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenCookieService {

    private final String cookieName;
    private final boolean cookieSecure;
    private final String cookieSameSite;
    private final String cookiePath;
    private final long cookieMaxAgeSeconds;

    public RefreshTokenCookieService(
            @Value("${app.auth.refresh-cookie-name}") String cookieName,
            @Value("${app.auth.refresh-cookie-secure}") boolean cookieSecure,
            @Value("${app.auth.refresh-cookie-same-site}") String cookieSameSite,
            @Value("${app.auth.refresh-cookie-path}") String cookiePath,
            @Value("${app.auth.refresh-cookie-max-age-seconds}") long cookieMaxAgeSeconds) {
        this.cookieName = cookieName;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
        this.cookiePath = cookiePath;
        this.cookieMaxAgeSeconds = cookieMaxAgeSeconds;
    }

    public ResponseCookie buildRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(cookieName, refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path(cookiePath)
                .maxAge(cookieMaxAgeSeconds)
                .build();
    }

    public ResponseCookie buildClearCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path(cookiePath)
                .maxAge(0)
                .build();
    }

    public String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}

