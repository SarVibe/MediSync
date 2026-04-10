package com.helthcaresystem.appointment_service.controller;

import com.helthcaresystem.appointment_service.dto.AppointmentRequest;
import com.helthcaresystem.appointment_service.dto.AppointmentResponse;
import com.helthcaresystem.appointment_service.dto.CancelAppointmentRequest;
import com.helthcaresystem.appointment_service.dto.PendingPaymentAppointmentRequest;
import com.helthcaresystem.appointment_service.dto.PendingPaymentConfirmationRequest;
import com.helthcaresystem.appointment_service.dto.RescheduleRequest;
import com.helthcaresystem.appointment_service.dto.StatusUpdateRequest;
import com.helthcaresystem.appointment_service.client.DoctorProfileClient;
import com.helthcaresystem.appointment_service.model.entity.Appointment;
import com.helthcaresystem.appointment_service.security.AuthenticatedUser;
import com.helthcaresystem.appointment_service.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DoctorProfileClient doctorProfileClient;

    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(@Valid @RequestBody AppointmentRequest request,
                                                               @AuthenticationPrincipal AuthenticatedUser user,
                                                               HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponse(
                appointmentService.bookAppointment(request, user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @PostMapping("/pending-payment")
    public ResponseEntity<AppointmentResponse> createPendingPaymentAppointment(
            @Valid @RequestBody PendingPaymentAppointmentRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponse(
                appointmentService.createPendingPaymentAppointment(request, user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @PostMapping("/pending-payment/confirm")
    public ResponseEntity<AppointmentResponse> confirmPendingPaymentAppointment(
            @Valid @RequestBody PendingPaymentConfirmationRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponse(
                appointmentService.confirmPendingPaymentAppointment(request.getPaymentSessionId(), user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @PostMapping("/pending-payment/cancel")
    public ResponseEntity<AppointmentResponse> cancelPendingPaymentAppointment(
            @Valid @RequestBody PendingPaymentConfirmationRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponse(
                appointmentService.cancelPendingPaymentAppointment(request.getPaymentSessionId(), user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(@AuthenticationPrincipal AuthenticatedUser user,
                                                                       HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponses(
                appointmentService.getMyAppointments(user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(@AuthenticationPrincipal AuthenticatedUser user,
                                                                        HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponses(
                appointmentService.getAllAppointments(user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long id,
                                                                 @Valid @RequestBody CancelAppointmentRequest request,
                                                                 @AuthenticationPrincipal AuthenticatedUser user,
                                                                 HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponse(
                appointmentService.cancelAppointment(id, request.getReason(), user, servletRequest.getHeader("Authorization")),
                servletRequest.getHeader("Authorization")
        ));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(@PathVariable Long id,
                                                                     @RequestBody RescheduleRequest request,
                                                                     @AuthenticationPrincipal AuthenticatedUser user,
                                                                     HttpServletRequest servletRequest) {
        LocalDateTime dateTime = LocalDateTime.parse(request.getNewDateTime());
        return ResponseEntity.ok(toResponse(
                appointmentService.rescheduleAppointment(id, dateTime, user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(@PathVariable Long id,
                                                                       @Valid @RequestBody StatusUpdateRequest request,
                                                                       @AuthenticationPrincipal AuthenticatedUser user,
                                                                       HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponse(
                appointmentService.updateStatus(
                        id,
                        request.getStatus(),
                        request.getReason(),
                        user,
                        servletRequest.getHeader("Authorization")
                ),
                servletRequest.getHeader("Authorization")
        ));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctor(@PathVariable Long doctorId,
                                                                             @AuthenticationPrincipal AuthenticatedUser user,
                                                                             HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponses(
                appointmentService.getAppointmentsByDoctor(doctorId, user),
                servletRequest.getHeader("Authorization")
        ));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByPatient(@PathVariable Long patientId,
                                                                              @AuthenticationPrincipal AuthenticatedUser user,
                                                                              HttpServletRequest servletRequest) {
        return ResponseEntity.ok(toResponses(
                appointmentService.getAppointmentsByPatient(patientId, user),
                servletRequest.getHeader("Authorization")
        ));
    }

    private List<AppointmentResponse> toResponses(List<Appointment> appointments, String authHeader) {
        Map<Long, DoctorProfileClient.PatientOption> patientOptions = doctorProfileClient.getPatientOptions(authHeader);
        Map<Long, DoctorProfileClient.DoctorOption> doctorOptions = doctorProfileClient.getDoctorOptions(authHeader);

        return appointments.stream()
                .map(appointment -> toResponse(appointment, patientOptions, doctorOptions))
                .toList();
    }

    private AppointmentResponse toResponse(Appointment appointment, String authHeader) {
        Map<Long, DoctorProfileClient.PatientOption> patientOptions = doctorProfileClient.getPatientOptions(authHeader);
        Map<Long, DoctorProfileClient.DoctorOption> doctorOptions = doctorProfileClient.getDoctorOptions(authHeader);
        return toResponse(appointment, patientOptions, doctorOptions);
    }

    private AppointmentResponse toResponse(Appointment appointment,
                                           Map<Long, DoctorProfileClient.PatientOption> patientOptions,
                                           Map<Long, DoctorProfileClient.DoctorOption> doctorOptions) {
        String patientName = patientOptions.containsKey(appointment.getPatientId())
                ? patientOptions.get(appointment.getPatientId()).getFullName()
                : "Patient #" + appointment.getPatientId();
        DoctorProfileClient.DoctorOption doctorOption = doctorOptions.get(appointment.getDoctorId());
        String doctorName = doctorOption != null && doctorOption.getFullName() != null
                ? doctorOption.getFullName()
                : "Doctor #" + appointment.getDoctorId();
        return AppointmentResponse.fromEntity(
                appointment,
                patientName,
                doctorName,
                doctorOption == null ? "" : doctorOption.getSpecialization(),
                doctorOption == null ? "" : doctorOption.getQualifications(),
                doctorOption == null ? null : doctorOption.getExperienceYears()
        );
    }
}
