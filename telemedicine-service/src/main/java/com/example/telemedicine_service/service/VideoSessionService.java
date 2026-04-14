package com.example.telemedicine_service.service;

import com.example.telemedicine_service.client.AppointmentClient;
import com.example.telemedicine_service.client.AuthInternalClient;
import com.example.telemedicine_service.client.NotificationClient;
import com.example.telemedicine_service.client.ProfileClient;
import com.example.telemedicine_service.dto.VideoSessionDtos;
import com.example.telemedicine_service.entity.VideoSession;
import com.example.telemedicine_service.entity.VideoSessionStatus;
import com.example.telemedicine_service.exception.ApiException;
import com.example.telemedicine_service.repository.VideoSessionRepository;
import com.example.telemedicine_service.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoSessionService {

    private static final String JITSI_BASE_URL = "https://meet.jit.si/";
    private static final List<String> ELIGIBLE_APPOINTMENT_STATUSES = List.of("BOOKED", "ACCEPTED");

    private final VideoSessionRepository videoSessionRepository;
    private final AppointmentClient appointmentClient;
    private final AuthInternalClient authInternalClient;
    private final NotificationClient notificationClient;
    private final ProfileClient profileClient;

    @Value("${telemedicine.join-window-minutes:10}")
    private long joinWindowMinutes;

    @Value("${telemedicine.complete-appointment-on-end:true}")
    private boolean completeAppointmentOnEnd;

    @Transactional
    public VideoSessionDtos.VideoSessionResponse createSession(VideoSessionDtos.CreateSessionRequest request,
                                                               AuthenticatedUser user,
                                                               String authHeader) {
        AppointmentClient.AppointmentData appointment = appointmentClient.getAppointmentById(authHeader, request.getAppointmentId());
        ensureParticipantAccess(appointment, user);
        validateEligibleAppointmentStatus(appointment.getStatus());

        boolean created = false;
        VideoSession session = videoSessionRepository.findByAppointmentId(request.getAppointmentId()).orElse(null);
        if (session == null) {
            String roomId = generateRoomId(request.getAppointmentId());
            session = VideoSession.builder()
                    .appointmentId(appointment.getId())
                    .doctorId(appointment.getDoctorId())
                    .patientId(appointment.getPatientId())
                    .roomId(roomId)
                    .meetingLink(JITSI_BASE_URL + roomId)
                    .status(VideoSessionStatus.SCHEDULED)
                    .scheduledTime(appointment.getScheduledAt())
                    .build();
            session = videoSessionRepository.save(session);
            created = true;
        } else {
            session = syncSessionWithAppointment(session, appointment);
        }

        if (created) {
            sendMeetingNotifications(session, authHeader);
        }
        return toResponse(session, authHeader);
    }

    @Transactional
    public VideoSessionDtos.JoinSessionResponse joinSession(VideoSessionDtos.JoinSessionRequest request,
                                                            AuthenticatedUser user,
                                                            String authHeader) {
        VideoSession session = getSessionOrThrow(request.getAppointmentId());
        AppointmentClient.AppointmentData appointment = appointmentClient.getAppointmentById(authHeader, request.getAppointmentId());
        ensureParticipantAccess(appointment, user);
        validateEligibleAppointmentStatus(appointment.getStatus());
        session = syncSessionWithAppointment(session, appointment);

        if (session.getStatus() == VideoSessionStatus.COMPLETED || session.getStatus() == VideoSessionStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "This video session is no longer available.");
        }

        LocalDateTime joinWindowStartsAt = session.getScheduledTime().minusMinutes(joinWindowMinutes);
        if (LocalDateTime.now().isBefore(joinWindowStartsAt)) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You can join only " + joinWindowMinutes + " minutes before the appointment time."
            );
        }

        if (session.getStartedAt() == null) {
            session.setStartedAt(LocalDateTime.now());
        }
        session.setStatus(VideoSessionStatus.ACTIVE);
        VideoSession saved = videoSessionRepository.save(session);

        return VideoSessionDtos.JoinSessionResponse.builder()
                .session(toResponse(saved, authHeader))
                .joinAllowed(true)
                .joinWindowStartsAt(joinWindowStartsAt)
                .build();
    }

    @Transactional
    public VideoSessionDtos.VideoSessionResponse endSession(VideoSessionDtos.EndSessionRequest request,
                                                            AuthenticatedUser user,
                                                            String authHeader) {
        VideoSession session = getSessionOrThrow(request.getAppointmentId());
        AppointmentClient.AppointmentData appointment = appointmentClient.getAppointmentById(authHeader, request.getAppointmentId());
        ensureParticipantAccess(appointment, user);
        session = syncSessionWithAppointment(session, appointment);

        VideoSessionStatus finalStatus = request.getFinalStatus() == null
                ? VideoSessionStatus.COMPLETED
                : request.getFinalStatus();

        if (finalStatus != VideoSessionStatus.COMPLETED && finalStatus != VideoSessionStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Session can only be ended as COMPLETED or CANCELLED.");
        }

        if (session.getStatus() == VideoSessionStatus.COMPLETED || session.getStatus() == VideoSessionStatus.CANCELLED) {
            return toResponse(session, authHeader);
        }

        if (session.getStartedAt() == null && finalStatus == VideoSessionStatus.COMPLETED) {
            session.setStartedAt(LocalDateTime.now());
        }

        session.setStatus(finalStatus);
        session.setEndedAt(LocalDateTime.now());
        VideoSession saved = videoSessionRepository.save(session);

        if (completeAppointmentOnEnd && finalStatus == VideoSessionStatus.COMPLETED && (user.hasRole("DOCTOR") || user.hasRole("ADMIN"))) {
            try {
                appointmentClient.updateAppointmentStatus(authHeader, appointment.getId(), "COMPLETED", null);
            } catch (Exception ignored) {
                // Keep telemedicine flow non-blocking if appointment status sync fails.
            }
        }

        return toResponse(saved, authHeader);
    }

    @Transactional(readOnly = true)
    public VideoSessionDtos.VideoSessionResponse getByAppointmentId(Long appointmentId,
                                                                    AuthenticatedUser user,
                                                                    String authHeader) {
        VideoSession session = getSessionOrThrow(appointmentId);
        AppointmentClient.AppointmentData appointment = appointmentClient.getAppointmentById(authHeader, appointmentId);
        ensureParticipantAccess(appointment, user);
        session = syncSessionWithAppointment(session, appointment);
        return toResponse(session, authHeader);
    }

    @Transactional(readOnly = true)
    public List<VideoSessionDtos.VideoSessionResponse> getDoctorSessions(Long doctorId,
                                                                         AuthenticatedUser user,
                                                                         String authHeader) {
        if (user.hasRole("DOCTOR") && !doctorId.equals(user.userId())) {
            throw new AccessDeniedException("You can only access your own doctor sessions.");
        }
        if (!user.hasRole("DOCTOR") && !user.hasRole("ADMIN")) {
            throw new AccessDeniedException("You are not allowed to access doctor sessions.");
        }
        Map<Long, String> doctorNames = profileClient.getDoctorNames(authHeader);
        Map<Long, String> patientNames = profileClient.getPatientNames(authHeader);
        return videoSessionRepository.findByDoctorIdOrderByScheduledTimeDesc(doctorId).stream()
                .map(session -> toResponse(session, doctorNames, patientNames))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VideoSessionDtos.VideoSessionResponse> getPatientSessions(Long patientId,
                                                                          AuthenticatedUser user,
                                                                          String authHeader) {
        if (user.hasRole("PATIENT") && !patientId.equals(user.userId())) {
            throw new AccessDeniedException("You can only access your own patient sessions.");
        }
        if (!user.hasRole("PATIENT") && !user.hasRole("ADMIN")) {
            throw new AccessDeniedException("You are not allowed to access patient sessions.");
        }
        Map<Long, String> doctorNames = profileClient.getDoctorNames(authHeader);
        Map<Long, String> patientNames = profileClient.getPatientNames(authHeader);
        return videoSessionRepository.findByPatientIdOrderByScheduledTimeDesc(patientId).stream()
                .map(session -> toResponse(session, doctorNames, patientNames))
                .toList();
    }

    private VideoSession getSessionOrThrow(Long appointmentId) {
        return videoSessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Video session not found for appointment."));
    }

    private void ensureParticipantAccess(AppointmentClient.AppointmentData appointment, AuthenticatedUser user) {
        if (user.hasRole("ADMIN")) {
            return;
        }
        boolean doctorMatch = user.hasRole("DOCTOR") && appointment.getDoctorId().equals(user.userId());
        boolean patientMatch = user.hasRole("PATIENT") && appointment.getPatientId().equals(user.userId());
        if (!doctorMatch && !patientMatch) {
            throw new AccessDeniedException("Only the doctor or patient of this appointment can access the video session.");
        }
    }

    private void validateEligibleAppointmentStatus(String appointmentStatus) {
        if (appointmentStatus == null || ELIGIBLE_APPOINTMENT_STATUSES.stream().noneMatch(status -> status.equalsIgnoreCase(appointmentStatus))) {
            throw new ApiException(HttpStatus.CONFLICT, "Video sessions can only be created or joined for BOOKED or ACCEPTED appointments.");
        }
    }

    private String generateRoomId(Long appointmentId) {
        return "medisync-" + appointmentId + "-" + UUID.randomUUID().toString().replace("-", "");
    }

    private VideoSession syncSessionWithAppointment(VideoSession session, AppointmentClient.AppointmentData appointment) {
        boolean dirty = false;
        if (!appointment.getDoctorId().equals(session.getDoctorId())) {
            session.setDoctorId(appointment.getDoctorId());
            dirty = true;
        }
        if (!appointment.getPatientId().equals(session.getPatientId())) {
            session.setPatientId(appointment.getPatientId());
            dirty = true;
        }
        if (appointment.getScheduledAt() != null && !appointment.getScheduledAt().equals(session.getScheduledTime())) {
            session.setScheduledTime(appointment.getScheduledAt());
            dirty = true;
        }
        return dirty ? videoSessionRepository.save(session) : session;
    }

    private void sendMeetingNotifications(VideoSession session, String authHeader) {
        List<AuthInternalClient.UserContact> contacts = authInternalClient.getUserContacts(List.of(session.getDoctorId(), session.getPatientId()));
        Map<Long, String> doctorNames = profileClient.getDoctorNames(authHeader);
        Map<Long, String> patientNames = profileClient.getPatientNames(authHeader);

        for (AuthInternalClient.UserContact contact : contacts) {
            if (contact.getPhone() == null || contact.getPhone().isBlank()) {
                continue;
            }
            String counterpart = contact.getUserId().equals(session.getDoctorId())
                    ? patientNames.getOrDefault(session.getPatientId(), "Patient")
                    : doctorNames.getOrDefault(session.getDoctorId(), "Doctor");
            String recipientName = contact.getUserId().equals(session.getDoctorId())
                    ? doctorNames.getOrDefault(session.getDoctorId(), fallbackName(contact.getName(), "Doctor"))
                    : patientNames.getOrDefault(session.getPatientId(), fallbackName(contact.getName(), "Patient"));
            notificationClient.sendSms(
                    contact.getPhone(),
                    "Telemedicine Session",
                    "Appointment #" + session.getAppointmentId(),
                    "Hello " + recipientName + ", your Jitsi link for the consultation with " + counterpart
                            + " is " + session.getMeetingLink()
                            + ". Join from " + session.getScheduledTime().minusMinutes(joinWindowMinutes) + "."
            );
        }
    }

    private String fallbackName(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private VideoSessionDtos.VideoSessionResponse toResponse(VideoSession session, String authHeader) {
        Map<Long, String> doctorNames = profileClient.getDoctorNames(authHeader);
        Map<Long, String> patientNames = profileClient.getPatientNames(authHeader);
        return toResponse(session, doctorNames, patientNames);
    }

    private VideoSessionDtos.VideoSessionResponse toResponse(VideoSession session,
                                                            Map<Long, String> doctorNames,
                                                            Map<Long, String> patientNames) {
        return VideoSessionDtos.VideoSessionResponse.builder()
                .id(session.getId())
                .appointmentId(session.getAppointmentId())
                .doctorId(session.getDoctorId())
                .patientId(session.getPatientId())
                .doctorName(doctorNames.getOrDefault(session.getDoctorId(), "Doctor #" + session.getDoctorId()))
                .patientName(patientNames.getOrDefault(session.getPatientId(), "Patient #" + session.getPatientId()))
                .roomId(session.getRoomId())
                .meetingLink(session.getMeetingLink())
                .status(session.getStatus())
                .scheduledTime(session.getScheduledTime())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
