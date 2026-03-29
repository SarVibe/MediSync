package com.healthcare.notification.notification_service.service;

import com.healthcare.notification.notification_service.dto.MessageNotificationRequest;
import com.healthcare.notification.notification_service.dto.SmsNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsNotificationPublisher {

    private final KafkaTemplate<String, SmsNotificationEvent> kafkaTemplate;
    private final String topic;

    public SmsNotificationPublisher(
            KafkaTemplate<String, SmsNotificationEvent> kafkaTemplate,
            @Value("${notification.sms.kafka.topic}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    public void publish(MessageNotificationRequest request) {
        SmsNotificationEvent event = SmsNotificationEvent.fromRequest(request);
        kafkaTemplate.send(topic, request.to(), event);
        log.info("SMS notification event published for {} to topic {}", request.to(), topic);
    }
}

