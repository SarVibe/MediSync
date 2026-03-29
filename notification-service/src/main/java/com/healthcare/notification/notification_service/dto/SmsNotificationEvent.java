package com.healthcare.notification.notification_service.dto;

public record SmsNotificationEvent(
        String to,
        String header,
        String contentHeader,
        String content,
        String footnote,
        String footer
) {
    public static SmsNotificationEvent fromRequest(MessageNotificationRequest request) {
        return new SmsNotificationEvent(
                request.to(),
                request.header(),
                request.contentHeader(),
                request.content(),
                request.footnote(),
                request.footer()
        );
    }

    public MessageNotificationRequest toRequest() {
        return new MessageNotificationRequest(to, header, contentHeader, content, footnote, footer);
    }
}

