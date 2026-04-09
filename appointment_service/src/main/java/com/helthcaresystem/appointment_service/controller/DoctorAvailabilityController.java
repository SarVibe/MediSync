package com.helthcaresystem.appointment_service.controller;

import com.helthcaresystem.appointment_service.dto.AvailabilityRequest;
import com.helthcaresystem.appointment_service.dto.AvailabilityResponse;
import com.helthcaresystem.appointment_service.dto.AvailabilityConfigRequest;
import com.helthcaresystem.appointment_service.dto.AvailabilityConfigResponse;
import com.helthcaresystem.appointment_service.dto.AvailabilityDateOverrideRequest;
import com.helthcaresystem.appointment_service.dto.AvailabilityDateOverrideResponse;
import com.helthcaresystem.appointment_service.dto.AvailabilityDayResponse;
import com.helthcaresystem.appointment_service.dto.DoctorSummaryResponse;
import com.helthcaresystem.appointment_service.security.AuthenticatedUser;
import com.helthcaresystem.appointment_service.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;

    @GetMapping
    public ResponseEntity<List<DoctorSummaryResponse>> getAvailableDoctors(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String specialization,
            HttpServletRequest request) {
        return ResponseEntity.ok(doctorAvailabilityService.getAvailableDoctors(
                q,
                specialization,
                request.getHeader("Authorization")
        ));
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorSummaryResponse> getDoctorById(@PathVariable Long doctorId,
                                                               HttpServletRequest request) {
        return ResponseEntity.ok(doctorAvailabilityService.getDoctorSummary(
                doctorId,
                request.getHeader("Authorization")
        ));
    }

    @PostMapping("/availability")
    public ResponseEntity<AvailabilityResponse> addAvailability(@Valid @RequestBody AvailabilityRequest request,
                                                                @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(AvailabilityResponse.fromEntity(
                doctorAvailabilityService.addAvailability(request, user)
        ));
    }

    @GetMapping("/availability/me")
    public ResponseEntity<List<AvailabilityResponse>> getMyDoctorSlots(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(doctorAvailabilityService.getDoctorSlots(user.userId(), user).stream()
                .map(AvailabilityResponse::fromEntity)
                .toList());
    }

    @GetMapping("/availability/config/me")
    public ResponseEntity<AvailabilityConfigResponse> getMyAvailabilityConfig(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(doctorAvailabilityService.getAvailabilityConfig(user.userId(), user));
    }

    @PutMapping("/availability/config")
    public ResponseEntity<AvailabilityConfigResponse> updateWeeklyAvailability(@RequestBody AvailabilityConfigRequest request,
                                                                               @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(doctorAvailabilityService.updateWeeklyAvailability(request, user));
    }

    @PutMapping("/availability/override")
    public ResponseEntity<AvailabilityDateOverrideResponse> upsertDateOverride(@Valid @RequestBody AvailabilityDateOverrideRequest request,
                                                                               @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(doctorAvailabilityService.upsertDateOverride(request, user));
    }

    @DeleteMapping("/availability/override/{date}")
    public ResponseEntity<Void> deleteDateOverride(@PathVariable String date,
                                                   @AuthenticationPrincipal AuthenticatedUser user) {
        doctorAvailabilityService.deleteDateOverride(user.userId(), LocalDate.parse(date), user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/availability/doctor/{doctorId}")
    public ResponseEntity<List<AvailabilityResponse>> getDoctorSlots(@PathVariable Long doctorId,
                                                                     @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(doctorAvailabilityService.getDoctorSlots(doctorId, user).stream()
                .map(AvailabilityResponse::fromEntity)
                .toList());
    }

    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<AvailabilityDayResponse> getAvailableSlots(@PathVariable Long doctorId,
                                                                     @RequestParam(required = false) String date) {
        LocalDate requestedDate = date == null ? LocalDate.now() : LocalDate.parse(date);
        return ResponseEntity.ok(doctorAvailabilityService.getAvailabilityForDate(doctorId, requestedDate));
    }

    @PutMapping("/availability/{slotId}")
    public ResponseEntity<AvailabilityResponse> updateSlot(@PathVariable Long slotId,
                                                           @RequestBody AvailabilityRequest request,
                                                           @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(AvailabilityResponse.fromEntity(
                doctorAvailabilityService.updateAvailability(slotId, request, user)
        ));
    }

    @DeleteMapping("/availability/{slotId}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long slotId,
                                           @AuthenticationPrincipal AuthenticatedUser user) {
        doctorAvailabilityService.deleteAvailability(slotId, user);
        return ResponseEntity.ok().build();
    }
}
