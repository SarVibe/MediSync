package com.health.auth.auth_service.controller;


import com.health.auth.auth_service.dto.RegisterRequest.*;
import com.health.auth.auth_service.dto.AuthResponse.*;
import com.health.auth.auth_service.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── POST /auth/admin/create-user ──────────────────────────────────────────
    @PostMapping("/create-user")
    public ResponseEntity<ApiResponse<Void>> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        adminService.createUser(
                request.getEmail(),
                request.getPhone(),
                request.getName(),
                request.getRole(),
                request.getTemporaryPassword()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "User created successfully. They must change their password on first login."));
    }

    // ── POST /auth/admin/block/{userId} ───────────────────────────────────────
    @PostMapping("/block/{userId}")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @PathVariable Long userId,
            @RequestBody(required = false) BlockUserRequest request) {

        adminService.blockUser(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "User " + userId + " has been blocked and all active sessions revoked."));
    }

    // ── POST /auth/admin/unblock/{userId} ─────────────────────────────────────
    @PostMapping("/unblock/{userId}")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @PathVariable Long userId) {

        adminService.unblockUser(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "User " + userId + " has been unblocked."));
    }

    // ── POST /auth/admin/approve-doctor/{userId} ──────────────────────────────
    @PostMapping("/approve-doctor/{userId}")
    public ResponseEntity<ApiResponse<Void>> approveDoctor(
            @PathVariable Long userId) {

        adminService.approveDoctor(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "Doctor " + userId + " has been approved. They can now login."));
    }

    // ── POST /auth/admin/reject-doctor/{userId} ───────────────────────────────
    @PostMapping("/reject-doctor/{userId}")
    public ResponseEntity<ApiResponse<Void>> rejectDoctor(
            @PathVariable Long userId,
            @Valid @RequestBody RejectDoctorRequest request) {

        adminService.rejectDoctor(userId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(
                "Doctor " + userId + " registration has been rejected."));
    }
}
