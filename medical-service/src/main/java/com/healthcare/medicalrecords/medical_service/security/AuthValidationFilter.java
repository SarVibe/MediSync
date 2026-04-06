package com.healthcare.medicalrecords.medical_service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.medicalrecords.medical_service.client.AuthServiceClient;
import com.healthcare.medicalrecords.medical_service.dto.ApiResponse;
import com.healthcare.medicalrecords.medical_service.exception.AuthException;
import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthValidationFilter extends OncePerRequestFilter {

    private final AuthServiceClient authServiceClient;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(@Nonnull HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean shouldFilter = path.startsWith("/api/medical-records") || path.startsWith("/api/prescriptions");
        System.out.println("[AuthValidationFilter] shouldNotFilter for path: " + path + " = " + !shouldFilter);
        return !shouldFilter;
    }

    @Override
    protected void doFilterInternal(@Nonnull HttpServletRequest request,
                                    @Nonnull HttpServletResponse response,
                                    @Nonnull FilterChain filterChain) throws IOException {

        System.out.println("\n========== [AuthValidationFilter] START ==========");
        System.out.println("[AuthValidationFilter] Request URI: " + request.getRequestURI());

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        System.out.println("[AuthValidationFilter] Authorization header present: " + (authorization != null));
        if (authorization != null) {
            String maskedAuth = authorization.length() > 30 ? authorization.substring(0, 30) + "..." : authorization;
            System.out.println("[AuthValidationFilter] Authorization: " + maskedAuth);
        }

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            System.out.println("[AuthValidationFilter] ❌ No valid Bearer token - Returning 401");
            unauthorized(response, "Missing bearer token.");
            System.out.println("========== [AuthValidationFilter] END (REJECTED) ==========");
            return;
        }

        try {
            System.out.println("[AuthValidationFilter] Validating token with AuthService...");
            AuthenticatedUser user = authServiceClient.validateBearerToken(authorization);
            System.out.println("[AuthValidationFilter] ✅ Token validated successfully");
            System.out.println("  User ID: " + user.userId());
            System.out.println("  Role: " + user.role());
            System.out.println("  Status: " + user.status());

            String path = request.getRequestURI();
            String method = request.getMethod();
            String normalizedRole = user.role() == null ? "" : user.role().trim().toUpperCase(Locale.ROOT);

            if (!Set.of("ADMIN", "PATIENT", "DOCTOR").contains(normalizedRole)) {
                throw new AccessDeniedException("User role not authorized.");
            }

            if (!"ACTIVE".equalsIgnoreCase(user.status())) {
                throw new AccessDeniedException("User account is not active.");
            }

            if (path.startsWith("/api/prescriptions") && "POST".equalsIgnoreCase(method) && !"DOCTOR".equals(normalizedRole)) {
                throw new AccessDeniedException("Only doctors can access this endpoint.");
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("[AuthValidationFilter] SecurityContext set, continuing chain");
            System.out.println("========== [AuthValidationFilter] END (ALLOWED) ==========");
            filterChain.doFilter(request, response);
        } catch (AccessDeniedException ex) {
            System.out.println("[AuthValidationFilter] ❌ AccessDeniedException: " + ex.getMessage());
            forbidden(response, ex.getMessage());
            System.out.println("========== [AuthValidationFilter] END (ACCESS DENIED) ==========");
        } catch (AuthException ex) {
            System.out.println("[AuthValidationFilter] ❌ AuthException: " + ex.getMessage());
            respond(response, ex.getStatus(), ex.getMessage());
            System.out.println("========== [AuthValidationFilter] END (EXCEPTION) ==========");
        } catch (Exception ex) {
            System.out.println("[AuthValidationFilter] ❌ Unexpected error: " + ex.getMessage());
            log.warn("Unexpected auth filter error: {}", ex.getMessage());
            unauthorized(response, "Authentication failed.");
            System.out.println("========== [AuthValidationFilter] END (ERROR) ==========");
        }
    }

    private void unauthorized(HttpServletResponse response, String message) throws IOException {
        respond(response, HttpStatus.UNAUTHORIZED, message);
    }

    private void forbidden(HttpServletResponse response, String message) throws IOException {
        respond(response, HttpStatus.FORBIDDEN, message);
    }

    private void respond(HttpServletResponse response, HttpStatusCode status, String message) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(message)));
    }
}