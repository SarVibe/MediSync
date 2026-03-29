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
        msgNotificationService.sendMessageNotification(event.toRequest());
        log.info("SMS notification event consumed for {}", event.to());
    }
}

