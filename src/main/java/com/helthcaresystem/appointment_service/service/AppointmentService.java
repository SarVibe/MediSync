package com.helthcaresystem.appointment_service.service;

import com.helthcaresystem.appointment_service.model.entity.Appointment;
import com.helthcaresystem.appointment_service.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    // Book a new appointment
    public Appointment bookAppointment(Appointment appointment) {

        boolean exists = appointmentRepository.existsByDoctorIdAndScheduledAt(
                appointment.getDoctorId(),
                appointment.getScheduledAt()
        );

        if (exists) {
            throw new RuntimeException("This time slot is already booked for the doctor!");
        }

        appointment.setStatus(Appointment.Status.BOOKED);
        return appointmentRepository.save(appointment);
    }

    // Cancel an appointment
    public Appointment cancelAppointment(Long appointmentId) {
        Optional<Appointment> optional = appointmentRepository.findById(appointmentId);
        if (optional.isPresent()) {
            Appointment appointment = optional.get();
            appointment.setStatus(Appointment.Status.CANCELLED);
            return appointmentRepository.save(appointment);
        }
        return null; // Or throw exception
    }

    // Reschedule an appointment
    public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime) {

        Optional<Appointment> optional = appointmentRepository.findById(appointmentId);

        if (optional.isPresent()) {

            Appointment appointment = optional.get();

            //  Check duplicate booking
            boolean exists = appointmentRepository.existsByDoctorIdAndScheduledAt(
                    appointment.getDoctorId(),
                    newDateTime
            );

            if (exists) {
                throw new RuntimeException("This time slot is already booked!");
            }

            appointment.setScheduledAt(newDateTime);
            appointment.setStatus(Appointment.Status.RESCHEDULED);

            return appointmentRepository.save(appointment);
        }

        throw new RuntimeException("Appointment not found");
    }

    // Get all appointments for a doctor
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // Get all appointments for a patient
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        List<Appointment> list = appointmentRepository.findByPatientId(patientId);

        if (list.isEmpty()) {
            throw new RuntimeException("No appointments found for this patient");
        }

        return list;
    }

    // Optional: find appointment by ID
    public Optional<Appointment> findById(Long id) {
        return appointmentRepository.findById(id);
    }
}