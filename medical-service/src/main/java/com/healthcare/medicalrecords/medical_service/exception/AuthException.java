package com.healthcare.medicalrecords.medical_service.exception;

import org.springframework.http.HttpStatusCode;

public class AuthException extends RuntimeException {

    private final HttpStatusCode status;

    public AuthException(String message, HttpStatusCode status) {
        super(message);
        this.status = status;
    }

    public HttpStatusCode getStatus() {
        return status;
    }
}