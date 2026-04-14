package com.example.telemedicine_service.repository;

import com.example.telemedicine_service.entity.VideoSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoSessionRepository extends JpaRepository<VideoSession, Long> {
    Optional<VideoSession> findByAppointmentId(Long appointmentId);
    List<VideoSession> findByDoctorIdOrderByScheduledTimeDesc(Long doctorId);
    List<VideoSession> findByPatientIdOrderByScheduledTimeDesc(Long patientId);
}
