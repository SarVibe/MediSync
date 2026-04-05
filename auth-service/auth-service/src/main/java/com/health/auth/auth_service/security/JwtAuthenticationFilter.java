package com.health.auth.auth_service.security;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.health.auth.auth_service.dto.AuthResponse.ApiResponse;
import com.health.auth.auth_service.util.TokenBlacklistUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistUtil blacklistUtil;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractTokenFromRequest(request);

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Validate signature and expiry
            if (!jwtUtil.isTokenValid(token)) {
                sendUnauthorized(response, "Invalid or expired token");
                return;
            }

            // Check blacklist
            String jti = jwtUtil.extractJti(token);
            if (blacklistUtil.isBlacklisted(jti)) {
                sendUnauthorized(response, "Token has been invalidated");
                return;
            }

            // Parse claims and set Spring Security context
            Claims claims = jwtUtil.parseToken(token);
            String userId  = claims.getSubject();
            String role    = claims.get("role", String.class);
            String profileId = claims.get("profileId", String.class);

            // Store userId, role, profileId as principal details for controllers
            AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                    Long.parseLong(userId), role, profileId, token
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            authenticatedUser,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (JwtException e) {
            log.debug("JWT processing error: {}", e.getMessage());
            sendUnauthorized(response, "Invalid token");
            return;
        } catch (Exception e) {
            log.error("Authentication filter error: {}", e.getMessage());
            sendUnauthorized(response, "Authentication failed");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> body = ApiResponse.error(message);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    // ── Authenticated user principal stored in SecurityContext ────────────────
    public record AuthenticatedUser(Long userId, String role, String profileId, String rawToken) {}
}
