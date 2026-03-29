package com.healthcare.notification.notification_service.controller;

import com.healthcare.notification.notification_service.dto.MessageNotificationRequest;
import com.healthcare.notification.notification_service.service.SmsNotificationPublisher;
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
public class MsgNotificationController {

    private final SmsNotificationPublisher smsNotificationPublisher;

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> sendMessage(@Valid @RequestBody MessageNotificationRequest request) {
        smsNotificationPublisher.publish(request);
        return ResponseEntity.accepted().body(Map.of("message", "Message notification queued for delivery"));
    }
}
