package com.health.profile.profile_service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health.profile.profile_service.client.AuthServiceClient;
import com.health.profile.profile_service.dto.ApiResponse;
import com.health.profile.profile_service.exception.ProfileException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthValidationFilter extends OncePerRequestFilter {

    private static final Set<String> INTERNAL_PATHS = Set.of(
            "/api/profiles/init",
            "/api/profiles/status-update"
    );

    private static final Set<String> ADDITIONAL_AUTH_PATHS = Set.of(
            "/api/doctor-upgrade/upload-profile"
    );

    private final AuthServiceClient authServiceClient;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean protectedPath = path.startsWith("/api/profiles") || ADDITIONAL_AUTH_PATHS.contains(path);
        boolean shouldNotFilter = !protectedPath || INTERNAL_PATHS.contains(path);

        System.out.println("[AuthValidationFilter] shouldNotFilter for path: " + path);
        System.out.println("  protectedPath: " + protectedPath);
        System.out.println("  INTERNAL_PATHS.contains(path): " + INTERNAL_PATHS.contains(path));
        System.out.println("  Result shouldNotFilter: " + shouldNotFilter);

        return shouldNotFilter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

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
            System.out.println("========== [AuthValidationFilter] END (REJECTED) ==========\n");
            return;
        }

        try {
            System.out.println("[AuthValidationFilter] Validating token with AuthService...");
            AuthenticatedUser user = authServiceClient.validateBearerToken(authorization);
            System.out.println("[AuthValidationFilter] ✅ Token validated successfully");
            System.out.println("  User ID: " + user.userId());
            System.out.println("  Role: " + user.role());
            System.out.println("  Status: " + user.status());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("[AuthValidationFilter] SecurityContext set, continuing chain");
            System.out.println("========== [AuthValidationFilter] END (ALLOWED) ==========\n");
            filterChain.doFilter(request, response);
        } catch (ProfileException ex) {
            System.out.println("[AuthValidationFilter] ❌ ProfileException: " + ex.getMessage());
            unauthorized(response, ex.getMessage());
            System.out.println("========== [AuthValidationFilter] END (EXCEPTION) ==========\n");
        } catch (Exception ex) {
            System.out.println("[AuthValidationFilter] ❌ Unexpected error: " + ex.getMessage());
            log.warn("Unexpected auth filter error: {}", ex.getMessage());
            unauthorized(response, "Authentication failed.");
            System.out.println("========== [AuthValidationFilter] END (ERROR) ==========\n");
        }
    }

    private void unauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(message)));
    }
}