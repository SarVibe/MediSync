package com.helthcaresystem.appointment_service.controller;

import com.helthcaresystem.appointment_service.dto.RescheduleRequest;
import com.helthcaresystem.appointment_service.model.entity.Appointment;
import com.helthcaresystem.appointment_service.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Book a new appointment
    @PostMapping
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
        return ResponseEntity.ok(appointmentService.bookAppointment(appointment));
    }

    // Cancel an appointment
    @PutMapping("/cancel/{id}")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }

    // Reschedule an appointment
//    @PutMapping("/reschedule/{id}")
//    public ResponseEntity<Appointment> rescheduleAppointment(
//            @PathVariable Long id,
//            @RequestParam("newDateTime") String newDateTime // Example: "2026-03-31T14:30"
//    ) {
//        LocalDateTime dateTime = LocalDateTime.parse(newDateTime);
//        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, dateTime));
//    }

    @PutMapping("/reschedule/{id}")
    public ResponseEntity<Appointment> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request
    ) {
        LocalDateTime dateTime = LocalDateTime.parse(request.getNewDateTime());
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, dateTime));
    }

    // Get all appointments for a doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
    }

    // Get all appointments for a patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }
}