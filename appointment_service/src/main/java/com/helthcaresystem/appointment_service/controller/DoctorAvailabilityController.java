package com.helthcaresystem.appointment_service.controller;

import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import com.helthcaresystem.appointment_service.service.DoctorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors/availability")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;

    // Add a new availability slot
    @PostMapping
    public ResponseEntity<DoctorAvailability> addAvailability(@RequestBody DoctorAvailability slot) {
        return ResponseEntity.ok(doctorAvailabilityService.addAvailability(slot));
    }

    // Get all slots for a doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorAvailability>> getDoctorSlots(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorAvailabilityService.getDoctorSlots(doctorId));
    }

    // Get available slots for a doctor on a specific day
    @GetMapping("/doctor/{doctorId}/day/{dayOfWeek}")
    public ResponseEntity<List<DoctorAvailability>> getAvailableSlots(
            @PathVariable Long doctorId,
            @PathVariable String dayOfWeek
    ) {
        return ResponseEntity.ok(doctorAvailabilityService.getAvailableSlots(doctorId, dayOfWeek));
    }

    // Update a slot
    @PutMapping("/{slotId}")
    public ResponseEntity<DoctorAvailability> updateSlot(@PathVariable Long slotId, @RequestBody DoctorAvailability slot) {
        slot.setId(slotId);
        return ResponseEntity.ok(doctorAvailabilityService.updateAvailability(slot));
    }

    // Delete a slot
    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long slotId) {
        doctorAvailabilityService.deleteAvailability(slotId);
        return ResponseEntity.ok().build();
    }
}