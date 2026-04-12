package com.example.telemedicine_service.controller;


import com.example.telemedicine_service.dto.SessionDto;
import com.example.telemedicine_service.service.TeleSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TeleSessionController {

    private final TeleSessionService sessionService;

    // ── POST /sessions/{appointmentId} — called by Appointment Service ─────────
    @PostMapping("/sessions/{appointmentId}")
    public ResponseEntity<SessionDto.Response> createSession(
            @PathVariable Long appointmentId,
            @RequestBody SessionDto.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.createSession(appointmentId, req));
    }

    // ── GET /sessions/{appointmentId} ──────────────────────────────────────────
    @GetMapping("/sessions/{appointmentId}")
    public ResponseEntity<SessionDto.Response> getSession(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(sessionService.getByAppointmentId(appointmentId));
    }

    // ── Health check ───────────────────────────────────────────────────────────
    @GetMapping("/sessions/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "telemedicine-service"));
    }
}
