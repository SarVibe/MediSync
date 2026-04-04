package com.health.auth.auth_service.service;



import com.health.auth.auth_service.dto.AuthResponse;
import com.health.auth.auth_service.dto.RegisterRequest;
import com.health.auth.auth_service.entity.User;
import com.health.auth.auth_service.entity.User.UserStatus;
import com.health.auth.auth_service.exception.AuthException;
import com.health.auth.auth_service.repository.UserRepository;
import com.health.auth.auth_service.security.JwtUtil;
import com.health.auth.auth_service.util.OtpUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpUtil otpUtil;
    private final OtpService otpService;
    private final TokenService tokenService;
    private final ClientProfileService clientProfileService;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final JwtUtil jwtUtil;

    @Value("${app.admin.challenge-token-expiry-seconds}")
    private long challengeTokenExpirySeconds;

    private static final String CHALLENGE_PREFIX = "2fa_challenge:";
    private static final Pattern PASSWORD_COMPLEXITY_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"
    );

    // ═════════════════════════════════════════════════════════════════════════
    // PATIENT — Phone + OTP flows
    // ═════════════════════════════════════════════════════════════════════════

    @Transactional
    public AuthResponse.OtpResponse register(RegisterRequest.PatientDoctorRegisterRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new AuthException("Name is required.", HttpStatus.BAD_REQUEST);
        }

        User existingUser = userRepository.findByPhone(request.getPhone()).orElse(null);
        if (existingUser != null) {
            if (Boolean.TRUE.equals(existingUser.getIsVerified())) {
                throw new AuthException(
                        "This phone number is already registered. Please sign in instead.",
                        HttpStatus.CONFLICT
                );
            }

            validateUserStatus(existingUser);

            if (!otpUtil.isResendAllowed(request.getPhone())) {
                long remaining = otpUtil.getResendCooldownRemaining(request.getPhone());
                throw new AuthException(
                        "Registration is pending verification. Please wait " + remaining + " seconds before requesting a new OTP.",
                        HttpStatus.TOO_MANY_REQUESTS
                );
            }

            String otp = otpUtil.generateAndStoreOtp(request.getPhone());
            otpService.sendOtp(request.getPhone(), otp);

            return AuthResponse.OtpResponse.builder()
                    .message("Registration is pending verification. OTP re-sent to your phone.")
                    .resendAfterSeconds(60L)
                    .build();
        }

        // Self-registration is patient-only; enforce server-side defaults.
        User user = User.builder()
                .phone(request.getPhone())
                .name(request.getName().trim())
                .role(User.Role.PATIENT)
                .status(UserStatus.ACTIVE)
                .isProfileCompleted(false)
                .approvalStatus(User.DoctorRequestStatus.NONE)
                .isVerified(false)
                .build();

        user = userRepository.save(user);

        // Initialize profile in Profile Service (async-safe — failure doesn't block registration)
        String profileId = clientProfileService.initializeProfile(user.getId(), request.getName(), user.getRole());
        if (profileId != null) {
            user.setProfileId(profileId);
            userRepository.save(user);
        }

        // Generate & send OTP
        String otp = otpUtil.generateAndStoreOtp(request.getPhone());
        otpService.sendOtp(request.getPhone(), otp);

        log.info("User registered: phone={}**, role={}", request.getPhone().substring(0, 6), user.getRole());

        return AuthResponse.OtpResponse.builder()
                .message("OTP sent to your phone. Please verify to complete registration.")
                .resendAfterSeconds(60L)
                .build();
    }

    // ═════════════════════════════════════════════════════════════════════════
    // UNIFIED FLOW — Single entry point for phone-based auth
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Unified authentication flow:
     * - If user doesn't exist: Auto-create as PATIENT with placeholder name, send OTP
     * - If user exists: Send OTP for login
     * 
     * Returns metadata (isNewUser) to help frontend route post-verification.
     * Uses generic success messages to prevent user enumeration.
     */
    @Transactional
    public AuthResponse.OtpResponse authenticateWithPhone(String phone) {
        User existingUser = userRepository.findByPhone(phone).orElse(null);

        // User does NOT exist — auto-create new patient account
        if (existingUser == null) {
            // Generate placeholder name; can be updated later in profile
            String placeholderName = "User-" + UUID.randomUUID().toString().substring(0, 8);

            User newUser = User.builder()
                    .phone(phone)
                    .name(placeholderName)
                    .role(User.Role.PATIENT)
                    .status(UserStatus.ACTIVE)
                    .isProfileCompleted(false)
                    .approvalStatus(User.DoctorRequestStatus.NONE)
                    .isVerified(false)
                    .build();

            newUser = userRepository.save(newUser);

            // Initialize profile in Profile Service (async-safe)
            String profileId = clientProfileService.initializeProfile(newUser.getId(), placeholderName, newUser.getRole());
            if (profileId != null) {
                newUser.setProfileId(profileId);
                userRepository.save(newUser);
            }

            // Generate & send OTP
            String otp = otpUtil.generateAndStoreOtp(phone);
            otpService.sendOtp(phone, otp);

            log.info("New user created via unified flow: phone={}**, role={}", phone.substring(0, 6), newUser.getRole());

            return AuthResponse.OtpResponse.builder()
                    .message("OTP sent to your phone. Please verify to complete registration.")
                    .resendAfterSeconds(60L)
                    .isNewUser(true)  // NEW: Frontend knows this is a new user
                    .build();
        }

        // User EXISTS — verify account status and send login OTP
        validateUserStatus(existingUser);

        // Check resend cooldown
        if (!otpUtil.isResendAllowed(phone)) {
            long remaining = otpUtil.getResendCooldownRemaining(phone);
            throw new AuthException(
                    "Please wait " + remaining + " seconds before requesting a new OTP.",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }

        String otp = otpUtil.generateAndStoreOtp(phone);
        otpService.sendOtp(phone, otp);

        log.info("Existing user login via unified flow: phone={}**, role={}, status={}", 
                phone.substring(0, 6), existingUser.getRole(), existingUser.getStatus());

        return AuthResponse.OtpResponse.builder()
                .message("OTP sent to your phone. Please verify to log in.")
                .resendAfterSeconds(60L)
                .isNewUser(false)  // NEW: Frontend knows this is an existing user login
                .build();
    }

    // ═════════════════════════════════════════════════════════════════════════
    // PATIENT — Phone + OTP flows (Legacy endpoints)
    // ═════════════════════════════════════════════════════════════════════════

    public AuthResponse.OtpResponse sendOtp(String phone) {
        // Phone must exist for login flow
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new AuthException(
                        "No account found with this number. Please register first.",
                        HttpStatus.NOT_FOUND
                ));

        // Pre-check status before wasting an OTP
        validateUserStatus(user);

        // Check resend cooldown
        if (!otpUtil.isResendAllowed(phone)) {
            long remaining = otpUtil.getResendCooldownRemaining(phone);
            throw new AuthException(
                    "Please wait " + remaining + " seconds before requesting a new OTP.",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }

        String otp = otpUtil.generateAndStoreOtp(phone);
        otpService.sendOtp(phone, otp);

        return AuthResponse.OtpResponse.builder()
                .message("OTP sent successfully.")
                .resendAfterSeconds(60L)
                .build();
    }

    @Transactional
    public AuthResponse.TokenResponse verifyOtp(String phone, String inputOtp) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new AuthException(
                        "No account found with this number.",
                        HttpStatus.NOT_FOUND
                ));

        // Validate OTP
        OtpUtil.OtpValidationResult result = otpUtil.validateOtp(phone, inputOtp);

        if (result.expired) {
            throw new AuthException("OTP has expired. Please request a new one.", HttpStatus.GONE);
        }
        if (result.maxAttemptsExceeded) {
            throw new AuthException(
                    "Too many incorrect attempts. Please request a new OTP.",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }
        if (!result.valid) {
            throw new AuthException(
                    "Invalid OTP. " + result.remainingAttempts + " attempt(s) remaining.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        // OTP is valid — now check account status
        validateUserStatus(user);

        // First successful OTP marks account as verified.
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            user.setIsVerified(true);
            userRepository.save(user);
        }

        // Issue tokens
        TokenService.TokenPair tokens = tokenService.issueTokenPair(user);

        log.info("User authenticated via OTP: userId={}, role={}", user.getId(), user.getRole());

        return buildTokenResponse(user, tokens);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ADMIN — Email + Password + 2FA flows
    // ═════════════════════════════════════════════════════════════════════════

    public AuthResponse.ChallengeResponse adminLogin(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        User admin = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AuthException(
                        "Invalid email or password.",
                        HttpStatus.UNAUTHORIZED
                ));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new AuthException("Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new AuthException("Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        validateUserStatus(admin);

        // Generate challenge token (short-lived, stored in Redis)
        String challengeToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                CHALLENGE_PREFIX + challengeToken,
                admin.getId().toString(),
                Duration.ofSeconds(challengeTokenExpirySeconds)
        );

        // Current admin 2FA uses email as both OTP key and delivery channel.
        String otp = otpUtil.generateAndStoreOtp(normalizedEmail); // use email as key for admin login 2FA
        otpService.sendAdminOtp(normalizedEmail, otp);
        log.warn("[DEV ONLY] Admin 2FA OTP for {}: {}", normalizedEmail, otp);

        log.info("Admin login step 1 completed for email={}**", normalizedEmail.substring(0, Math.min(3, normalizedEmail.length())));

        return AuthResponse.ChallengeResponse.builder()
                .challengeToken(challengeToken)
                .message("Password verified. OTP sent. Please complete 2FA.")
                .expiresInSeconds(challengeTokenExpirySeconds)
                .build();
    }

    public AuthResponse.OtpResponse forgotAdminPassword(String email) {
        String normalizedEmail = normalizeEmail(email);

        User admin = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (admin == null || admin.getRole() != User.Role.ADMIN || admin.getStatus() != UserStatus.ACTIVE) {
            // Prevent user enumeration: always return a generic success response.
            log.info("Password reset requested for non-eligible account: {}", maskEmail(normalizedEmail));
            return AuthResponse.OtpResponse.builder()
                    .message("If an active admin account exists for this email, an OTP has been sent.")
                    .resendAfterSeconds(60L)
                    .build();
        }

        if (!otpUtil.isEmailResendAllowed(normalizedEmail)) {
            long remaining = otpUtil.getEmailResendCooldownRemaining(normalizedEmail);
            throw new AuthException(
                    "Please wait " + remaining + " seconds before requesting a new OTP.",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }

        String otp = otpUtil.generateAndStoreEmailOtp(normalizedEmail);
        otpService.sendAdminPasswordResetOtp(normalizedEmail, otp);

        return AuthResponse.OtpResponse.builder()
                .message("If an active admin account exists for this email, an OTP has been sent.")
                .resendAfterSeconds(60L)
                .build();
    }

    @Transactional
    public void resetAdminPassword(String email, String otp, String newPassword, String confirmPassword) {
        String normalizedEmail = normalizeEmail(email);
        validateNewPassword(newPassword, confirmPassword);

        User admin = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AuthException("Invalid password reset request.", HttpStatus.UNAUTHORIZED));

        if (admin.getRole() != User.Role.ADMIN || admin.getStatus() != UserStatus.ACTIVE) {
            throw new AuthException("Invalid password reset request.", HttpStatus.UNAUTHORIZED);
        }

        OtpUtil.OtpValidationResult result = otpUtil.validateEmailOtp(normalizedEmail, otp);
        if (result.expired) {
            throw new AuthException("OTP has expired. Please request a new one.", HttpStatus.GONE);
        }
        if (result.maxAttemptsExceeded) {
            throw new AuthException("Too many incorrect attempts. Please request a new OTP.", HttpStatus.TOO_MANY_REQUESTS);
        }
        if (!result.valid) {
            throw new AuthException(
                    "Invalid OTP. " + result.remainingAttempts + " attempt(s) remaining.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        admin.setIsFirstLogin(false);
        userRepository.save(admin);
        tokenService.revokeAllUserTokens(admin);

        log.info("Admin password reset completed for userId={}", admin.getId());
    }

    @Transactional
    public AuthResponse.TokenResponse adminVerify2FA(String challengeToken, String otp) {
        // Retrieve userId from challenge token
        String userId = redisTemplate.opsForValue().get(CHALLENGE_PREFIX + challengeToken);
        if (userId == null) {
            throw new AuthException(
                    "Challenge token expired or invalid. Please login again.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        User admin = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new AuthException("User not found.", HttpStatus.NOT_FOUND));

        // Validate OTP (using email as key for admin)
        OtpUtil.OtpValidationResult result = otpUtil.validateOtp(admin.getEmail(), otp);

        if (result.expired) {
            throw new AuthException("OTP has expired. Please login again.", HttpStatus.GONE);
        }
        if (result.maxAttemptsExceeded) {
            throw new AuthException("Too many incorrect attempts. Please login again.", HttpStatus.TOO_MANY_REQUESTS);
        }
        if (!result.valid) {
            throw new AuthException(
                    "Invalid OTP. " + result.remainingAttempts + " attempt(s) remaining.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        // Clean up challenge token
        redisTemplate.delete(CHALLENGE_PREFIX + challengeToken);

        TokenService.TokenPair tokens = tokenService.issueTokenPair(admin);
        log.info("Admin 2FA verified: userId={}", admin.getId());

        return buildTokenResponse(admin, tokens);
    }

    @Transactional
    public void changePassword(Long adminId, String oldPassword, String newPassword, String confirmPassword) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AuthException("User not found.", HttpStatus.NOT_FOUND));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new AuthException("Only admins can change password.", HttpStatus.FORBIDDEN);
        }

        validateNewPassword(newPassword, confirmPassword);

        if (!passwordEncoder.matches(oldPassword, admin.getPasswordHash())) {
            throw new AuthException("Current password is incorrect.", HttpStatus.UNAUTHORIZED);
        }

        if (passwordEncoder.matches(newPassword, admin.getPasswordHash())) {
            throw new AuthException("New password must be different from current password.", HttpStatus.BAD_REQUEST);
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        admin.setIsFirstLogin(false);
        userRepository.save(admin);

        // Revoke all existing tokens — force re-login after password change
        tokenService.revokeAllUserTokens(admin);

        log.info("Password changed for adminId={}", adminId);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // SHARED — Refresh & Logout
    // ═════════════════════════════════════════════════════════════════════════

    @Transactional
    public AuthResponse.TokenResponse refreshToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new AuthException("Refresh token is missing.", HttpStatus.UNAUTHORIZED);
        }

        // Parse the refresh token to get userId — bypass blacklist check
        // (refresh tokens are stored hashed in DB, not in Redis blacklist)
        if (!jwtUtil.isTokenValid(rawRefreshToken)) {
            throw new AuthException("Invalid refresh token.", HttpStatus.UNAUTHORIZED);
        }

        String userId = jwtUtil.extractUserId(rawRefreshToken);
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new AuthException("User not found.", HttpStatus.UNAUTHORIZED));

        validateUserStatus(user);

        // Rotate — verifies the token hash against DB, then issues a new pair
        TokenService.TokenPair tokens = tokenService.rotateRefreshToken(rawRefreshToken, user);
        return buildTokenResponse(user, tokens);
    }

    // ── Validate token (called by API Gateway) ────────────────────────────────
    public Claims validateToken(String token) {
        return tokenService.validateAccessToken(token);
    }

    public void logout(String accessToken, Long userId, String refreshToken) {
        // Blacklist the access token
        tokenService.blacklistAccessToken(accessToken);

        userRepository.findById(userId).ifPresent(user -> {
            tokenService.revokeRefreshToken(refreshToken, user);
            // Keep logout strict: invalidate all active refresh sessions for this user.
            tokenService.revokeAllUserTokens(user);
        });

        log.info("User logged out: userId={}", userId);
    }

    @Transactional
    public void requestDoctorUpgrade(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found.", HttpStatus.NOT_FOUND));

        if (user.getRole() == User.Role.ADMIN) {
            throw new AuthException("Admin accounts cannot request doctor upgrade.", HttpStatus.BAD_REQUEST);
        }
        if (user.getRole() == User.Role.DOCTOR) {
            throw new AuthException("Account is already a doctor.", HttpStatus.CONFLICT);
        }
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new AuthException("Verify OTP before requesting doctor upgrade.", HttpStatus.FORBIDDEN);
        }
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AuthException("Blocked accounts cannot request doctor upgrade.", HttpStatus.FORBIDDEN);
        }
        if (user.getApprovalStatus() == User.DoctorRequestStatus.PENDING) {
            throw new AuthException("Doctor upgrade request is already pending.", HttpStatus.CONFLICT);
        }

        user.setApprovalStatus(User.DoctorRequestStatus.PENDING);
        userRepository.save(user);

        log.info("Doctor upgrade requested for userId={}", userId);
    }

    @Transactional
    public void syncUserName(Long userId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found.", HttpStatus.NOT_FOUND));

        String normalizedName = name == null ? null : name.trim();
        if (normalizedName == null || normalizedName.isBlank()) {
            throw new AuthException("Name is required.", HttpStatus.BAD_REQUEST);
        }

        user.setName(normalizedName);
        userRepository.save(user);
        log.info("User name synced: userId={}", userId);
    }

    @Transactional
    public void syncProfileCompletion(Long userId, Boolean isProfileCompleted) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found.", HttpStatus.NOT_FOUND));

        user.setIsProfileCompleted(Boolean.TRUE.equals(isProfileCompleted));
        userRepository.save(user);
        log.info("User profile completion synced: userId={}, isProfileCompleted={}", userId, user.getIsProfileCompleted());
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Internal helpers
    // ═════════════════════════════════════════════════════════════════════════

    private void validateUserStatus(User user) {
        switch (user.getStatus()) {
            case BLOCKED -> throw new AuthException(
                    "Your account has been blocked. Please contact support.", HttpStatus.FORBIDDEN);
            case PENDING, REJECTED, ACTIVE -> { /* all good for auth; doctor workflow is tracked by approval_status */ }
        }
    }

    private void validateNewPassword(String newPassword, String confirmPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new AuthException("New password is required.", HttpStatus.BAD_REQUEST);
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new AuthException("New password and confirm password do not match.", HttpStatus.BAD_REQUEST);
        }
        if (newPassword.length() < 8 || !PASSWORD_COMPLEXITY_PATTERN.matcher(newPassword).matches()) {
            throw new AuthException(
                    "Password must contain uppercase, lowercase, number and special character.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "**";
        }
        return email.substring(0, Math.min(3, atIndex)) + "***" + email.substring(atIndex);
    }

    private AuthResponse.TokenResponse buildTokenResponse(User user, TokenService.TokenPair tokens) {
        return AuthResponse.TokenResponse.builder()
                .token(tokens.accessToken())
                .accessToken(tokens.accessToken())
                .refreshToken(tokens.refreshToken())
                .tokenType("Bearer")
                .expiresIn(900L) // 15 minutes
                .role(user.getRole())
                .isProfileCompleted(user.getIsProfileCompleted())
                .approvalStatus(user.getApprovalStatus())
                .status(user.getStatus())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .isFirstLogin(user.getIsFirstLogin())
                        .isVerified(user.getIsVerified())
                        .build())
                .build();
    }
}

