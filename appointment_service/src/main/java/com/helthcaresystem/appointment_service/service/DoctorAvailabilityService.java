package com.helthcaresystem.appointment_service.service;

import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import com.helthcaresystem.appointment_service.repository.DoctorAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    // Add a new availability slot
    public DoctorAvailability addAvailability(DoctorAvailability slot) {
        return doctorAvailabilityRepository.save(slot);
    }

    // Get all slots for a doctor
    public List<DoctorAvailability> getDoctorSlots(Long doctorId) {
        return doctorAvailabilityRepository.findByDoctorId(doctorId);
    }

    // Get available slots for a doctor on a specific day
    public List<DoctorAvailability> getAvailableSlots(Long doctorId, String dayOfWeek) {
        return doctorAvailabilityRepository.findByDoctorIdAndDayOfWeekAndStatus(
                doctorId, dayOfWeek, DoctorAvailability.Status.AVAILABLE
        );
    }

    // Update a slot
    public DoctorAvailability updateAvailability(DoctorAvailability slot) {
        return doctorAvailabilityRepository.save(slot);
    }

    // Delete a slot
    public void deleteAvailability(Long slotId) {
        doctorAvailabilityRepository.deleteById(slotId);
    }

    // Optional: find slot by I
    public Optional<DoctorAvailability> findById(Long id) {
        return doctorAvailabilityRepository.findById(id);
    }
}