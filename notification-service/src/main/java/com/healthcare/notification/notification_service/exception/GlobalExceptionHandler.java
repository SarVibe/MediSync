package com.healthcare.notification.notification_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
		Map<String, String> fieldErrors = new HashMap<>();
		for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
			fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
		}

		Map<String, Object> error = new HashMap<>();
		error.put("timestamp", Instant.now().toString());
		error.put("status", HttpStatus.BAD_REQUEST.value());
		error.put("error", "Validation failed");
		error.put("fieldErrors", fieldErrors);

		return ResponseEntity.badRequest().body(error);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
		return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
	}

	@ExceptionHandler(EmailNotificationException.class)
	public ResponseEntity<Map<String, Object>> handleEmailNotificationException(EmailNotificationException ex) {
		return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
	}

	@ExceptionHandler(SmsNotificationException.class)
	public ResponseEntity<Map<String, Object>> handleSmsNotificationException(SmsNotificationException ex) {
		return buildErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
	}

	private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
		Map<String, Object> error = new HashMap<>();
		error.put("timestamp", Instant.now().toString());
		error.put("status", status.value());
		error.put("error", message);
		return ResponseEntity.status(status).body(error);
	}
}

