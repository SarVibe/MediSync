package com.health.auth.auth_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

// ── Base auth exception ───────────────────────────────────────────────────────
@Getter
public class AuthException extends RuntimeException {
    private final HttpStatus status;

    public AuthException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

}

// ── Specific exceptions ───────────────────────────────────────────────────────
class UserAlreadyExistsException extends AuthException {
    public UserAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}

class UserNotFoundException extends AuthException {
    public UserNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}

class InvalidOtpException extends AuthException {
    public InvalidOtpException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

class OtpExpiredException extends AuthException {
    public OtpExpiredException(String message) {
        super(message, HttpStatus.GONE);
    }
}

class OtpRateLimitException extends AuthException {
    public OtpRateLimitException(String message) {
        super(message, HttpStatus.TOO_MANY_REQUESTS);
    }
}

class AccountBlockedException extends AuthException {
    public AccountBlockedException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}

class AccountPendingException extends AuthException {
    public AccountPendingException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}

class InvalidTokenException extends AuthException {
    public InvalidTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

class InvalidCredentialsException extends AuthException {
    public InvalidCredentialsException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

class InvalidChallengeTokenException extends AuthException {
    public InvalidChallengeTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}