package com.health.profile.profile_service.client;

import com.health.profile.profile_service.dto.AuthValidateResponse;
import com.health.profile.profile_service.exception.ProfileException;
import com.health.profile.profile_service.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthServiceClient {

    @Value("${app.auth-service.base-url}")
    private String authServiceBaseUrl;

    private final RestTemplate restTemplate;

    public AuthenticatedUser validateBearerToken(String bearerToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, bearerToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<AuthValidateResponse> response = restTemplate.exchange(
                    authServiceBaseUrl + "/auth/validate",
                    HttpMethod.POST,
                    request,
                    AuthValidateResponse.class
            );

            AuthValidateResponse body = response.getBody();
            if (body == null || !body.isSuccess() || body.getData() == null) {
                throw new ProfileException("Token validation failed.", HttpStatus.UNAUTHORIZED);
            }

            return new AuthenticatedUser(
                    body.getData().getUserId(),
                    body.getData().getRole(),
                    body.getData().getStatus(),
                    body.getData().getProfileId(),
                    bearerToken.substring(7)
            );
        } catch (ProfileException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Auth validation call failed: {}", ex.getMessage());
            throw new ProfileException("Unable to validate token.", HttpStatus.UNAUTHORIZED);
        }
    }
}

