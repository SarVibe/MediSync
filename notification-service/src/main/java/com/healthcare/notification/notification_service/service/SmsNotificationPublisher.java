package com.healthcare.notification.notification_service.service;

import com.healthcare.notification.notification_service.dto.MessageNotificationRequest;
import com.healthcare.notification.notification_service.dto.SmsNotificationEvent;
import com.healthcare.notification.notification_service.exception.SmsNotificationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.KafkaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.support.SendResult;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class SmsNotificationPublisher {

    private final KafkaTemplate<String, SmsNotificationEvent> kafkaTemplate;
    private final String topic;
    private final long publishTimeoutSeconds;

    public SmsNotificationPublisher(
            KafkaTemplate<String, SmsNotificationEvent> kafkaTemplate,
            @Value("${notification.sms.kafka.topic}") String topic,
            @Value("${notification.sms.kafka.publish-timeout-seconds:10}") long publishTimeoutSeconds) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
        this.publishTimeoutSeconds = publishTimeoutSeconds;
    }

    public void publish(MessageNotificationRequest request) {
        SmsNotificationEvent event = SmsNotificationEvent.fromRequest(request);
        try {
            SendResult<String, SmsNotificationEvent> sendResult = kafkaTemplate
                    .send(topic, request.to(), event)
                    .get(publishTimeoutSeconds, TimeUnit.SECONDS);

            log.info("SMS notification event published for {} to topic {}, offset={}",
                    request.to(), topic, sendResult.getRecordMetadata().offset());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new SmsNotificationException("SMS queue publish interrupted", ex);
        } catch (TimeoutException | ExecutionException | KafkaException ex) {
            log.error("Failed to publish SMS event for {} to topic {}", request.to(), topic, ex);
            throw new SmsNotificationException(
                    "SMS queue is unavailable or topic is missing. Please ensure Kafka is running and topic '" + topic + "' exists.",
                    ex);
        }
    }
}


