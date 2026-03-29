# Notification Service

## Kafka-based SMS flow

This service now queues SMS notification requests in Kafka and sends them asynchronously.

### Flow

1. `POST /api/notifications/message` receives request and validates payload.
2. `SmsNotificationPublisher` publishes `SmsNotificationEvent` to Kafka topic.
3. `SmsNotificationConsumer` listens to the topic and calls `MsgNotificationService`.
4. `MsgNotificationService` sends SMS to notify.lk.

### Required properties

- `KAFKA_BOOTSTRAP_SERVERS` (default: `localhost:9092`)
- `NOTIFICATION_SMS_KAFKA_TOPIC` (default: `sms-notification-topic`)
- `NOTIFICATION_SMS_KAFKA_GROUP_ID` (default: `sms-notification-consumer-group`)

### Example request

```json
{
  "to": "+94771234567",
  "header": "MediSync OTP Notification",
  "contentHeader": "OTP for Pickup",
  "content": "232323",
  "footnote": "valid only for 1 hour",
  "footer": "Do not share this with anyone."
}
```

### Local run (example)

Use any Kafka instance and then run the Spring Boot app.

