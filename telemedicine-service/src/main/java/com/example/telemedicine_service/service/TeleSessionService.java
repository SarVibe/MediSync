package com.example.telemedicine_service.service;


import com.example.telemedicine_service.dto.SessionDto;
import com.example.telemedicine_service.entity.TeleSession;
import com.example.telemedicine_service.repository.TeleSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeleSessionService {

    private final TeleSessionRepository sessionRepository;

    // ── Create session (called by Appointment Service on approve) ──────────────
    public SessionDto.Response createSession(Long appointmentId,
                                             SessionDto.CreateRequest req) {
        // Idempotent — return existing session if already created
        return sessionRepository.findByAppointmentId(appointmentId)
                .map(this::toResponse)
                .orElseGet(() -> {
                    String meetingLink = "https://meet.jit.si/healthcare-appointment-" + appointmentId;

                    TeleSession session = TeleSession.builder()
                            .appointmentId(appointmentId)
                            .doctorId(req.getDoctorId())
                            .patientId(req.getPatientId())
                            .meetingLink(meetingLink)
                            .build();

                    return toResponse(sessionRepository.save(session));
                });
    }

    // ── Get session by appointment ID ──────────────────────────────────────────
    public SessionDto.Response getByAppointmentId(Long appointmentId) {
        TeleSession session = sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No session found for appointment: " + appointmentId));
        return toResponse(session);
    }

    private SessionDto.Response toResponse(TeleSession s) {
        return SessionDto.Response.builder()
                .sessionId(s.getSessionId())
                .appointmentId(s.getAppointmentId())
                .doctorId(s.getDoctorId())
                .patientId(s.getPatientId())
                .meetingLink(s.getMeetingLink())
                .status(s.getStatus().name())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
