package com.health.profile.profile_service.service;

import com.health.profile.profile_service.client.AuthRoleClient;
import com.health.profile.profile_service.dto.ProfileRequest;
import com.health.profile.profile_service.dto.ProfileResponse;
import com.health.profile.profile_service.entity.*;
import com.health.profile.profile_service.exception.ProfileException;
import com.health.profile.profile_service.repository.DoctorProfileRepository;
import com.health.profile.profile_service.repository.PatientProfileRepository;
import com.health.profile.profile_service.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final String PATIENT_PROFILE_BLOCKED_MESSAGE =
            "You cannot create a patient profile after requesting doctor upgrade.";

    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AuthRoleClient authRoleClient;
    private final ProfileImageStorageService profileImageStorageService;

    @Transactional
    public ProfileResponse.ProfileInitResponse initializeProfile(ProfileRequest.InitProfileRequest request) {
        return initializeProfileInternal(request.getUserId(), request.getName(), request.getRole(), null);
    }

    @Transactional
    public ProfileResponse.ProfileInitResponse initializeProfile(ProfileRequest.InitProfileUploadRequest request) {
        MultipartFile profileImage = request.getProfileImage();
        return initializeProfileInternal(
                request.getUserId(),
                request.getName(),
                request.getRole(),
                profileImage != null && !profileImage.isEmpty() ? profileImage : null
        );
    }

    @Transactional
    public void updateDoctorApprovalStatus(ProfileRequest.DoctorStatusUpdateRequest request) {
        DoctorProfile profile = doctorProfileRepository.findByUserIdAndIsDeletedFalse(request.getUserId())
                .orElseThrow(() -> new ProfileException("Doctor profile not found.", HttpStatus.NOT_FOUND));

        String status = request.getStatus().trim().toUpperCase(Locale.ROOT);
        switch (status) {
            case "APPROVED" -> {
                profile.setApprovalStatus(DoctorApprovalStatus.APPROVED);
                profile.setRejectionReason(null);
            }
            case "REJECTED" -> {
                profile.setApprovalStatus(DoctorApprovalStatus.REJECTED);
                profile.setRejectionReason(request.getReason());
            }
            default -> throw new ProfileException("Invalid doctor status update.", HttpStatus.BAD_REQUEST);
        }

        doctorProfileRepository.save(profile);
    }

    public ProfileResponse.PatientProfileDto getMyPatientProfile(AuthenticatedUser user) {
        requireRole(user, "PATIENT");
        PatientProfile profile = findPatientByUserId(user.userId());
        return toPatientDto(profile);
    }

    @Transactional
    public ProfileResponse.PatientProfileDto upsertMyPatientProfile(
            AuthenticatedUser user,
            ProfileRequest.PatientProfileUpsertRequest request
    ) {
        requireRole(user, "PATIENT");
        ensurePatientProfileSubmissionAllowed(user.userId());

        PatientProfile profile = patientProfileRepository.findByUserIdAndIsDeletedFalse(user.userId())
                .orElseGet(() -> PatientProfile.builder().userId(user.userId()).isDeleted(false).build());

        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName().trim());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress().trim());
        }
        if (request.getBloodGroup() != null) {
            profile.setBloodGroup(request.getBloodGroup());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getDob() != null) {
            profile.setDob(request.getDob());
        }
        if (request.getProfilePictureUrl() != null) {
            updatePatientProfileImageUrl(profile, request.getProfilePictureUrl().trim());
        }
        if (request.getBasicHealthInfo() != null) {
            profile.setBasicHealthInfo(request.getBasicHealthInfo().trim());
        }

        profile.setUpdatedBy(user.userId());
        profile.setIsDeleted(false);

        PatientProfile saved = patientProfileRepository.save(profile);
        syncUserNameIfPresent(user.userId(), request.getFullName());
        authRoleClient.syncProfileCompletion(user.userId(), true);
        return toPatientDto(saved);
    }

    public String uploadProfilePicture(AuthenticatedUser user, MultipartFile profileImage) {
        if (user == null) {
            throw new ProfileException("Authentication required.", HttpStatus.UNAUTHORIZED);
        }
        return profileImageStorageService.storePatientProfileImage(profileImage);
    }

    @Transactional
    public ProfileResponse.PatientProfileDto updateMyPatientProfilePicture(
            AuthenticatedUser user,
            ProfileRequest.PatientProfilePictureUploadRequest request
    ) {
        requireRole(user, "PATIENT");
        ensurePatientProfileSubmissionAllowed(user.userId());

        PatientProfile profile = findPatientByUserId(user.userId());
        String previousProfilePictureUrl = profile.getProfilePictureUrl();
        String profilePictureUrl = profileImageStorageService.storePatientProfileImage(request.getProfileImage());

        deleteManagedImageIfReplaced(previousProfilePictureUrl, profilePictureUrl);
        profile.setProfilePictureUrl(profilePictureUrl);
        profile.setUpdatedBy(user.userId());
        profile.setIsDeleted(false);

        return toPatientDto(patientProfileRepository.save(profile));
    }

    @Transactional
    public void softDeleteMyPatientProfile(AuthenticatedUser user) {
        requireRole(user, "PATIENT");
        PatientProfile profile = findPatientByUserId(user.userId());
        profileImageStorageService.deleteManagedProfileImage(profile.getProfilePictureUrl());
        profile.setProfilePictureUrl(null);
        profile.setIsDeleted(true);
        profile.setUpdatedBy(user.userId());
        patientProfileRepository.save(profile);
        authRoleClient.syncProfileCompletion(user.userId(), false);
    }

    @Transactional
    public ProfileResponse.DoctorProfileDto submitDoctorUpgradeRequest(
            AuthenticatedUser user,
            ProfileRequest.DoctorUpgradeRequest request
    ) {
        ensureDoctorUpgradeSubmissionAllowed(user);

        var existing = doctorProfileRepository.findByUserIdAndIsDeletedFalse(user.userId());
        if (existing.isPresent()) {
            DoctorApprovalStatus current = existing.get().getApprovalStatus();
            if (current == DoctorApprovalStatus.PENDING) {
                throw new ProfileException("Doctor upgrade request is already pending.", HttpStatus.CONFLICT);
            }
            if (current == DoctorApprovalStatus.APPROVED) {
                throw new ProfileException("Doctor profile is already approved.", HttpStatus.CONFLICT);
            }
        }

        DoctorProfile profile = existing.orElseGet(() ->
                DoctorProfile.builder().userId(user.userId()).isDeleted(false).build()
        );

        profile.setFullName(request.getFullName().trim());
        profile.setGender(request.getGender());
        profile.setSpecialization(request.getSpecialization().trim());
        profile.setQualifications(request.getQualifications().trim());
        profile.setExperienceYears(request.getExperienceYears());
        updateDoctorProfileImageUrl(profile, request.getProfilePictureUrl().trim());
        profile.setApprovalStatus(DoctorApprovalStatus.PENDING);
        profile.setRejectionReason(null);
        profile.setUpdatedBy(user.userId());
        profile.setIsDeleted(false);

        DoctorProfile saved = doctorProfileRepository.save(profile);
        syncUserNameIfPresent(user.userId(), request.getFullName());

        // Keep auth role workflow authoritative in auth-service.
        authRoleClient.submitDoctorUpgradeRequest(user.userId());

        return toDoctorDto(saved);
    }

    @Transactional
    public ProfileResponse.DoctorProfileDto submitDoctorUpgradeRequest(
            AuthenticatedUser user,
            ProfileRequest.DoctorUpgradeUploadRequest request
    ) {
        ensureDoctorUpgradeSubmissionAllowed(user);

        var existing = doctorProfileRepository.findByUserIdAndIsDeletedFalse(user.userId());
        if (existing.isPresent()) {
            DoctorApprovalStatus current = existing.get().getApprovalStatus();
            if (current == DoctorApprovalStatus.PENDING) {
                throw new ProfileException("Doctor upgrade request is already pending.", HttpStatus.CONFLICT);
            }
            if (current == DoctorApprovalStatus.APPROVED) {
                throw new ProfileException("Doctor profile is already approved.", HttpStatus.CONFLICT);
            }
        }

        String profileImageUrl = profileImageStorageService.storeDoctorProfileImage(request.getProfileImage());

        DoctorProfile profile = existing.orElseGet(() ->
                DoctorProfile.builder().userId(user.userId()).isDeleted(false).build()
        );

        deleteManagedImageIfReplaced(profile.getProfileImageUrl(), profileImageUrl);
        profile.setFullName(request.getFullName().trim());
        profile.setGender(request.getGender());
        profile.setSpecialization(request.getSpecialization().trim());
        profile.setQualifications(request.getQualifications().trim());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setProfileImageUrl(profileImageUrl);
        profile.setApprovalStatus(DoctorApprovalStatus.PENDING);
        profile.setRejectionReason(null);
        profile.setUpdatedBy(user.userId());
        profile.setIsDeleted(false);

        DoctorProfile saved = doctorProfileRepository.save(profile);
        syncUserNameIfPresent(user.userId(), request.getFullName());

        authRoleClient.submitDoctorUpgradeRequest(user.userId());

        return toDoctorDto(saved);
    }

    /**
     * Get Doctor Application (before approval)
     * Access: PATIENT with PENDING or REJECTED status
     */
    public ProfileResponse.DoctorProfileDto getMyDoctorApplication(AuthenticatedUser user) {
        if (!user.canAccessDoctorApplication()) {
            throw new ProfileException(
                "Access denied. Only patients with pending or rejected doctor applications can view their application.",
                HttpStatus.FORBIDDEN
            );
        }
        DoctorProfile profile = findDoctorByUserId(user.userId());
        
        // Verify the profile is in application state (not approved)
        if (profile.getApprovalStatus() == DoctorApprovalStatus.APPROVED) {
            throw new ProfileException(
                "Your doctor application has been approved. Please use the doctor profile endpoints.",
                HttpStatus.CONFLICT
            );
        }
        
        return toDoctorDto(profile);
    }

    /**
     * Get Doctor Profile (after approval)
     * Access: DOCTOR with ACTIVE status
     */
    public ProfileResponse.DoctorProfileDto getMyDoctorProfile(AuthenticatedUser user) {
        if (!user.canAccessDoctorProfile()) {
            throw new ProfileException(
                "Access denied. Only approved doctors can access the doctor profile. Current role: " + user.role() + ", status: " + user.status(),
                HttpStatus.FORBIDDEN
            );
        }
        return toDoctorDto(findDoctorByUserId(user.userId()));
    }

    /**
     * Update Doctor Application (before approval)
     * Access: PATIENT with PENDING or REJECTED status
     */
    @Transactional
    public ProfileResponse.DoctorProfileDto updateMyDoctorApplication(
            AuthenticatedUser user,
            ProfileRequest.DoctorProfileUpdateRequest request
    ) {
        if (!user.canAccessDoctorApplication()) {
            throw new ProfileException(
                "Access denied. Only patients with pending or rejected doctor applications can update their application.",
                HttpStatus.FORBIDDEN
            );
        }

        DoctorProfile profile = findDoctorByUserId(user.userId());
        
        // Verify the profile is in application state (not approved)
        if (profile.getApprovalStatus() == DoctorApprovalStatus.APPROVED) {
            throw new ProfileException(
                "Your doctor application has been approved. Please use the doctor profile endpoints.",
                HttpStatus.CONFLICT
            );
        }

        // Allow updates only for pending or rejected applications
        if (profile.getApprovalStatus() != DoctorApprovalStatus.PENDING && profile.getApprovalStatus() != DoctorApprovalStatus.REJECTED) {
            throw new ProfileException(
                "Can only update pending or rejected applications.",
                HttpStatus.CONFLICT
            );
        }

        applyDoctorProfileUpdates(profile, request);
        profile.setApprovalStatus(DoctorApprovalStatus.PENDING);
        profile.setRejectionReason(null);
        profile.setUpdatedBy(user.userId());
        DoctorProfile saved = doctorProfileRepository.save(profile);
        syncUserNameIfPresent(user.userId(), request.getFullName());
        return toDoctorDto(saved);
    }

    /**
     * Update Doctor Profile (after approval)
     * Access: DOCTOR with ACTIVE status
     */
    @Transactional
    public ProfileResponse.DoctorProfileDto updateMyDoctorProfile(
            AuthenticatedUser user,
            ProfileRequest.DoctorProfileUpdateRequest request
    ) {
        if (!user.canAccessDoctorProfile()) {
            throw new ProfileException(
                "Access denied. Only approved doctors can update the doctor profile. Current role: " + user.role() + ", status: " + user.status(),
                HttpStatus.FORBIDDEN
            );
        }

        DoctorProfile profile = findDoctorByUserId(user.userId());
        
        // Verify profile is approved
        if (profile.getApprovalStatus() != DoctorApprovalStatus.APPROVED) {
            throw new ProfileException(
                "Doctor profile update only allowed for approved doctors. Current status: " + profile.getApprovalStatus(),
                HttpStatus.CONFLICT
            );
        }

        applyDoctorProfileUpdates(profile, request);
        profile.setUpdatedBy(user.userId());
        DoctorProfile saved = doctorProfileRepository.save(profile);
        syncUserNameIfPresent(user.userId(), request.getFullName());
        return toDoctorDto(saved);
    }

    private void applyDoctorProfileUpdates(DoctorProfile profile, ProfileRequest.DoctorProfileUpdateRequest request) {
        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName().trim());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getSpecialization() != null) {
            profile.setSpecialization(request.getSpecialization().trim());
        }
        if (request.getQualifications() != null) {
            profile.setQualifications(request.getQualifications().trim());
        }
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getProfilePictureUrl() != null) {
            updateDoctorProfileImageUrl(profile, request.getProfilePictureUrl().trim());
        }
    }

    public List<ProfileResponse.DoctorProfileDto> getPendingDoctorRequests(AuthenticatedUser user) {
        requireRole(user, "ADMIN");
        return doctorProfileRepository.findByApprovalStatusAndIsDeletedFalse(DoctorApprovalStatus.PENDING)
                .stream()
                .map(this::toDoctorDto)
                .toList();
    }

        public List<ProfileResponse.ProfileOptionDto> getPatientOptions(AuthenticatedUser user) {
        if (user == null) {
            throw new ProfileException("Authentication required.", HttpStatus.UNAUTHORIZED);
        }

        return patientProfileRepository.findByIsDeletedFalse()
            .stream()
            .map(profile -> ProfileResponse.ProfileOptionDto.builder()
                .userId(profile.getUserId())
                .fullName(profile.getFullName() == null || profile.getFullName().isBlank()
                    ? "Unknown Patient"
                    : profile.getFullName().trim())
                .build())
            .sorted(Comparator.comparing(ProfileResponse.ProfileOptionDto::getFullName, String.CASE_INSENSITIVE_ORDER))
            .toList();
        }

        public List<ProfileResponse.ProfileOptionDto> getDoctorOptions(AuthenticatedUser user) {
        if (user == null) {
            throw new ProfileException("Authentication required.", HttpStatus.UNAUTHORIZED);
        }

        return doctorProfileRepository.findByIsDeletedFalse()
            .stream()
            .map(profile -> ProfileResponse.ProfileOptionDto.builder()
                .userId(profile.getUserId())
                .fullName(profile.getFullName() == null || profile.getFullName().isBlank()
                    ? "Unknown Doctor"
                    : profile.getFullName().trim())
                .build())
            .sorted(Comparator.comparing(ProfileResponse.ProfileOptionDto::getFullName, String.CASE_INSENSITIVE_ORDER))
            .toList();
        }

    public List<ProfileResponse.PatientProfileDto> getPatientProfilesBatch(List<Long> userIds) {
        return patientProfileRepository.findByUserIdInAndIsDeletedFalse(userIds)
                .stream()
                .map(this::toPatientDto)
                .toList();
    }

    public List<ProfileResponse.DoctorProfileDto> getDoctorProfilesBatch(List<Long> userIds) {
        return doctorProfileRepository.findByUserIdInAndIsDeletedFalse(userIds)
                .stream()
                .map(this::toDoctorDto)
                .toList();
    }

    private void requireRole(AuthenticatedUser user, String requiredRole) {
        if (user == null || !requiredRole.equalsIgnoreCase(user.role())) {
            throw new ProfileException("Access denied.", HttpStatus.FORBIDDEN);
        }
    }

    private void updatePatientProfileImageUrl(PatientProfile profile, String newImageUrl) {
        String normalizedUrl = newImageUrl == null ? null : newImageUrl.trim();
        deleteManagedImageIfReplaced(profile.getProfilePictureUrl(), normalizedUrl);
        profile.setProfilePictureUrl(normalizedUrl);
    }

    private void updateDoctorProfileImageUrl(DoctorProfile profile, String newImageUrl) {
        String normalizedUrl = newImageUrl == null ? null : newImageUrl.trim();
        deleteManagedImageIfReplaced(profile.getProfileImageUrl(), normalizedUrl);
        profile.setProfileImageUrl(normalizedUrl);
    }

    private void deleteManagedImageIfReplaced(String oldImageUrl, String newImageUrl) {
        if (oldImageUrl == null || oldImageUrl.isBlank()) {
            return;
        }
        if (oldImageUrl.equals(newImageUrl)) {
            return;
        }
        profileImageStorageService.deleteManagedProfileImage(oldImageUrl);
    }

    private void syncUserNameIfPresent(Long userId, String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return;
        }
        authRoleClient.syncUserName(userId, fullName.trim());
    }

    private ProfileResponse.ProfileInitResponse initializeProfileInternal(
            Long userId,
            String name,
            String roleValue,
            MultipartFile profileImage
    ) {
        String role = roleValue.trim().toUpperCase(Locale.ROOT);

        if ("PATIENT".equals(role)) {
            ensurePatientProfileSubmissionAllowed(userId);
            PatientProfile profile = patientProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                    .orElseGet(() -> PatientProfile.builder()
                            .userId(userId)
                            .isDeleted(false)
                            .build());

            String previousProfilePictureUrl = profile.getProfilePictureUrl();

            profile.setFullName(name.trim());
            profile.setUpdatedBy(userId);
            profile.setIsDeleted(false);

            if (profileImage != null) {
                String profilePictureUrl = profileImageStorageService.storePatientProfileImage(profileImage);
                deleteManagedImageIfReplaced(previousProfilePictureUrl, profilePictureUrl);
                profile.setProfilePictureUrl(profilePictureUrl);
            }

            profile = patientProfileRepository.save(profile);

            return ProfileResponse.ProfileInitResponse.builder()
                    .profileId("PATIENT-" + profile.getId())
                    .build();
        }

        return ProfileResponse.ProfileInitResponse.builder()
                .profileId(role + "-" + userId)
                .build();
    }

    private void ensurePatientProfileSubmissionAllowed(Long userId) {
        DoctorApprovalStatus doctorRequestStatus = doctorProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .map(DoctorProfile::getApprovalStatus)
                .orElse(null);

        if (doctorRequestStatus == DoctorApprovalStatus.PENDING || doctorRequestStatus == DoctorApprovalStatus.APPROVED) {
            throw new ProfileException(PATIENT_PROFILE_BLOCKED_MESSAGE, HttpStatus.CONFLICT);
        }
    }

    private void ensureDoctorUpgradeSubmissionAllowed(AuthenticatedUser user) {
        requireRole(user, "PATIENT");
        if (!user.canSubmitDoctorApplication()) {
            throw new ProfileException(
                    "Access denied. Only active or rejected patients can submit doctor applications.",
                    HttpStatus.FORBIDDEN
            );
        }
    }

    private PatientProfile findPatientByUserId(Long userId) {
        return patientProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ProfileException("Patient profile not found.", HttpStatus.NOT_FOUND));
    }

    private DoctorProfile findDoctorByUserId(Long userId) {
        return doctorProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ProfileException("Doctor profile not found.", HttpStatus.NOT_FOUND));
    }

    private ProfileResponse.PatientProfileDto toPatientDto(PatientProfile profile) {
        return ProfileResponse.PatientProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .address(profile.getAddress())
                .bloodGroup(profile.getBloodGroup())
                .gender(profile.getGender())
                .dob(profile.getDob())
                .profilePictureUrl(profile.getProfilePictureUrl())
                .basicHealthInfo(profile.getBasicHealthInfo())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private ProfileResponse.DoctorProfileDto toDoctorDto(DoctorProfile profile) {
        return ProfileResponse.DoctorProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .gender(profile.getGender())
                .specialization(profile.getSpecialization())
                .qualifications(profile.getQualifications())
                .experienceYears(profile.getExperienceYears())
                .profileImageUrl(profile.getProfileImageUrl())
                .approvalStatus(profile.getApprovalStatus())
                .rejectionReason(profile.getRejectionReason())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}


