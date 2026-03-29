package com.healthcare.notification.notification_service.service;

import com.healthcare.notification.notification_service.dto.EmailNotificationEvent;
import com.healthcare.notification.notification_service.dto.EmailNotificationRequest;
import com.healthcare.notification.notification_service.exception.EmailNotificationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.KafkaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class EmailNotificationPublisher {

    private final KafkaTemplate<String, EmailNotificationEvent> kafkaTemplate;
    private final String topic;
    private final long publishTimeoutSeconds;

    public EmailNotificationPublisher(
            KafkaTemplate<String, EmailNotificationEvent> kafkaTemplate,
            @Value("${notification.email.kafka.topic}") String topic,
            @Value("${notification.email.kafka.publish-timeout-seconds:10}") long publishTimeoutSeconds) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
        this.publishTimeoutSeconds = publishTimeoutSeconds;
    }

    public void publish(EmailNotificationRequest request) {
        EmailNotificationEvent event = EmailNotificationEvent.fromRequest(request);
        try {
            SendResult<String, EmailNotificationEvent> sendResult = kafkaTemplate
                    .send(topic, request.to(), event)
                    .get(publishTimeoutSeconds, TimeUnit.SECONDS);

            log.info("Email notification event published for {} to topic {}, offset={}",
                    request.to(), topic, sendResult.getRecordMetadata().offset());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new EmailNotificationException("Email queue publish interrupted", ex);
        } catch (TimeoutException | ExecutionException | KafkaException ex) {
            log.error("Failed to publish email event for {} to topic {}", request.to(), topic, ex);
            throw new EmailNotificationException(
                    "Email queue is unavailable or topic is missing. Please ensure Kafka is running and topic '" + topic + "' exists.",
                    ex);
        }
    }
}

