package com.healthcare.medicalrecords.medical_service.client;

import com.healthcare.medicalrecords.medical_service.dto.AuthValidateResponse;
import com.healthcare.medicalrecords.medical_service.exception.AuthException;
import com.healthcare.medicalrecords.medical_service.security.AuthenticatedUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Locale;

@Component
@Slf4j
public class AuthServiceClient {

    @Value("${app.auth-service.base-url}")
    private String authServiceBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AuthenticatedUser validateBearerToken(String bearerToken) {
        String token = extractToken(bearerToken);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<AuthValidateResponse> response = restTemplate.exchange(
                    authServiceBaseUrl + "/auth/validate",
                    HttpMethod.POST,
                    request,
                    AuthValidateResponse.class
            );

            AuthValidateResponse body = response.getBody();
            AuthValidateResponse.ValidateData data = body == null ? null : body.getData();
            if (body == null || !body.isSuccess() || data == null || data.getUserId() == null || isBlank(data.getRole()) || isBlank(data.getStatus())) {
                throw new AuthException(messageOrDefault(body, "Token validation failed."), HttpStatus.UNAUTHORIZED);
            }

            return new AuthenticatedUser(
                    data.getUserId(),
                    data.getRole(),
                    data.getStatus(),
                    data.getProfileId(),
                    token
            );
        } catch (HttpStatusCodeException ex) {
            log.warn("Auth validation returned {}: {}", ex.getStatusCode(), ex.getMessage());
            throw new AuthException("Token validation failed.", ex.getStatusCode());
        } catch (AuthException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Auth validation call failed: {}", ex.getMessage());
            throw new AuthException("Unable to validate token.", HttpStatus.UNAUTHORIZED);
        }
    }

    private String extractToken(String bearerToken) {
        if (bearerToken == null || bearerToken.isBlank()) {
            throw new AuthException("Missing bearer token.", HttpStatus.UNAUTHORIZED);
        }

        String normalized = bearerToken.trim();
        if (normalized.toLowerCase(Locale.ROOT).startsWith("bearer ")) {
            normalized = normalized.substring(7).trim();
        }

        if (normalized.isBlank()) {
            throw new AuthException("Missing bearer token.", HttpStatus.UNAUTHORIZED);
        }

        return normalized;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String messageOrDefault(AuthValidateResponse body, String defaultMessage) {
        return body != null && body.getMessage() != null && !body.getMessage().isBlank()
                ? body.getMessage()
                : defaultMessage;
    }
}
