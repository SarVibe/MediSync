package com.health.auth.auth_service.controller;

import com.health.auth.auth_service.dto.AuthResponse.ApiResponse;
import com.health.auth.auth_service.dto.InternalRequest;
import com.health.auth.auth_service.exception.AuthException;
import com.health.auth.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/internal")
@RequiredArgsConstructor
public class InternalController {

    private final AuthService authService;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    @PostMapping("/doctor-upgrade-request")
    public ResponseEntity<ApiResponse<Void>> doctorUpgradeRequest(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String apiKey,
            @Valid @RequestBody InternalRequest.DoctorUpgradeRequest request
    ) {
        if (apiKey == null || !apiKey.equals(internalApiKey)) {
            throw new AuthException("Invalid internal API key.", HttpStatus.UNAUTHORIZED);
        }

        authService.requestDoctorUpgrade(request.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Doctor upgrade request recorded."));
    }

    @PostMapping("/sync-user-name")
    public ResponseEntity<ApiResponse<Void>> syncUserName(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String apiKey,
            @Valid @RequestBody InternalRequest.SyncUserNameRequest request
    ) {
        if (apiKey == null || !apiKey.equals(internalApiKey)) {
            throw new AuthException("Invalid internal API key.", HttpStatus.UNAUTHORIZED);
        }

        authService.syncUserName(request.getUserId(), request.getName());
        return ResponseEntity.ok(ApiResponse.success("User name synced."));
    }

    @PostMapping("/sync-profile-completion")
    public ResponseEntity<ApiResponse<Void>> syncProfileCompletion(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String apiKey,
            @Valid @RequestBody InternalRequest.SyncProfileCompletionRequest request
    ) {
        if (apiKey == null || !apiKey.equals(internalApiKey)) {
            throw new AuthException("Invalid internal API key.", HttpStatus.UNAUTHORIZED);
        }

        authService.syncProfileCompletion(request.getUserId(), request.getIsProfileCompleted());
        return ResponseEntity.ok(ApiResponse.success("User profile completion synced."));
    }

    @PostMapping("/users/contact-options")
    public ResponseEntity<ApiResponse<?>> getUserContacts(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String apiKey,
            @Valid @RequestBody InternalRequest.UserContactsRequest request
    ) {
        if (apiKey == null || !apiKey.equals(internalApiKey)) {
            throw new AuthException("Invalid internal API key.", HttpStatus.UNAUTHORIZED);
        }

        return ResponseEntity.ok(ApiResponse.success(
                "User contact options fetched.",
                authService.getUserContacts(request.getUserIds())
        ));
    }

    @GetMapping("/admins/contact-options")
    public ResponseEntity<ApiResponse<?>> getAdminContacts(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String apiKey
    ) {
        if (apiKey == null || !apiKey.equals(internalApiKey)) {
            throw new AuthException("Invalid internal API key.", HttpStatus.UNAUTHORIZED);
        }

        return ResponseEntity.ok(ApiResponse.success(
                "Admin contact options fetched.",
                authService.getAdminContacts()
        ));
    }
}

