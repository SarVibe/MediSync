package com.helthcaresystem.appointment_service.repository;

import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    // Find availability for a specific doctor
    List<DoctorAvailability> findByDoctorId(Long doctorId);

    // Find available slots for a specific day
    List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndStatus(Long doctorId, String dayOfWeek, DoctorAvailability.Status status);
}