package com.helthcaresystem.appointment_service.service;

import com.helthcaresystem.appointment_service.dto.AppointmentRequest;
import com.helthcaresystem.appointment_service.model.entity.Appointment;
import com.helthcaresystem.appointment_service.model.entity.Appointment.Status;
import com.helthcaresystem.appointment_service.repository.AppointmentRepository;
import com.helthcaresystem.appointment_service.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private static final int MAX_BOOKING_WINDOW_DAYS = 30;

    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityService doctorAvailabilityService;

    public Appointment bookAppointment(AppointmentRequest request, AuthenticatedUser user) {
        Long patientId = resolvePatientId(user);
        LocalDateTime scheduledAt = request.resolveScheduledAt();
        validateBookingWindow(scheduledAt);

        if (!doctorAvailabilityService.isSlotAvailable(request.getDoctorId(), scheduledAt, null)) {
            throw new IllegalArgumentException("This 15-minute time slot is not available for booking.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(request.getDoctorId());
        appointment.setReason(request.getReason());
        appointment.setScheduledAt(scheduledAt);
        appointment.setCancellationReason(null);
        appointment.setStatusReasonType(null);
        appointment.setStatus(Status.BOOKED);
        return appointmentRepository.save(appointment);
    }

    public Appointment cancelAppointment(Long appointmentId, String cancellationReason, AuthenticatedUser user) {
        Appointment appointment = getOwnedAppointment(appointmentId, user);
        if (cancellationReason == null || cancellationReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Cancellation reason is required.");
        }
        appointment.setCancellationReason(cancellationReason.trim());
        appointment.setStatusReasonType("PATIENT_CANCEL");
        appointment.setStatus(Status.CANCELLED);
        return appointmentRepository.save(appointment);
    }

    public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, AuthenticatedUser user) {
        Appointment appointment = getOwnedAppointment(appointmentId, user);
        if (appointment.getStatus() == Status.CANCELLED || appointment.getStatus() == Status.REJECTED) {
            throw new IllegalArgumentException("Cancelled or rejected appointments cannot be rescheduled.");
        }
        validateBookingWindow(newDateTime);
        if (!doctorAvailabilityService.isSlotAvailable(appointment.getDoctorId(), newDateTime, appointmentId)) {
            throw new IllegalArgumentException("This 15-minute time slot is not available.");
        }

        appointment.setScheduledAt(newDateTime);
        appointment.setCancellationReason(null);
        appointment.setStatusReasonType(user.hasRole("DOCTOR") ? "DOCTOR_RESCHEDULED" : null);
        appointment.setStatus(user.hasRole("DOCTOR") ? Status.RESCHEDULED : Status.BOOKED);
        return appointmentRepository.save(appointment);
    }

    public Appointment updateStatus(Long appointmentId, String nextStatus, String reason, AuthenticatedUser user) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found."));

        if (user.hasRole("DOCTOR")) {
            if (!appointment.getDoctorId().equals(user.userId())) {
                throw new AccessDeniedException("You can only update your own appointments.");
            }
        } else if (user.hasRole("PATIENT")) {
            if (!appointment.getPatientId().equals(user.userId())) {
                throw new AccessDeniedException("You can only update your own appointments.");
            }
            if (!"ACCEPTED".equalsIgnoreCase(nextStatus) || appointment.getStatus() != Status.RESCHEDULED) {
                throw new AccessDeniedException("Patients can only accept doctor-rescheduled appointments.");
            }
        } else if (!user.hasRole("ADMIN")) {
            throw new AccessDeniedException("You are not allowed to update appointment status.");
        }

        boolean doctorRejected = "REJECTED".equalsIgnoreCase(nextStatus);
        Status resolvedStatus;
        if (doctorRejected) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is required.");
            }
            appointment.setCancellationReason(reason.trim());
            appointment.setStatusReasonType(user.hasRole("ADMIN") ? "ADMIN_REJECT" : "DOCTOR_REJECT");
            resolvedStatus = Status.REJECTED;
        } else if (user.hasRole("PATIENT") && "ACCEPTED".equalsIgnoreCase(nextStatus)) {
            resolvedStatus = Status.ACCEPTED;
        } else {
            resolvedStatus = Status.valueOf(nextStatus.toUpperCase());
        }

        if (doctorRejected) {
            // Keep rejection reason metadata.
        } else if (resolvedStatus == Status.CANCELLED) {
            appointment.setStatusReasonType("ADMIN_CANCEL");
        } else {
            appointment.setCancellationReason(null);
            appointment.setStatusReasonType(null);
        }

        appointment.setStatus(resolvedStatus);
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId, AuthenticatedUser user) {
        if (user.hasRole("DOCTOR") && !doctorId.equals(user.userId())) {
            throw new AccessDeniedException("You can only view your own appointments.");
        }
        if (!user.hasRole("DOCTOR") && !user.hasRole("ADMIN")) {
            throw new AccessDeniedException("You are not allowed to view doctor appointments.");
        }
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId, AuthenticatedUser user) {
        if (user.hasRole("PATIENT") && !patientId.equals(user.userId())) {
            throw new AccessDeniedException("You can only view your own appointments.");
        }
        if (!user.hasRole("PATIENT") && !user.hasRole("ADMIN")) {
            throw new AccessDeniedException("You are not allowed to view patient appointments.");
        }
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getMyAppointments(AuthenticatedUser user) {
        if (user.hasRole("DOCTOR")) {
            return appointmentRepository.findByDoctorId(user.userId());
        }
        if (user.hasRole("PATIENT")) {
            return appointmentRepository.findByPatientId(user.userId());
        }
        throw new AccessDeniedException("Only patient or doctor accounts have personal appointments.");
    }

    public List<Appointment> getAllAppointments(AuthenticatedUser user) {
        if (!user.hasRole("ADMIN")) {
            throw new AccessDeniedException("Only admins can view all appointments.");
        }
        return appointmentRepository.findAll();
    }

    private Long resolvePatientId(AuthenticatedUser user) {
        if (user.hasRole("PATIENT")) {
            return user.userId();
        }
        if (user.hasRole("ADMIN")) {
            throw new AccessDeniedException("Admin users cannot book appointments on behalf of patients.");
        }
        throw new AccessDeniedException("Only patients can book appointments.");
    }

    private void validateBookingWindow(LocalDateTime scheduledAt) {
        LocalDateTime bookingStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime bookingEndExclusive = bookingStart.plusDays(MAX_BOOKING_WINDOW_DAYS + 1L);
        if (scheduledAt == null || scheduledAt.isBefore(bookingStart) || !scheduledAt.isBefore(bookingEndExclusive)) {
            throw new IllegalArgumentException("Appointments can only be booked within the next 30 days.");
        }
    }

    private Appointment getOwnedAppointment(Long appointmentId, AuthenticatedUser user) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found."));

        if (user.hasRole("ADMIN")) {
            return appointment;
        }
        if (user.hasRole("PATIENT") && appointment.getPatientId().equals(user.userId())) {
            return appointment;
        }
        if (user.hasRole("DOCTOR") && appointment.getDoctorId().equals(user.userId())) {
            return appointment;
        }
        throw new AccessDeniedException("You are not allowed to access this appointment.");
    }
}
