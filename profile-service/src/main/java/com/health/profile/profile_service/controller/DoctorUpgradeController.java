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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class DoctorUpgradeController {

    private final ProfileService profileService;

    @PostMapping(value = "/api/doctor-upgrade/upload-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileResponse.DoctorProfileDto>> uploadDoctorProfileImage(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @ModelAttribute ProfileRequest.DoctorUpgradeUploadRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor profile image uploaded.",
                        profileService.submitDoctorUpgradeRequest(requirePrincipal(principal), request)));
    }

    private AuthenticatedUser requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new ProfileException("Authentication required.", HttpStatus.UNAUTHORIZED);
        }
        return principal;
    }
}

