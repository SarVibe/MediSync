package com.example.telemedicine_service.repository;

import com.example.telemedicine_service.entity.TeleSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeleSessionRepository extends JpaRepository<TeleSession, Long> {
    Optional<TeleSession> findByAppointmentId(Long appointmentId);
}
