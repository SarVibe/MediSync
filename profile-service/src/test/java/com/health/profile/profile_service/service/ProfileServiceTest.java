package com.health.profile.profile_service.service;

import com.health.profile.profile_service.client.AuthRoleClient;
import com.health.profile.profile_service.dto.ProfileRequest;
import com.health.profile.profile_service.dto.ProfileResponse;
import com.health.profile.profile_service.entity.DoctorApprovalStatus;
import com.health.profile.profile_service.entity.DoctorProfile;
import com.health.profile.profile_service.entity.Gender;
import com.health.profile.profile_service.entity.PatientProfile;
import com.health.profile.profile_service.exception.ProfileException;
import com.health.profile.profile_service.repository.DoctorProfileRepository;
import com.health.profile.profile_service.repository.PatientProfileRepository;
import com.health.profile.profile_service.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private PatientProfileRepository patientProfileRepository;

    @Mock
    private DoctorProfileRepository doctorProfileRepository;

    @Mock
    private AuthRoleClient authRoleClient;

    @Mock
    private ProfileImageStorageService profileImageStorageService;

    @InjectMocks
    private ProfileService profileService;

    @BeforeEach
    void setUpDefaults() {
        lenient().when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(anyLong())).thenReturn(Optional.empty());
        lenient().when(patientProfileRepository.findByUserIdAndIsDeletedFalse(anyLong())).thenReturn(Optional.empty());
    }

    @Test
    void initializeProfile_shouldCreatePatientWithImageWhenMultipartProvided() {
        ProfileRequest.InitProfileUploadRequest request = new ProfileRequest.InitProfileUploadRequest();
        request.setUserId(31L);
        request.setName("Patient One");
        request.setRole("PATIENT");
        request.setProfileImage(new MockMultipartFile(
                "profileImage",
                "patient.png",
                "image/png",
                "fake-image".getBytes(StandardCharsets.UTF_8)
        ));

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(31L)).thenReturn(Optional.empty());
        when(profileImageStorageService.storePatientProfileImage(any())).thenReturn("http://localhost:8083/uploads/patient.png");
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> {
            PatientProfile saved = invocation.getArgument(0);
            saved.setId(501L);
            return saved;
        });

        var response = profileService.initializeProfile(request);

        assertEquals("PATIENT-501", response.getProfileId());
        verify(profileImageStorageService).storePatientProfileImage(any());
        verify(patientProfileRepository).save(any(PatientProfile.class));
    }

    @Test
    void initializeProfile_shouldKeepJsonBehaviorWhenNoImageProvided() {
        ProfileRequest.InitProfileRequest request = new ProfileRequest.InitProfileRequest();
        request.setUserId(32L);
        request.setName("Patient Two");
        request.setRole("PATIENT");

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(32L)).thenReturn(Optional.empty());
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> {
            PatientProfile saved = invocation.getArgument(0);
            saved.setId(502L);
            return saved;
        });

        var response = profileService.initializeProfile(request);

        assertNotNull(response);
        assertEquals("PATIENT-502", response.getProfileId());
        verify(profileImageStorageService, never()).storePatientProfileImage(any());
    }

    @Test
    void uploadProfilePicture_shouldStoreAndReturnPublicUrl() {
        AuthenticatedUser user = new AuthenticatedUser(40L, "PATIENT", "ACTIVE", null, "token");
        MockMultipartFile file = new MockMultipartFile(
                "profileImage",
                "avatar.png",
                "image/png",
                "image-bytes".getBytes(StandardCharsets.UTF_8)
        );

        when(profileImageStorageService.storePatientProfileImage(file)).thenReturn("http://localhost:8083/uploads/avatar.png");

        String result = profileService.uploadProfilePicture(user, file);

        assertEquals("http://localhost:8083/uploads/avatar.png", result);
        verify(profileImageStorageService).storePatientProfileImage(file);
    }

    @Test
    void initializeProfile_shouldUpdateExistingPatientPictureWhenMultipartProvided() {
        ProfileRequest.InitProfileUploadRequest request = new ProfileRequest.InitProfileUploadRequest();
        request.setUserId(33L);
        request.setName("Patient Three Updated");
        request.setRole("PATIENT");
        request.setProfileImage(new MockMultipartFile(
                "profileImage",
                "patient-new.png",
                "image/png",
                "fake-image-new".getBytes(StandardCharsets.UTF_8)
        ));

        PatientProfile existing = PatientProfile.builder()
                .id(503L)
                .userId(33L)
                .fullName("Patient Three")
                .profilePictureUrl("http://localhost:8083/uploads/old.png")
                .isDeleted(false)
                .build();

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(33L)).thenReturn(Optional.of(existing));
        when(profileImageStorageService.storePatientProfileImage(any())).thenReturn("http://localhost:8083/uploads/new.png");
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = profileService.initializeProfile(request);

        assertEquals("PATIENT-503", response.getProfileId());
        assertEquals("Patient Three Updated", existing.getFullName());
        verify(profileImageStorageService).deleteManagedProfileImage("http://localhost:8083/uploads/old.png");
        verify(profileImageStorageService).storePatientProfileImage(any());
        verify(patientProfileRepository).save(any(PatientProfile.class));
    }

    @Test
    void initializeProfile_shouldUpdateExistingPatientNameWithoutImage() {
        ProfileRequest.InitProfileRequest request = new ProfileRequest.InitProfileRequest();
        request.setUserId(34L);
        request.setName("Renamed Patient");
        request.setRole("PATIENT");

        PatientProfile existing = PatientProfile.builder()
                .id(504L)
                .userId(34L)
                .fullName("Old Patient Name")
                .profilePictureUrl("http://localhost:8083/uploads/keep.png")
                .isDeleted(false)
                .build();

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(34L)).thenReturn(Optional.of(existing));
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = profileService.initializeProfile(request);

        assertEquals("PATIENT-504", response.getProfileId());
        assertEquals("Renamed Patient", existing.getFullName());
        assertEquals("http://localhost:8083/uploads/keep.png", existing.getProfilePictureUrl());
        verify(profileImageStorageService, never()).storePatientProfileImage(any());
        verify(patientProfileRepository).save(any(PatientProfile.class));
    }

    @Test
    void submitDoctorUpgradeRequest_shouldCreatePendingProfileAndNotifyAuth() {
        AuthenticatedUser user = new AuthenticatedUser(10L, "PATIENT", "ACTIVE", null, "token");

        ProfileRequest.DoctorUpgradeRequest request = new ProfileRequest.DoctorUpgradeRequest();
        request.setFullName("Dr Jane");
        request.setGender(Gender.FEMALE);
        request.setSpecialization("Cardiology");
        request.setQualifications("MBBS, MD");
        request.setExperienceYears(5);
        request.setProfilePictureUrl("https://img.example.com/dr-jane.png");

        when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(10L)).thenReturn(Optional.empty());
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenAnswer(invocation -> {
            DoctorProfile saved = invocation.getArgument(0);
            saved.setId(33L);
            return saved;
        });

        var response = profileService.submitDoctorUpgradeRequest(user, request);

        assertEquals(33L, response.getId());
        assertEquals(DoctorApprovalStatus.PENDING, response.getApprovalStatus());
        assertEquals("https://img.example.com/dr-jane.png", response.getProfileImageUrl());
        verify(authRoleClient).submitDoctorUpgradeRequest(10L);
    }

    @Test
    void submitDoctorUpgradeRequestWithUpload_shouldStoreImageAndPersistUrl() {
        AuthenticatedUser user = new AuthenticatedUser(15L, "PATIENT", "ACTIVE", null, "token");

        ProfileRequest.DoctorUpgradeUploadRequest request = new ProfileRequest.DoctorUpgradeUploadRequest();
        request.setFullName("Dr Alex");
        request.setGender(Gender.MALE);
        request.setSpecialization("Dermatology");
        request.setQualifications("MBBS, MD");
        request.setExperienceYears(7);
        request.setProfileImage(new MockMultipartFile(
                "profileImage",
                "doctor.png",
                "image/png",
                "fake-image".getBytes(StandardCharsets.UTF_8)
        ));

        when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(15L)).thenReturn(Optional.empty());
        when(profileImageStorageService.storeDoctorProfileImage(any())).thenReturn("http://localhost:8083/uploads/uuid.png");
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenAnswer(invocation -> {
            DoctorProfile saved = invocation.getArgument(0);
            saved.setId(44L);
            return saved;
        });

        var response = profileService.submitDoctorUpgradeRequest(user, request);

        assertEquals(44L, response.getId());
        assertEquals("http://localhost:8083/uploads/uuid.png", response.getProfileImageUrl());
        verify(profileImageStorageService).storeDoctorProfileImage(any());
        verify(authRoleClient).submitDoctorUpgradeRequest(15L);
    }

    @Test
    void updateMyPatientProfilePicture_shouldStoreImageAndPersistUrl() {
        AuthenticatedUser user = new AuthenticatedUser(21L, "PATIENT", "ACTIVE", null, "token");

        ProfileRequest.PatientProfilePictureUploadRequest request = new ProfileRequest.PatientProfilePictureUploadRequest();
        request.setProfileImage(new MockMultipartFile(
                "profileImage",
                "patient.jpg",
                "image/jpeg",
                "fake-image".getBytes(StandardCharsets.UTF_8)
        ));

        PatientProfile patientProfile = PatientProfile.builder()
                        .id(88L)
                        .userId(21L)
                        .fullName("Pat One")
                        .isDeleted(false)
                        .build();

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(21L)).thenReturn(Optional.of(patientProfile));
        when(profileImageStorageService.storePatientProfileImage(any())).thenReturn("http://localhost:8083/uploads/patient.jpg");
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = profileService.updateMyPatientProfilePicture(user, request);

        assertEquals("http://localhost:8083/uploads/patient.jpg", response.getProfilePictureUrl());
        verify(profileImageStorageService).storePatientProfileImage(any());
        verify(patientProfileRepository).save(any(PatientProfile.class));
    }

    @Test
    void updateMyPatientProfilePicture_shouldDeleteOldImageWhenReplacing() {
        AuthenticatedUser user = new AuthenticatedUser(23L, "PATIENT", "ACTIVE", null, "token");

        ProfileRequest.PatientProfilePictureUploadRequest request = new ProfileRequest.PatientProfilePictureUploadRequest();
        request.setProfileImage(new MockMultipartFile("profileImage", "new.jpg", "image/jpeg", new byte[]{1, 2}));

        PatientProfile patientProfile = PatientProfile.builder()
                .id(90L)
                .userId(23L)
                .profilePictureUrl("http://localhost:8083/uploads/old.jpg")
                .isDeleted(false)
                .build();

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(23L)).thenReturn(Optional.of(patientProfile));
        when(profileImageStorageService.storePatientProfileImage(any())).thenReturn("http://localhost:8083/uploads/new.jpg");
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        profileService.updateMyPatientProfilePicture(user, request);

        verify(profileImageStorageService).deleteManagedProfileImage("http://localhost:8083/uploads/old.jpg");
    }

    @Test
    void softDeleteMyPatientProfile_shouldDeleteStoredImage() {
        AuthenticatedUser user = new AuthenticatedUser(24L, "PATIENT", "ACTIVE", null, "token");

        PatientProfile patientProfile = PatientProfile.builder()
                .id(91L)
                .userId(24L)
                .profilePictureUrl("http://localhost:8083/uploads/remove.jpg")
                .isDeleted(false)
                .build();

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(24L)).thenReturn(Optional.of(patientProfile));
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        profileService.softDeleteMyPatientProfile(user);

        verify(profileImageStorageService).deleteManagedProfileImage("http://localhost:8083/uploads/remove.jpg");
        verify(patientProfileRepository).save(any(PatientProfile.class));
    }

    @Test
    void updateMyPatientProfilePicture_shouldFailWhenProfileMissing() {
        AuthenticatedUser user = new AuthenticatedUser(22L, "PATIENT", "ACTIVE", null, "token");
        ProfileRequest.PatientProfilePictureUploadRequest request = new ProfileRequest.PatientProfilePictureUploadRequest();
        request.setProfileImage(new MockMultipartFile("profileImage", "patient.png", "image/png", new byte[]{1}));

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(22L)).thenReturn(Optional.empty());

        ProfileException ex = assertThrows(ProfileException.class,
                () -> profileService.updateMyPatientProfilePicture(user, request));

        assertEquals("Patient profile not found.", ex.getMessage());
        verify(profileImageStorageService, never()).storePatientProfileImage(any());
    }

    @Test
    void submitDoctorUpgradeRequest_shouldFailWhenAlreadyPending() {
        AuthenticatedUser user = new AuthenticatedUser(12L, "PATIENT", "ACTIVE", null, "token");

        DoctorProfile existing = DoctorProfile.builder()
                .id(100L)
                .userId(12L)
                .approvalStatus(DoctorApprovalStatus.PENDING)
                .build();

        when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(12L)).thenReturn(Optional.of(existing));

        ProfileException ex = assertThrows(ProfileException.class,
                () -> profileService.submitDoctorUpgradeRequest(user, new ProfileRequest.DoctorUpgradeRequest()));

        assertEquals("Doctor upgrade request is already pending.", ex.getMessage());
        verify(authRoleClient, never()).submitDoctorUpgradeRequest(anyLong());
    }

    @Test
    void initializeProfile_shouldFailWhenDoctorUpgradeIsPending() {
        ProfileRequest.InitProfileRequest request = new ProfileRequest.InitProfileRequest();
        request.setUserId(60L);
        request.setName("Patient Blocked");
        request.setRole("PATIENT");

        DoctorProfile existingDoctorRequest = DoctorProfile.builder()
                .id(200L)
                .userId(60L)
                .approvalStatus(DoctorApprovalStatus.PENDING)
                .isDeleted(false)
                .build();

        when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(60L)).thenReturn(Optional.of(existingDoctorRequest));

        ProfileException ex = assertThrows(ProfileException.class, () -> profileService.initializeProfile(request));

        assertEquals("You cannot create a patient profile after requesting doctor upgrade.", ex.getMessage());
        verify(patientProfileRepository, never()).save(any(PatientProfile.class));
    }

    @Test
    void submitDoctorUpgradeRequest_shouldAllowWhenPatientProfileExists() {
        AuthenticatedUser user = new AuthenticatedUser(61L, "PATIENT", "ACTIVE", null, "token");

        ProfileRequest.DoctorUpgradeRequest request = new ProfileRequest.DoctorUpgradeRequest();
        request.setFullName("Dr Blocked");
        request.setGender(Gender.MALE);
        request.setSpecialization("Cardiology");
        request.setQualifications("MBBS");
        request.setExperienceYears(3);
        request.setProfilePictureUrl("https://img.example.com/dr-blocked.png");

        when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(61L)).thenReturn(Optional.empty());
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileResponse.DoctorProfileDto response = profileService.submitDoctorUpgradeRequest(user, request);

        assertEquals("Dr Blocked", response.getFullName());
        assertEquals(DoctorApprovalStatus.PENDING, response.getApprovalStatus());
        verify(doctorProfileRepository).save(any(DoctorProfile.class));
        verify(authRoleClient).submitDoctorUpgradeRequest(61L);
    }

    @Test
    void submitDoctorUpgradeRequestWithUpload_shouldDeletePreviousImageWhenReapplying() {
        AuthenticatedUser user = new AuthenticatedUser(30L, "PATIENT", "REJECTED", null, "token");

        ProfileRequest.DoctorUpgradeUploadRequest request = new ProfileRequest.DoctorUpgradeUploadRequest();
        request.setFullName("Dr Reapply");
        request.setGender(Gender.MALE);
        request.setSpecialization("Neurology");
        request.setQualifications("MBBS, MD");
        request.setExperienceYears(9);
        request.setProfileImage(new MockMultipartFile("profileImage", "new.png", "image/png", new byte[]{3, 4}));

        DoctorProfile existing = DoctorProfile.builder()
                .id(120L)
                .userId(30L)
                .approvalStatus(DoctorApprovalStatus.REJECTED)
                .profileImageUrl("http://localhost:8083/uploads/doctor-old.png")
                .isDeleted(false)
                .build();

        when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(30L)).thenReturn(Optional.of(existing));
        when(profileImageStorageService.storeDoctorProfileImage(any())).thenReturn("http://localhost:8083/uploads/doctor-new.png");
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        profileService.submitDoctorUpgradeRequest(user, request);

        verify(profileImageStorageService).deleteManagedProfileImage("http://localhost:8083/uploads/doctor-old.png");
    }

    @Test
    void upsertMyPatientProfile_shouldSyncUserNameWhenFullNameProvided() {
        AuthenticatedUser user = new AuthenticatedUser(41L, "PATIENT", "ACTIVE", null, "token");

        ProfileRequest.PatientProfileUpsertRequest request = new ProfileRequest.PatientProfileUpsertRequest();
        request.setFullName("  Patient Renamed  ");

        when(patientProfileRepository.findByUserIdAndIsDeletedFalse(41L)).thenReturn(Optional.empty());
        when(patientProfileRepository.save(any(PatientProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        profileService.upsertMyPatientProfile(user, request);

        verify(authRoleClient).syncUserName(41L, "Patient Renamed");
    }

    @Test
    void updateMyDoctorProfile_shouldSyncUserNameWhenFullNameProvided() {
        AuthenticatedUser user = new AuthenticatedUser(42L, "DOCTOR", "ACTIVE", null, "token");

        DoctorProfile existing = DoctorProfile.builder()
                .id(121L)
                .userId(42L)
                .fullName("Old Doctor")
                .approvalStatus(DoctorApprovalStatus.APPROVED)
                .isDeleted(false)
                .build();

        ProfileRequest.DoctorProfileUpdateRequest request = new ProfileRequest.DoctorProfileUpdateRequest();
        request.setFullName("  Dr New Name  ");

        when(doctorProfileRepository.findByUserIdAndIsDeletedFalse(42L)).thenReturn(Optional.of(existing));
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        profileService.updateMyDoctorProfile(user, request);

        verify(authRoleClient).syncUserName(42L, "Dr New Name");
    }
}

