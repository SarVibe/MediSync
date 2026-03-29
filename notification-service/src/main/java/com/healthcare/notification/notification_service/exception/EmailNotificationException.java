package com.healthcare.notification.notification_service.exception;

public class EmailNotificationException extends RuntimeException {

    public EmailNotificationException(String message, Throwable cause) {
        super(message, cause);
    }
}

