package com.healthcare.notification.notification_service.service;

import com.healthcare.notification.notification_service.dto.EmailNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailNotificationConsumer {

    private final EmailNotificationService emailNotificationService;

    public EmailNotificationConsumer(EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }

    @KafkaListener(topics = "${notification.email.kafka.topic}", groupId = "${notification.email.kafka.group-id}")
    public void consume(EmailNotificationEvent event) {
        emailNotificationService.sendEmail(event.to(), event.subject(), event.body(), Boolean.TRUE.equals(event.html()));
        log.info("Email notification event consumed for {}", event.to());
    }
}

