package com.healthcare.notification.notification_service.service;

import com.healthcare.notification.notification_service.dto.SmsNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsNotificationConsumer {

    private final MsgNotificationService msgNotificationService;

    public SmsNotificationConsumer(MsgNotificationService msgNotificationService) {
        this.msgNotificationService = msgNotificationService;
    }

    @KafkaListener(topics = "${notification.sms.kafka.topic}", groupId = "${notification.sms.kafka.group-id}")
    public void consume(SmsNotificationEvent event) {
        try {
            msgNotificationService.sendMessageNotification(event.toRequest());
            log.info("SMS notification event consumed successfully for {}", event.to());
        } catch (Exception e) {
            // Log the error but don't rethrow — prevents message from being replayed indefinitely.
            // In production, send to a dead-letter queue for manual review.
            log.error("Failed to send SMS notification for recipient {}: {}", event.to(), e.getMessage(), e);
        }
    }
}

