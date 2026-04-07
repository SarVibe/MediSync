package com.health.profile.profile_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatusCode;

@Getter
public class ProfileException extends RuntimeException {

    private final HttpStatusCode status;

    public ProfileException(String message, HttpStatusCode status) {
        super(message);
        this.status = status;
    }
}

