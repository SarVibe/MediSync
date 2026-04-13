package com.health.profile.profile_service.controller;

import com.health.profile.profile_service.dto.ApiResponse;
import com.health.profile.profile_service.dto.ProfileRequest;
import com.health.profile.profile_service.dto.ProfileResponse;
import com.health.profile.profile_service.exception.ProfileException;
import com.health.profile.profile_service.security.AuthenticatedUser;
import com.health.profile.profile_service.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/init")
    public ResponseEntity<ApiResponse<ProfileResponse.ProfileInitResponse>> initProfile(
            @Valid @RequestBody ProfileRequest.InitProfileRequest request
    ) {
        ProfileResponse.ProfileInitResponse data = profileService.initializeProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile initialized.", data));
    }

    @PostMapping(value = "/init", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProfileResponse.ProfileInitResponse>> initProfileWithImage(
            @Valid @ModelAttribute ProfileRequest.InitProfileUploadRequest request
    ) {
        ProfileResponse.ProfileInitResponse data = profileService.initializeProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile initialized.", data));
    }

    @PostMapping("/status-update")
    public ResponseEntity<ApiResponse<Void>> updateDoctorStatus(
            @Valid @RequestBody ProfileRequest.DoctorStatusUpdateRequest request
    ) {
        profileService.updateDoctorApprovalStatus(request);
        return ResponseEntity.ok(ApiResponse.success("Doctor status updated."));
    }

    @GetMapping("/patient/me")
    public ResponseEntity<ApiResponse<ProfileResponse.PatientProfileDto>> getMyPatientProfile(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Patient profile fetched.",
                profileService.getMyPatientProfile(requirePrincipal(principal))));
    }

    @PutMapping("/patient/me")
    public ResponseEntity<ApiResponse<ProfileResponse.PatientProfileDto>> upsertMyPatientProfile(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody ProfileRequest.PatientProfileUpsertRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Patient profile updated.",
                profileService.upsertMyPatientProfile(requirePrincipal(principal), request)));
    }

    @PostMapping(value = "/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadProfilePicture(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestPart("profileImage") MultipartFile profileImage
    ) {
        return ResponseEntity.ok(ApiResponse.success("Profile picture uploaded.",
                profileService.uploadProfilePicture(requirePrincipal(principal), profileImage)));
    }

    @PostMapping(value = "/patient/me/profile-picture", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProfileResponse.PatientProfileDto>> uploadMyPatientProfilePicture(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @ModelAttribute ProfileRequest.PatientProfilePictureUploadRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Patient profile picture uploaded.",
                profileService.updateMyPatientProfilePicture(requirePrincipal(principal), request)));
    }

    @DeleteMapping("/patient/me")
    public ResponseEntity<ApiResponse<Void>> deleteMyPatientProfile(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        profileService.softDeleteMyPatientProfile(requirePrincipal(principal));
        return ResponseEntity.ok(ApiResponse.success("Patient profile deleted."));
    }

    @PostMapping("/doctor/upgrade-request")
    public ResponseEntity<ApiResponse<ProfileResponse.DoctorProfileDto>> submitDoctorUpgradeRequest(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody ProfileRequest.DoctorUpgradeRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor upgrade request submitted.",
                        profileService.submitDoctorUpgradeRequest(requirePrincipal(principal), request)));
    }

    @GetMapping("/doctor/application")
    public ResponseEntity<ApiResponse<ProfileResponse.DoctorProfileDto>> getMyDoctorApplication(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Doctor application fetched.",
                profileService.getMyDoctorApplication(requirePrincipal(principal))));
    }

    @PutMapping("/doctor/application")
    public ResponseEntity<ApiResponse<ProfileResponse.DoctorProfileDto>> updateMyDoctorApplication(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody ProfileRequest.DoctorProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Doctor application updated.",
                profileService.updateMyDoctorApplication(requirePrincipal(principal), request)));
    }

    @GetMapping("/doctor/me")
    public ResponseEntity<ApiResponse<ProfileResponse.DoctorProfileDto>> getMyDoctorProfile(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Doctor profile fetched.",
                profileService.getMyDoctorProfile(requirePrincipal(principal))));
    }

    @PutMapping("/doctor/me")
    public ResponseEntity<ApiResponse<ProfileResponse.DoctorProfileDto>> updateMyDoctorProfile(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody ProfileRequest.DoctorProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Doctor profile updated.",
                profileService.updateMyDoctorProfile(requirePrincipal(principal), request)));
    }

    @GetMapping("/doctor/pending")
    public ResponseEntity<ApiResponse<List<ProfileResponse.DoctorProfileDto>>> pendingDoctorRequests(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Pending doctor requests fetched.",
                profileService.getPendingDoctorRequests(requirePrincipal(principal))));
    }

    @GetMapping("/patients/options")
    public ResponseEntity<ApiResponse<List<ProfileResponse.ProfileOptionDto>>> getPatientOptions(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Patient options fetched.",
                profileService.getPatientOptions(requirePrincipal(principal))));
    }

    @GetMapping("/doctors/options")
    public ResponseEntity<ApiResponse<List<ProfileResponse.ProfileOptionDto>>> getDoctorOptions(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Doctor options fetched.",
                profileService.getDoctorOptions(requirePrincipal(principal))));
    }

    @GetMapping("/doctors/public")
    public ResponseEntity<ApiResponse<List<ProfileResponse.DoctorPublicSummaryDto>>> getDoctorPublicSummaries(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Doctor summaries fetched.",
                profileService.getDoctorPublicSummaries(requirePrincipal(principal))));
    }

    private AuthenticatedUser requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new ProfileException("Authentication required.", HttpStatus.UNAUTHORIZED);
        }
        return principal;
    }
}

