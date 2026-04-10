package com.helthcaresystem.appointment_service.service;

import com.helthcaresystem.appointment_service.client.AuthUserClient;
import com.helthcaresystem.appointment_service.client.DoctorProfileClient;
import com.helthcaresystem.appointment_service.client.NotificationClient;
import com.helthcaresystem.appointment_service.model.entity.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentNotificationService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final DoctorProfileClient doctorProfileClient;
    private final AuthUserClient authUserClient;
    private final NotificationClient notificationClient;

    public void notifyBookingPending(Appointment appointment, String authHeader) {
        notifyBoth(appointment, NotificationType.BOOKING_PENDING, null, null, null, authHeader);
    }

    public void notifyRescheduledByPatient(Appointment appointment,
                                           LocalDateTime previousDateTime,
                                           String authHeader) {
        notifyBoth(
                appointment,
                NotificationType.BOOKING_RESCHEDULED_BY_PATIENT,
                previousDateTime,
                appointment.getScheduledAt(),
                null,
                authHeader
        );
    }

    public void notifyRescheduledByDoctor(Appointment appointment,
                                          LocalDateTime previousDateTime,
                                          String authHeader) {
        notifyBoth(
                appointment,
                NotificationType.BOOKING_RESCHEDULED_BY_DOCTOR,
                previousDateTime,
                appointment.getScheduledAt(),
                null,
                authHeader
        );
    }

    public void notifyRescheduleAcceptedByPatient(Appointment appointment, String authHeader) {
        notifyBoth(appointment, NotificationType.BOOKING_RESCHEDULE_ACCEPTED_BY_PATIENT, null, null, null, authHeader);
    }

    public void notifyCancelledByPatient(Appointment appointment, String authHeader) {
        notifyBoth(appointment, NotificationType.BOOKING_CANCELLED_BY_PATIENT, null, null, null, authHeader);
    }

    public void notifyAcceptedByDoctor(Appointment appointment, String authHeader) {
        notifyBoth(appointment, NotificationType.BOOKING_ACCEPTED_BY_DOCTOR, null, null, null, authHeader);
    }

    public void notifyRejectedByDoctor(Appointment appointment, String reason, String authHeader) {
        notifyBoth(appointment, NotificationType.BOOKING_REJECTED_BY_DOCTOR, null, null, reason, authHeader);
    }

    public void notifyRejectedByAdmin(Appointment appointment, String reason, String authHeader) {
        notifyBoth(appointment, NotificationType.BOOKING_REJECTED_BY_ADMIN, null, null, reason, authHeader);
    }

    public void notifyCompletedByDoctor(Appointment appointment, String authHeader) {
        notifyBoth(appointment, NotificationType.BOOKING_COMPLETED_BY_DOCTOR, null, null, null, authHeader);
    }

    private void notifyBoth(Appointment appointment,
                            NotificationType type,
                            LocalDateTime fromDateTime,
                            LocalDateTime toDateTime,
                            String reason,
                            String authHeader) {
        Map<Long, DoctorProfileClient.PatientOption> patientOptions = doctorProfileClient.getPatientOptions(authHeader);
        Map<Long, DoctorProfileClient.DoctorOption> doctorOptions = doctorProfileClient.getDoctorOptions(authHeader);
        Map<Long, AuthUserClient.UserContactOption> contacts = authUserClient.getUserContactOptions(
                List.of(appointment.getPatientId(), appointment.getDoctorId())
        );

        String patientName = resolvePatientName(appointment.getPatientId(), patientOptions, contacts);
        String doctorName = resolveDoctorName(appointment.getDoctorId(), doctorOptions, contacts);
        String bookingNumber = "APT-" + appointment.getId();

        sendForRecipient(
                Recipient.PATIENT,
                contacts.get(appointment.getPatientId()),
                type,
                bookingNumber,
                patientName,
                doctorName,
                appointment.getScheduledAt(),
                fromDateTime,
                toDateTime,
                reason
        );
        sendForRecipient(
                Recipient.DOCTOR,
                contacts.get(appointment.getDoctorId()),
                type,
                bookingNumber,
                patientName,
                doctorName,
                appointment.getScheduledAt(),
                fromDateTime,
                toDateTime,
                reason
        );
    }

    private void sendForRecipient(Recipient recipient,
                                  AuthUserClient.UserContactOption contact,
                                  NotificationType type,
                                  String bookingNumber,
                                  String patientName,
                                  String doctorName,
                                  LocalDateTime scheduledAt,
                                  LocalDateTime fromDateTime,
                                  LocalDateTime toDateTime,
                                  String reason) {
        if (contact == null) {
            return;
        }

        String patientLabel = recipient == Recipient.PATIENT ? "You" : patientName;
        String doctorLabel = recipient == Recipient.DOCTOR ? "You" : doctorName;
        NotificationContent content = buildContent(
                type,
                bookingNumber,
                patientName,
                doctorName,
                patientLabel,
                doctorLabel,
                scheduledAt,
                fromDateTime,
                toDateTime,
                reason
        );

        String phone = normalizePhone(contact.getPhone());
        String email = trimToNull(contact.getEmail());

        if (phone != null) {
            try {
                notificationClient.sendSms(phone, content.header(), content.contentHeader(), content.smsBody());
            } catch (Exception ex) {
                log.warn("Failed to send SMS notification to {}: {}", phone, ex.getMessage());
            }
        } else {
            log.warn("Skipping SMS notification because phone is missing/invalid for recipient {}", recipient);
        }
        if (email != null) {
            try {
                notificationClient.sendEmail(email, content.emailSubject(), content.emailBody());
            } catch (Exception ex) {
                log.warn("Failed to send email notification to {}: {}", email, ex.getMessage());
            }
        } else {
            log.warn("Skipping email notification because email is missing for recipient {}", recipient);
        }
    }

    private NotificationContent buildContent(NotificationType type,
                                             String bookingNumber,
                                             String patientName,
                                             String doctorName,
                                             String actorPatientLabel,
                                             String actorDoctorLabel,
                                             LocalDateTime scheduledAt,
                                             LocalDateTime fromDateTime,
                                             LocalDateTime toDateTime,
                                             String reason) {
        String date = formatDate(scheduledAt);
        String time = formatTime(scheduledAt);
        String from = formatDateTime(fromDateTime);
        String to = formatDateTime(toDateTime);
        String details = "Booking No: %s, Date: %s, Time: %s, Doctor: %s, Patient: %s"
                .formatted(bookingNumber, date, time, doctorName, patientName);

        return switch (type) {
            case BOOKING_PENDING -> new NotificationContent(
                    "Appointment Update",
                    "Booking Pending",
                    "Booking pending. %s.".formatted(details),
                    "Booking pending",
                    "Booking pending.\n%s.".formatted(details)
            );
            case BOOKING_RESCHEDULED_BY_PATIENT -> new NotificationContent(
                    "Appointment Update",
                    "Booking Rescheduled",
                    "Booking rescheduled by %s. From: %s To: %s. %s."
                            .formatted(actorPatientLabel.equals("You") ? "you" : "patient", from, to, details),
                    "Booking rescheduled by patient",
                    "Booking rescheduled by %s.\nFrom: %s\nTo: %s\n%s."
                            .formatted(actorPatientLabel.equals("You") ? "you" : "patient", from, to, details)
            );
            case BOOKING_RESCHEDULED_BY_DOCTOR -> new NotificationContent(
                    "Appointment Update",
                    "Booking Rescheduled",
                    "Booking rescheduled by %s. From: %s To: %s. %s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", from, to, details),
                    "Booking rescheduled by doctor",
                    "Booking rescheduled by %s.\nFrom: %s\nTo: %s\n%s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", from, to, details)
            );
            case BOOKING_RESCHEDULE_ACCEPTED_BY_PATIENT -> new NotificationContent(
                    "Appointment Update",
                    "Reschedule Accepted",
                    "Booking reschedule accepted by %s. %s."
                            .formatted(actorPatientLabel.equals("You") ? "you" : "patient", details),
                    "Booking reschedule accepted by patient",
                    "Booking reschedule accepted by %s.\n%s."
                            .formatted(actorPatientLabel.equals("You") ? "you" : "patient", details)
            );
            case BOOKING_CANCELLED_BY_PATIENT -> new NotificationContent(
                    "Appointment Update",
                    "Booking Cancelled",
                    "Booking cancelled by %s. %s."
                            .formatted(actorPatientLabel.equals("You") ? "you" : "patient", details),
                    "Booking cancelled by patient",
                    "Booking cancelled by %s.\n%s."
                            .formatted(actorPatientLabel.equals("You") ? "you" : "patient", details)
            );
            case BOOKING_ACCEPTED_BY_DOCTOR -> new NotificationContent(
                    "Appointment Update",
                    "Booking Accepted",
                    "Booking accepted by %s. %s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", details),
                    "Booking accepted by doctor",
                    "Booking accepted by %s.\n%s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", details)
            );
            case BOOKING_REJECTED_BY_DOCTOR -> new NotificationContent(
                    "Appointment Update",
                    "Booking Rejected",
                    "Booking rejected by %s. Reason: %s. %s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", safeReason(reason), details),
                    "Booking rejected by doctor",
                    "Booking rejected by %s.\nReason: %s\n%s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", safeReason(reason), details)
            );
            case BOOKING_REJECTED_BY_ADMIN -> new NotificationContent(
                    "Appointment Update",
                    "Booking Rejected",
                    "Booking rejected by admin. Reason: %s. %s."
                            .formatted(safeReason(reason), details),
                    "Booking rejected by admin",
                    "Booking rejected by admin.\nReason: %s\n%s."
                            .formatted(safeReason(reason), details)
            );
            case BOOKING_COMPLETED_BY_DOCTOR -> new NotificationContent(
                    "Appointment Update",
                    "Booking Completed",
                    "Booking completed by %s. %s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", details),
                    "Booking completed by doctor",
                    "Booking completed by %s.\n%s."
                            .formatted(actorDoctorLabel.equals("You") ? "you" : "doctor", details)
            );
        };
    }

    private String resolvePatientName(Long patientId,
                                      Map<Long, DoctorProfileClient.PatientOption> patientOptions,
                                      Map<Long, AuthUserClient.UserContactOption> contacts) {
        DoctorProfileClient.PatientOption patientOption = patientOptions.get(patientId);
        if (patientOption != null && patientOption.getFullName() != null && !patientOption.getFullName().isBlank()) {
            return patientOption.getFullName().trim();
        }
        AuthUserClient.UserContactOption contact = contacts.get(patientId);
        if (contact != null && contact.getName() != null && !contact.getName().isBlank()) {
            return contact.getName().trim();
        }
        return "Patient #" + patientId;
    }

    private String resolveDoctorName(Long doctorId,
                                     Map<Long, DoctorProfileClient.DoctorOption> doctorOptions,
                                     Map<Long, AuthUserClient.UserContactOption> contacts) {
        DoctorProfileClient.DoctorOption doctorOption = doctorOptions.get(doctorId);
        if (doctorOption != null && doctorOption.getFullName() != null && !doctorOption.getFullName().isBlank()) {
            return doctorOption.getFullName().trim();
        }
        AuthUserClient.UserContactOption contact = contacts.get(doctorId);
        if (contact != null && contact.getName() != null && !contact.getName().isBlank()) {
            return contact.getName().trim();
        }
        return "Doctor #" + doctorId;
    }

    private String formatDate(LocalDateTime value) {
        return value == null ? "-" : DATE_FORMAT.format(value);
    }

    private String formatTime(LocalDateTime value) {
        return value == null ? "-" : TIME_FORMAT.format(value);
    }

    private String formatDateTime(LocalDateTime value) {
        if (value == null) {
            return "-";
        }
        return "%s %s".formatted(formatDate(value), formatTime(value));
    }

    private String safeReason(String reason) {
        String normalized = trimToNull(reason);
        return normalized == null ? "No reason provided" : normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizePhone(String phone) {
        String raw = trimToNull(phone);
        if (raw == null) {
            return null;
        }
        boolean hasPlus = raw.startsWith("+");
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() < 9 || digits.length() > 15) {
            return null;
        }
        return hasPlus ? "+" + digits : digits;
    }

    private enum NotificationType {
        BOOKING_PENDING,
        BOOKING_RESCHEDULED_BY_PATIENT,
        BOOKING_RESCHEDULED_BY_DOCTOR,
        BOOKING_RESCHEDULE_ACCEPTED_BY_PATIENT,
        BOOKING_CANCELLED_BY_PATIENT,
        BOOKING_ACCEPTED_BY_DOCTOR,
        BOOKING_REJECTED_BY_DOCTOR,
        BOOKING_REJECTED_BY_ADMIN,
        BOOKING_COMPLETED_BY_DOCTOR
    }

    private enum Recipient {
        PATIENT,
        DOCTOR
    }

    private record NotificationContent(
            String header,
            String contentHeader,
            String smsBody,
            String emailSubject,
            String emailBody
    ) {
    }
}
