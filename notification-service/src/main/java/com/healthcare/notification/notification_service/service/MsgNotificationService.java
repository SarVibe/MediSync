package com.healthcare.notification.notification_service.service;

import com.healthcare.notification.notification_service.dto.MessageNotificationRequest;
import com.healthcare.notification.notification_service.exception.SmsNotificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class MsgNotificationService {

	private final RestTemplate restTemplate;
	private final String userId;
	private final String apiKey;
	private final String senderId;
	private final String baseUrl;

	public MsgNotificationService(
			RestTemplateBuilder restTemplateBuilder,
			@Value("${notification.sms.notifylk.user-id}") String userId,
			@Value("${notification.sms.notifylk.api-key}") String apiKey,
			@Value("${notification.sms.notifylk.sender-id}") String senderId,
			@Value("${notification.sms.notifylk.base-url}") String baseUrl) {
		this.restTemplate = restTemplateBuilder.build();
		this.userId = userId;
		this.apiKey = apiKey;
		this.senderId = senderId;
		this.baseUrl = baseUrl;
	}

	public void sendMessageNotification(MessageNotificationRequest request) {
		validateProviderConfiguration();

		String messageBody = buildFormattedMessage(request);

		// Format phone: remove + sign and any spaces/hyphens, keep only digits
		String formattedPhone = request.to().replaceAll("[^0-9]", "");
		log.info("Formatting phone number: {} -> {}", request.to(), formattedPhone);

		MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
		formData.add("user_id", userId);
		formData.add("api_key", apiKey);
		formData.add("sender_id", senderId);
		formData.add("to", formattedPhone);
		formData.add("message", messageBody);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		try {
			ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
					baseUrl,
					HttpMethod.POST,
					new HttpEntity<>(formData, headers),
					new ParameterizedTypeReference<>() {
					}
			);

			if (response.getBody() == null || !isSuccess(response.getBody())) {
				throw new SmsNotificationException("SMS provider rejected the request: " + extractProviderMessage(response.getBody()));
			}

			log.info("SMS notification sent successfully to {}", request.to());
		} catch (RestClientException ex) {
			log.error("Failed to send SMS notification to {}: {}", request.to(), ex.getMessage());
			throw new SmsNotificationException("Failed to send SMS notification", ex);
		}
	}

	private String buildFormattedMessage(MessageNotificationRequest request) {
		StringBuilder message = new StringBuilder();
		String lineSeparator = System.lineSeparator();

		message.append(request.header().trim()).append(lineSeparator).append(lineSeparator);

		if (StringUtils.hasText(request.contentHeader())) {
			message.append(request.contentHeader().trim()).append(lineSeparator);
		}

		message.append("     ").append(request.content().trim()).append(lineSeparator).append(lineSeparator);

		if (StringUtils.hasText(request.footnote())) {
			message.append(request.footnote().trim()).append(lineSeparator);
		}

		if (StringUtils.hasText(request.footer())) {
			message.append(request.footer().trim());
		}

		return message.toString().trim();
	}

	private void validateProviderConfiguration() {
		if (!StringUtils.hasText(userId) || !StringUtils.hasText(apiKey)
				|| !StringUtils.hasText(senderId) || !StringUtils.hasText(baseUrl)) {
			throw new SmsNotificationException("SMS provider configuration is missing");
		}
	}

	private boolean isSuccess(Map<?, ?> responseBody) {
		Object status = responseBody.get("status");
		return status != null && "success".equalsIgnoreCase(status.toString());
	}

	private String extractProviderMessage(Map<?, ?> responseBody) {
		if (responseBody == null) {
			return "No response body returned by provider";
		}

		Object message = responseBody.get("message");
		return message == null ? "Unknown provider error" : message.toString();
	}

}
