package com.health.auth.auth_service.service;

import com.health.auth.auth_service.dto.AuthResponse;
import com.health.auth.auth_service.entity.User;
import com.health.auth.auth_service.exception.AuthException;
import com.health.auth.auth_service.repository.UserRepository;
import com.health.auth.auth_service.security.JwtUtil;
import com.health.auth.auth_service.util.OtpUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpUtil otpUtil;

    @Mock
    private OtpService otpService;

    @Mock
    private TokenService tokenService;

    @Mock
    private ClientProfileService clientProfileService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void refreshToken_shouldIncludeUserName_whenNameExistsInDatabase() {
        User user = User.builder()
                .id(9L)
                .name("Admin One")
                .role(User.Role.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .isProfileCompleted(false)
                .approvalStatus(User.DoctorRequestStatus.NONE)
                .isFirstLogin(true)
                .isVerified(true)
                .build();

        when(jwtUtil.isTokenValid("old-refresh")).thenReturn(true);
        when(jwtUtil.extractUserId("old-refresh")).thenReturn("9");
        when(userRepository.findById(9L)).thenReturn(Optional.of(user));
        when(tokenService.rotateRefreshToken("old-refresh", user))
                .thenReturn(new TokenService.TokenPair("new-access", "new-refresh"));

        AuthResponse.TokenResponse response = authService.refreshToken("old-refresh");

        assertEquals("Admin One", response.getUser().getName());
        assertEquals(9L, response.getUser().getId());
        assertEquals("new-access", response.getToken());
        assertEquals(User.Role.ADMIN, response.getRole());
        assertEquals(false, response.getIsProfileCompleted());
        assertEquals(User.DoctorRequestStatus.NONE, response.getApprovalStatus());
        assertEquals(User.UserStatus.ACTIVE, response.getStatus());
    }

    @Test
    void forgotAdminPassword_shouldFailWithTooManyRequests_whenResendCooldownActive() {
        User admin = User.builder()
                .id(9L)
                .email("admin@test.com")
                .role(User.Role.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(otpUtil.isEmailResendAllowed("admin@test.com")).thenReturn(false);
        when(otpUtil.getEmailResendCooldownRemaining("admin@test.com")).thenReturn(42L);

        AuthException ex = assertThrows(AuthException.class,
                () -> authService.forgotAdminPassword("admin@test.com"));

        assertEquals("Please wait 42 seconds before requesting a new OTP.", ex.getMessage());
        verify(otpService, never()).sendAdminPasswordResetOtp(any(), any());
    }

    @Test
    void resetAdminPassword_shouldUpdatePasswordAndRevokeTokens_whenOtpIsValid() {
        User admin = User.builder()
                .id(10L)
                .email("admin@test.com")
                .role(User.Role.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .passwordHash("old-hash")
                .isFirstLogin(true)
                .build();

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(otpUtil.validateEmailOtp("admin@test.com", "123456")).thenReturn(OtpUtil.OtpValidationResult.VALID);
        when(passwordEncoder.encode("New@Pass1")).thenReturn("new-hash");

        authService.resetAdminPassword("admin@test.com", "123456", "New@Pass1", "New@Pass1");

        assertEquals("new-hash", admin.getPasswordHash());
        assertEquals(false, admin.getIsFirstLogin());
        verify(userRepository).save(admin);
        verify(tokenService).revokeAllUserTokens(admin);
    }

    @Test
    void changePassword_shouldFail_whenConfirmPasswordDoesNotMatch() {
        User admin = User.builder()
                .id(7L)
                .role(User.Role.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .passwordHash("encoded-old")
                .build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(admin));

        AuthException ex = assertThrows(AuthException.class,
                () -> authService.changePassword(7L, "Old@Pass1", "New@Pass1", "Mismatch@1"));

        assertEquals("New password and confirm password do not match.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void syncUserName_shouldTrimAndPersistName() {
        User user = User.builder()
                .id(11L)
                .name("Old Name")
                .role(User.Role.PATIENT)
                .status(User.UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(11L)).thenReturn(Optional.of(user));

        authService.syncUserName(11L, "  Dr Jane Doe  ");

        assertEquals("Dr Jane Doe", user.getName());
        verify(userRepository).save(user);
    }

    @Test
    void syncUserName_shouldFailWhenNameBlank() {
        User user = User.builder()
                .id(12L)
                .name("Existing")
                .role(User.Role.PATIENT)
                .status(User.UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(12L)).thenReturn(Optional.of(user));

        AuthException ex = assertThrows(AuthException.class,
                () -> authService.syncUserName(12L, "   "));

        assertEquals("Name is required.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}

