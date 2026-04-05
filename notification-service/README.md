# Notification Service

## Kafka-based SMS flow

This service now queues SMS notification requests in Kafka and sends them asynchronously.

### Flow

1. `POST /api/notifications/message` receives request and validates payload.
2. `SmsNotificationPublisher` publishes `SmsNotificationEvent` to Kafka topic.
3. `SmsNotificationConsumer` listens to the topic and calls `MsgNotificationService`.
4. `MsgNotificationService` sends SMS to notify.lk.

### Required properties

- `KAFKA_BOOTSTRAP_SERVERS` (default: `localhost:9094`)
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

Start Kafka and the app container with docker compose.

```powershell
docker compose up -d
```

If your Kafka cluster does not allow auto topic creation, create the topic manually.

```powershell
docker exec -it notification-kafka kafka-topics.sh --create --topic sms-notification-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

Verify topic availability.

```powershell
docker exec -it notification-kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

If you run the Spring Boot app on your host machine (not in Docker), keep `KAFKA_BOOTSTRAP_SERVERS=localhost:9094`.
If you run the app as the `notification-service` container, use `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`.



