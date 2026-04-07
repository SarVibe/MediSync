package com.helthcaresystem.appointment_service.repository;

import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorId(Long doctorId);

    List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndStatus(Long doctorId, String dayOfWeek, DoctorAvailability.Status status);

    List<DoctorAvailability> findByStatus(DoctorAvailability.Status status);

    List<DoctorAvailability> findByDoctorIdAndSpecificDate(Long doctorId, LocalDate specificDate);

    List<DoctorAvailability> findByDoctorIdAndSpecificDateIsNull(Long doctorId);

    void deleteByDoctorIdAndSpecificDateIsNull(Long doctorId);

    void deleteByDoctorIdAndSpecificDate(Long doctorId, LocalDate specificDate);
}
