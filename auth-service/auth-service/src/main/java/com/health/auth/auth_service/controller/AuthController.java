package com.health.auth.auth_service.controller;


import com.health.auth.auth_service.dto.RegisterRequest.*;
import com.health.auth.auth_service.dto.AuthResponse.*;
import com.health.auth.auth_service.exception.AuthException;
import com.health.auth.auth_service.security.JwtAuthenticationFilter.AuthenticatedUser;
import com.health.auth.auth_service.security.RefreshTokenCookieService;
import com.health.auth.auth_service.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    // ── POST /auth/register ───────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<OtpResponse>> register(
            @Valid @RequestBody PatientDoctorRegisterRequest request) {

        OtpResponse data = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful. Please verify your OTP.", data));
    }

    // ── POST /auth/authenticate (UNIFIED: login or register) ──────────────────
    @PostMapping("/authenticate")
    public ResponseEntity<ApiResponse<OtpResponse>> authenticate(
            @Valid @RequestBody UnifiedAuthRequest request) {

        OtpResponse data = authService.authenticateWithPhone(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully.", data));
    }

    // ── POST /auth/send-otp ───────────────────────────────────────────────────
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<OtpResponse>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        OtpResponse data = authService.sendOtp(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully.", data));
    }

    // ── POST /auth/verify-otp ─────────────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<TokenResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        TokenResponse tokens = authService.verifyOtp(request.getPhone(), request.getOtp());
        String refreshToken = extractRefreshToken(tokens);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.buildRefreshTokenCookie(refreshToken).toString())
                .body(ApiResponse.success("Authentication successful.", tokens));
    }

    // ── POST /auth/login (Admin step 1) ───────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<ChallengeResponse>> adminLogin(
            @Valid @RequestBody AdminLoginRequest request) {

        ChallengeResponse challenge = authService.adminLogin(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Password verified. Please complete 2FA.", challenge));
    }

    // ── POST /auth/admin/verify-2fa (Admin step 2) ────────────────────────────
    @PostMapping("/admin/verify-2fa")
    public ResponseEntity<ApiResponse<TokenResponse>> adminVerify2FA(
            @Valid @RequestBody AdminVerify2FARequest request) {

        TokenResponse tokens = authService.adminVerify2FA(
                request.getChallengeToken(), request.getOtp());
        String refreshToken = extractRefreshToken(tokens);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.buildRefreshTokenCookie(refreshToken).toString())
                .body(ApiResponse.success("2FA verified. Login successful.", tokens));
    }

    // ── POST /auth/admin/forgot-password ─────────────────────────────────────
    @PostMapping("/admin/forgot-password")
    public ResponseEntity<ApiResponse<OtpResponse>> forgotAdminPassword(
            @Valid @RequestBody AdminForgotPasswordRequest request) {

        OtpResponse response = authService.forgotAdminPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    // ── POST /auth/admin/reset-password ──────────────────────────────────────
    @PostMapping("/admin/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetAdminPassword(
            @Valid @RequestBody AdminResetPasswordRequest request) {

        authService.resetAdminPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword(),
                request.getConfirmPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successful. Please login with your new password."));
    }

    // ── POST /auth/admin/change-password ─────────────────────────────────────
    @PostMapping("/admin/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        authService.changePassword(
                principal.userId(),
                request.getOldPassword(),
                request.getNewPassword(),
                request.getConfirmPassword());
        return ResponseEntity.ok(ApiResponse.success(
                "Password changed successfully. Please login again."));
    }

    // ── POST /auth/refresh ────────────────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            HttpServletRequest request) {

        String existingRefreshToken = refreshTokenCookieService.extractRefreshToken(request);
        TokenResponse tokens = authService.refreshToken(existingRefreshToken);
        String newRefreshToken = extractRefreshToken(tokens);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.buildRefreshTokenCookie(newRefreshToken).toString())
                .body(ApiResponse.success("Token refreshed.", tokens));
    }

    // ── POST /auth/logout ─────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        String refreshToken = refreshTokenCookieService.extractRefreshToken(request);
        authService.logout(principal.rawToken(), principal.userId(), refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.buildClearCookie().toString())
                .body(ApiResponse.success("Logged out successfully."));
    }

    // ── POST /auth/validate (internal — called by API Gateway) ───────────────
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidateResponse>> validate(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);

        // TokenService validates signature + blacklist
        var claims = authService.validateToken(token);

        ValidateResponse payload = ValidateResponse.builder()
                .userId(Long.parseLong(claims.getSubject()))
                .role(claims.get("role", String.class))
                .status(claims.get("status", String.class))
                .profileId(claims.get("profileId", String.class))
                .jti(claims.getId())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Token is valid.", payload));
    }

    private String extractRefreshToken(TokenResponse tokens) {
        String refreshToken = tokens.getRefreshToken();
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AuthException("Refresh token generation failed.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        tokens.setRefreshToken(null);
        return refreshToken;
    }
}