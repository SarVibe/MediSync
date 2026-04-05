package com.health.auth.auth_service.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;

@Component
@Slf4j
@RequiredArgsConstructor
public class OtpUtil {

    private final StringRedisTemplate redisTemplate;

    @Value("${app.otp.expiry-seconds}")
    private long otpExpirySeconds;

    @Value("${app.otp.max-attempts}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds}")
    private long resendCooldownSeconds;

    @Value("${app.otp.length}")
    private int otpLength;

    private static final String OTP_PREFIX      = "otp:";
    private static final String ATTEMPTS_PREFIX = "otp_attempts:";
    private static final String RESEND_PREFIX   = "otp_resend:";

    // Dedicated namespace for admin forgot-password OTP keys.
    private static final String EMAIL_OTP_PREFIX      = "otp:email:";
    private static final String EMAIL_ATTEMPTS_PREFIX = "otp_attempts:email:";
    private static final String EMAIL_RESEND_PREFIX   = "otp_resend:email:";

    private final SecureRandom secureRandom = new SecureRandom();

    // ── Generate & store ──────────────────────────────────────────────────────
    public String generateAndStoreOtp(String phone) {
        String otp = generateAndStoreOtpInternal(phone, OTP_PREFIX, ATTEMPTS_PREFIX, RESEND_PREFIX);
        log.debug("OTP generated for phone: {}", maskIdentifier(phone));
        return otp;
    }

    public String generateAndStoreEmailOtp(String email) {
        String otp = generateAndStoreOtpInternal(email, EMAIL_OTP_PREFIX, EMAIL_ATTEMPTS_PREFIX, EMAIL_RESEND_PREFIX);
        log.debug("OTP generated for email: {}", maskIdentifier(email));
        return otp;
    }

    // ── Validate ──────────────────────────────────────────────────────────────
    public OtpValidationResult validateOtp(String phone, String inputOtp) {
        return validateOtpInternal(phone, inputOtp, OTP_PREFIX, ATTEMPTS_PREFIX);
    }

    public OtpValidationResult validateEmailOtp(String email, String inputOtp) {
        return validateOtpInternal(email, inputOtp, EMAIL_OTP_PREFIX, EMAIL_ATTEMPTS_PREFIX);
    }

    // ── Rate limiting checks ──────────────────────────────────────────────────
    public boolean isResendAllowed(String phone) {
        return isResendAllowedInternal(phone, RESEND_PREFIX);
    }

    public long getResendCooldownRemaining(String phone) {
        return getResendCooldownRemainingInternal(phone, RESEND_PREFIX);
    }

    public boolean isEmailResendAllowed(String email) {
        return isResendAllowedInternal(email, EMAIL_RESEND_PREFIX);
    }

    public long getEmailResendCooldownRemaining(String email) {
        return getResendCooldownRemainingInternal(email, EMAIL_RESEND_PREFIX);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────
    private String generateOtp() {
        int bound = (int) Math.pow(10, otpLength);
        int otp = secureRandom.nextInt(bound);
        return String.format("%0" + otpLength + "d", otp);
    }

    private String generateAndStoreOtpInternal(
            String identifier,
            String otpPrefix,
            String attemptsPrefix,
            String resendPrefix
    ) {
        String otp = generateOtp();

        redisTemplate.opsForValue().set(otpPrefix + identifier, otp, Duration.ofSeconds(otpExpirySeconds));
        redisTemplate.delete(attemptsPrefix + identifier);
        redisTemplate.opsForValue().set(resendPrefix + identifier, "1", Duration.ofSeconds(resendCooldownSeconds));
        return otp;
    }

    private OtpValidationResult validateOtpInternal(
            String identifier,
            String inputOtp,
            String otpPrefix,
            String attemptsPrefix
    ) {
        String storedOtp = redisTemplate.opsForValue().get(otpPrefix + identifier);

        if (storedOtp == null) {
            return OtpValidationResult.EXPIRED;
        }

        if (!storedOtp.equals(inputOtp)) {
            incrementAttempts(identifier, attemptsPrefix);
            int remaining = getRemainingAttempts(identifier, attemptsPrefix);
            if (remaining <= 0) {
                redisTemplate.delete(otpPrefix + identifier);
                return OtpValidationResult.MAX_ATTEMPTS_EXCEEDED;
            }
            return OtpValidationResult.invalid(remaining);
        }

        redisTemplate.delete(otpPrefix + identifier);
        redisTemplate.delete(attemptsPrefix + identifier);
        return OtpValidationResult.VALID;
    }

    private boolean isResendAllowedInternal(String identifier, String resendPrefix) {
        return !Boolean.TRUE.equals(redisTemplate.hasKey(resendPrefix + identifier));
    }

    private long getResendCooldownRemainingInternal(String identifier, String resendPrefix) {
        Long ttl = redisTemplate.getExpire(resendPrefix + identifier);
        return ttl != null ? ttl : 0;
    }

    private void incrementAttempts(String identifier, String attemptsPrefix) {
        String key = attemptsPrefix + identifier;
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, Duration.ofSeconds(otpExpirySeconds));
    }

    private int getRemainingAttempts(String identifier, String attemptsPrefix) {
        String val = redisTemplate.opsForValue().get(attemptsPrefix + identifier);
        int used = val != null ? Integer.parseInt(val) : 0;
        return maxAttempts - used;
    }

    private String maskIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return "**";
        }
        int length = Math.min(3, identifier.length());
        return identifier.substring(0, length) + "***";
    }

    // ── Result type ───────────────────────────────────────────────────────────
    public static class OtpValidationResult {
        public static final OtpValidationResult VALID = new OtpValidationResult(true, false, false, 0);
        public static final OtpValidationResult EXPIRED = new OtpValidationResult(false, true, false, 0);
        public static final OtpValidationResult MAX_ATTEMPTS_EXCEEDED = new OtpValidationResult(false, false, true, 0);

        public final boolean valid;
        public final boolean expired;
        public final boolean maxAttemptsExceeded;
        public final int remainingAttempts;

        private OtpValidationResult(boolean valid, boolean expired,
                                    boolean maxAttemptsExceeded, int remainingAttempts) {
            this.valid = valid;
            this.expired = expired;
            this.maxAttemptsExceeded = maxAttemptsExceeded;
            this.remainingAttempts = remainingAttempts;
        }

        public static OtpValidationResult invalid(int remaining) {
            return new OtpValidationResult(false, false, false, remaining);
        }
    }
}