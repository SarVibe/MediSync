package com.health.profile.profile_service.controller;

import com.health.profile.profile_service.dto.ApiResponse;
import com.health.profile.profile_service.dto.ProfileResponse;
import com.health.profile.profile_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {

    private final ProfileService profileService;

    @PostMapping("/patients/batch")
    public ResponseEntity<ApiResponse<List<ProfileResponse.PatientProfileDto>>> getPatientProfilesBatch(
            @RequestBody List<Long> userIds) {
        return ResponseEntity.ok(ApiResponse.success("Patient profiles fetched.",
                profileService.getPatientProfilesBatch(userIds)));
    }

    @PostMapping("/doctors/batch")
    public ResponseEntity<ApiResponse<List<ProfileResponse.DoctorProfileDto>>> getDoctorProfilesBatch(
            @RequestBody List<Long> userIds) {
        return ResponseEntity.ok(ApiResponse.success("Doctor profiles fetched.",
                profileService.getDoctorProfilesBatch(userIds)));
    }
}
