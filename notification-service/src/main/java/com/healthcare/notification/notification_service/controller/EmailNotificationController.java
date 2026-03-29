package com.healthcare.notification.notification_service.controller;

import com.healthcare.notification.notification_service.dto.EmailNotificationRequest;
import com.healthcare.notification.notification_service.service.EmailNotificationPublisher;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class EmailNotificationController {
    private final EmailNotificationPublisher emailNotificationPublisher;

    @PostMapping("/email")
    public ResponseEntity<Map<String, String>> sendEmail(@Valid @RequestBody EmailNotificationRequest request) {
        emailNotificationPublisher.publish(request);
        return ResponseEntity.accepted().body(Map.of("message", "Email notification queued for delivery"));
    }
}
