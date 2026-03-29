package com.healthcare.notification.notification_service.service;

import com.healthcare.notification.notification_service.exception.EmailNotificationException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailNotificationService(
            JavaMailSender mailSender,
            @Value("${notification.email.from:${spring.mail.username:no-reply@medisync.local}}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendEmail(String to, String subject, String body) {
        sendEmail(to, subject, body, false);
    }

    public void sendEmail(String to, String subject, String body, boolean isHtml) {
        validateInput(to, subject, body);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to.trim());
            helper.setSubject(subject.trim());
            helper.setText(body.trim(), isHtml);

            mailSender.send(mimeMessage);
            log.info("Email sent successfully to {} with subject '{}', html={}", to, subject, isHtml);
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send email to {}", to, ex);
            throw new EmailNotificationException("Failed to send email notification", ex);
        }
    }

    private void validateInput(String to, String subject, String body) {
        if (!StringUtils.hasText(to)) {
            throw new IllegalArgumentException("Recipient email is required");
        }
        if (!StringUtils.hasText(subject)) {
            throw new IllegalArgumentException("Email subject is required");
        }
        if (!StringUtils.hasText(body)) {
            throw new IllegalArgumentException("Email body is required");
        }
    }
}
