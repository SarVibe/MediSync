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

    private final AppointmentRepository appointmentRepository;

    public Appointment bookAppointment(AppointmentRequest request, AuthenticatedUser user) {
        Long patientId = resolvePatientId(user);
        LocalDateTime scheduledAt = request.resolveScheduledAt();

        boolean exists = appointmentRepository.existsByDoctorIdAndScheduledAt(
                request.getDoctorId(),
                scheduledAt
        );

        if (exists) {
            throw new IllegalArgumentException("This time slot is already booked for the doctor.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(request.getDoctorId());
        appointment.setReason(request.getReason());
        appointment.setScheduledAt(scheduledAt);
        appointment.setStatus(Status.BOOKED);
        return appointmentRepository.save(appointment);
    }

    public Appointment cancelAppointment(Long appointmentId, AuthenticatedUser user) {
        Appointment appointment = getOwnedAppointment(appointmentId, user);
        appointment.setStatus(Status.CANCELLED);
        return appointmentRepository.save(appointment);
    }

    public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, AuthenticatedUser user) {
        Appointment appointment = getOwnedAppointment(appointmentId, user);
        boolean exists = appointmentRepository.existsByDoctorIdAndScheduledAtAndIdNot(
                appointment.getDoctorId(),
                newDateTime,
                appointmentId
        );

        if (exists) {
            throw new IllegalArgumentException("This time slot is already booked.");
        }

        appointment.setScheduledAt(newDateTime);
        appointment.setStatus(Status.RESCHEDULED);
        return appointmentRepository.save(appointment);
    }

    public Appointment updateStatus(Long appointmentId, String nextStatus, AuthenticatedUser user) {
        if (!user.hasRole("DOCTOR") && !user.hasRole("ADMIN")) {
            throw new AccessDeniedException("Only doctors or admins can update appointment status.");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found."));

        if (user.hasRole("DOCTOR") && !appointment.getDoctorId().equals(user.userId())) {
            throw new AccessDeniedException("You can only update your own appointments.");
        }

        appointment.setStatus(Status.valueOf(nextStatus.toUpperCase()));
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

    private Long resolvePatientId(AuthenticatedUser user) {
        if (user.hasRole("PATIENT")) {
            return user.userId();
        }
        if (user.hasRole("ADMIN")) {
            throw new AccessDeniedException("Admin users cannot book appointments on behalf of patients.");
        }
        throw new AccessDeniedException("Only patients can book appointments.");
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
