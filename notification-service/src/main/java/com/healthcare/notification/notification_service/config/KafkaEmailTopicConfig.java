package com.healthcare.notification.notification_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaEmailTopicConfig {

    @Bean
    public NewTopic emailNotificationTopic(
            @Value("${notification.email.kafka.topic}") String topicName,
            @Value("${notification.email.kafka.partitions:1}") int partitions,
            @Value("${notification.email.kafka.replicas:1}") short replicas) {
        return TopicBuilder.name(topicName)
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }
}

