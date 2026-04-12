package com.example.telemedicine_service.controller;

import com.example.telemedicine_service.dto.VideoSessionDtos;
import com.example.telemedicine_service.security.AuthenticatedUser;
import com.example.telemedicine_service.service.VideoSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/video-sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class VideoSessionController {

    private final VideoSessionService videoSessionService;

    @PostMapping("/create")
    public ResponseEntity<VideoSessionDtos.VideoSessionResponse> createSession(
            @Valid @RequestBody VideoSessionDtos.CreateSessionRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                videoSessionService.createSession(request, user, httpRequest.getHeader("Authorization"))
        );
    }

    @PostMapping("/join")
    public ResponseEntity<VideoSessionDtos.JoinSessionResponse> joinSession(
            @Valid @RequestBody VideoSessionDtos.JoinSessionRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(
                videoSessionService.joinSession(request, user, httpRequest.getHeader("Authorization"))
        );
    }

    @PostMapping("/end")
    public ResponseEntity<VideoSessionDtos.VideoSessionResponse> endSession(
            @Valid @RequestBody VideoSessionDtos.EndSessionRequest request,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(
                videoSessionService.endSession(request, user, httpRequest.getHeader("Authorization"))
        );
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<VideoSessionDtos.VideoSessionResponse> getByAppointmentId(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(
                videoSessionService.getByAppointmentId(appointmentId, user, httpRequest.getHeader("Authorization"))
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<VideoSessionDtos.VideoSessionResponse>> getDoctorSessions(
            @PathVariable Long doctorId,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(
                videoSessionService.getDoctorSessions(doctorId, user, httpRequest.getHeader("Authorization"))
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<VideoSessionDtos.VideoSessionResponse>> getPatientSessions(
            @PathVariable Long patientId,
            @AuthenticationPrincipal AuthenticatedUser user,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(
                videoSessionService.getPatientSessions(patientId, user, httpRequest.getHeader("Authorization"))
        );
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "telemedicine-service"));
    }
}
