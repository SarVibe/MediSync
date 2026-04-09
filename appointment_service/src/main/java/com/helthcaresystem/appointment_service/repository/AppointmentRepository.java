package com.helthcaresystem.appointment_service.repository;

import com.helthcaresystem.appointment_service.model.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {


    // Find appointments for a specific doctor
    List<Appointment> findByDoctorId(Long doctorId);

    // Find appointments for a specific patient
    List<Appointment> findByPatientId(Long patientId);

    // Find appointments for a doctor on a specific day
    List<Appointment> findByDoctorIdAndScheduledAtBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

    boolean existsByDoctorIdAndScheduledAt(Long doctorId, LocalDateTime scheduledAt);

    boolean existsByDoctorIdAndScheduledAtAndIdNot(Long doctorId, LocalDateTime scheduledAt, Long id);

    Optional<Appointment> findByPaymentSessionId(String paymentSessionId);

    Optional<Appointment> findFirstByPatientIdAndDoctorIdAndScheduledAtAndStatus(Long patientId,
                                                                                Long doctorId,
                                                                                LocalDateTime scheduledAt,
                                                                                Appointment.Status status);
}
