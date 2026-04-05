package com.health.auth.auth_service.service;


import com.health.auth.auth_service.entity.User;
import com.health.auth.auth_service.entity.User.Role;
import com.health.auth.auth_service.entity.User.UserStatus;
import com.health.auth.auth_service.exception.AuthException;
import com.health.auth.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final OtpService otpService;
    private final ClientProfileService clientProfileService;
    private final PasswordEncoder passwordEncoder;

    // ── Create user (admin-initiated, e.g. creating another admin) ────────────
    @Transactional
    public User createUser(String email, String phone, String name, Role role, String temporaryPassword) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        String normalizedPhone = phone == null ? null : phone.trim();
        String normalizedName = name == null ? null : name.trim();

        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new AuthException("Email is required.", HttpStatus.BAD_REQUEST);
        }
        if (normalizedPhone == null || normalizedPhone.isBlank()) {
            throw new AuthException("Phone number is required.", HttpStatus.BAD_REQUEST);
        }
        if (normalizedName == null || normalizedName.isBlank()) {
            throw new AuthException("Name is required.", HttpStatus.BAD_REQUEST);
        }
        if (role == null) {
            throw new AuthException("Role is required.", HttpStatus.BAD_REQUEST);
        }
        if (temporaryPassword == null || temporaryPassword.isBlank()) {
            throw new AuthException("Temporary password is required.", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new AuthException("Email already in use.", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new AuthException("Phone number already in use.", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .phone(normalizedPhone)
                .email(normalizedEmail)
                .name(normalizedName)
                .passwordHash(passwordEncoder.encode(temporaryPassword))
                .role(role)
                .status(UserStatus.ACTIVE)
                .isProfileCompleted(false)
                .approvalStatus(User.DoctorRequestStatus.NONE)
                .isFirstLogin(true) // forces password change on first login
                .isVerified(true)
                .build();

        user = userRepository.save(user);

        // Initialize profile
        String profileId = clientProfileService.initializeProfile(user.getId(), normalizedName, role);
        if (profileId != null) {
            user.setProfileId(profileId);
            userRepository.save(user);
        }

        log.info("Admin created user: email={}**, role={}", maskForLog(normalizedEmail, 3), role);
        return user;
    }

    private String maskForLog(String value, int visibleChars) {
        if (value == null || value.isBlank()) {
            return "***";
        }
        int safeVisible = Math.max(1, Math.min(value.length(), visibleChars));
        return value.substring(0, safeVisible);
    }

    // ── Block user ────────────────────────────────────────────────────────────
    @Transactional
    public void blockUser(Long userId) {
        User user = findUser(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new AuthException("Cannot block an admin account.", HttpStatus.FORBIDDEN);
        }
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AuthException("User is already blocked.", HttpStatus.CONFLICT);
        }

        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);

        // Immediately revoke all active tokens
        tokenService.revokeAllUserTokens(user);

        log.info("User blocked: userId={}", userId);
    }

    // ── Unblock user ──────────────────────────────────────────────────────────
    @Transactional
    public void unblockUser(Long userId) {
        User user = findUser(userId);

        if (user.getStatus() != UserStatus.BLOCKED) {
            throw new AuthException("User is not currently blocked.", HttpStatus.CONFLICT);
        }

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        log.info("User unblocked: userId={}", userId);
    }

    // ── Approve doctor ────────────────────────────────────────────────────────
    @Transactional
    public void approveDoctor(Long userId) {
        User doctor = findUser(userId);

        if (doctor.getApprovalStatus() != User.DoctorRequestStatus.PENDING) {
            throw new AuthException(
                    "User is not in pending doctor upgrade status. Current approval_status: " + doctor.getApprovalStatus(),
                    HttpStatus.CONFLICT
            );
        }

        doctor.setRole(Role.DOCTOR);
        doctor.setApprovalStatus(User.DoctorRequestStatus.APPROVED);
        doctor.setStatus(UserStatus.ACTIVE);
        userRepository.save(doctor);

        // Notify Profile Service
        clientProfileService.notifyDoctorStatusChange(userId, "APPROVED", null);

        // Send SMS to doctor
        if (doctor.getPhone() != null) {
            otpService.sendDoctorApprovalSms(doctor.getPhone(), resolveDoctorName(doctor));
        }

        log.info("Doctor approved: userId={}", userId);
    }

    // ── Reject doctor ─────────────────────────────────────────────────────────
    @Transactional
    public void rejectDoctor(Long userId, String reason) {
        User doctor = findUser(userId);

        if (doctor.getApprovalStatus() != User.DoctorRequestStatus.PENDING) {
            throw new AuthException(
                    "User is not in pending doctor upgrade status. Current approval_status: " + doctor.getApprovalStatus(),
                    HttpStatus.CONFLICT
            );
        }

        doctor.setRole(Role.PATIENT);
        doctor.setApprovalStatus(User.DoctorRequestStatus.REJECTED);
        doctor.setStatus(UserStatus.ACTIVE);
        userRepository.save(doctor);

        // Notify Profile Service
        clientProfileService.notifyDoctorStatusChange(userId, "REJECTED", reason);

        // Send SMS to doctor
        if (doctor.getPhone() != null) {
            otpService.sendDoctorRejectionSms(doctor.getPhone(), resolveDoctorName(doctor), reason);
        }

        log.info("Doctor rejected: userId={}, reason={}", userId, reason);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found.", HttpStatus.NOT_FOUND));
    }

    private String resolveDoctorName(User doctor) {
        String name = doctor.getName() == null ? null : doctor.getName().trim();
        return (name == null || name.isBlank()) ? "Doctor" : name;
    }
}