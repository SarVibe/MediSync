package com.healthcare.medicalrecords.medical_service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.medicalrecords.medical_service.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class InternalApiKeyFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-Internal-Api-Key";
    private static final Set<String> PROTECTED_PATHS = Set.of();

    @Value("${app.internal.api-key}")
    private String expectedApiKey;

    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean shouldNotFilter = !PROTECTED_PATHS.contains(path);
        System.out.println("[InternalApiKeyFilter] shouldNotFilter for path: " + path + " = " + shouldNotFilter);
        return shouldNotFilter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        System.out.println("\n========== [InternalApiKeyFilter] START ==========");
        System.out.println("[InternalApiKeyFilter] Request URI: " + request.getRequestURI());
        System.out.println("[InternalApiKeyFilter] Request Method: " + request.getMethod());
        System.out.println("[InternalApiKeyFilter] Expected API Key: '" + expectedApiKey + "'");

        // Log all headers
        System.out.println("[InternalApiKeyFilter] All Headers:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            String value = request.getHeader(name);
            if (name.equalsIgnoreCase("authorization") && value != null && value.length() > 30) {
                value = value.substring(0, 30) + "...";
            }
            System.out.println("  " + name + ": " + value);
        }

        String provided = request.getHeader(HEADER_NAME);
        System.out.println("[InternalApiKeyFilter] Looking for header: '" + HEADER_NAME + "'");
        System.out.println("[InternalApiKeyFilter] Provided API Key: '" + provided + "'");
        System.out.println("[InternalApiKeyFilter] Provided is null: " + (provided == null));

        if (provided == null || !provided.equals(expectedApiKey)) {
            System.out.println("[InternalApiKeyFilter] ❌ API KEY INVALID - Returning 401");
            System.out.println("  Reason: " + (provided == null ? "No API key provided" : "API key mismatch"));
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error("Invalid internal API key.")));
            System.out.println("[InternalApiKeyFilter] Response status set to: " + HttpStatus.UNAUTHORIZED.value());
            System.out.println("========== [InternalApiKeyFilter] END (REJECTED) ==========");
            return;
        }

        System.out.println("[InternalApiKeyFilter] ✅ API KEY VALID - Continuing to next filter");
        System.out.println("========== [InternalApiKeyFilter] END (ALLOWED) ==========");
        filterChain.doFilter(request, response);
    }
}