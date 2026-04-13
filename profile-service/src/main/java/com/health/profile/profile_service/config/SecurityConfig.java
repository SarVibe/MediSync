package com.health.profile.profile_service.config;

import com.health.profile.profile_service.security.AuthValidationFilter;
import com.health.profile.profile_service.security.InternalApiKeyFilter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final InternalApiKeyFilter internalApiKeyFilter;
    private final AuthValidationFilter authValidationFilter;

    @PostConstruct
    public void init() {
        System.out.println("\n========================================");
        System.out.println("[SecurityConfig] Initialized");
        System.out.println("[SecurityConfig] InternalApiKeyFilter: " + internalApiKeyFilter.getClass().getSimpleName());
        System.out.println("[SecurityConfig] AuthValidationFilter: " + authValidationFilter.getClass().getSimpleName());
        System.out.println("========================================\n");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("[SecurityConfig] Configuring SecurityFilterChain");

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    System.out.println("[SecurityConfig] Adding authorization rules:");
                    auth.requestMatchers(HttpMethod.POST, "/api/profiles/init").permitAll();
                    System.out.println("  POST /api/profiles/init -> permitAll");
                    auth.requestMatchers(HttpMethod.POST, "/api/profiles/status-update").permitAll();
                    System.out.println("  POST /api/profiles/status-update -> permitAll");
                    auth.requestMatchers(HttpMethod.POST, "/api/doctor-upgrade/upload-profile").authenticated();
                    System.out.println("  POST /api/doctor-upgrade/upload-profile -> authenticated");
                    auth.requestMatchers("/uploads/**").permitAll();
                    System.out.println("  /uploads/** -> permitAll");
                    auth.requestMatchers("/api/profiles/**").authenticated();
                    System.out.println("  /api/profiles/** -> authenticated");
                    auth.anyRequest().permitAll();
                    System.out.println("  anyRequest -> permitAll");
                })
                .addFilterBefore(internalApiKeyFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(authValidationFilter, InternalApiKeyFilter.class);

        System.out.println("[SecurityConfig] Filter chain order:");
        System.out.println("  1. InternalApiKeyFilter (before UsernamePasswordAuthenticationFilter)");
        System.out.println("  2. UsernamePasswordAuthenticationFilter");
        System.out.println("  3. AuthValidationFilter (after InternalApiKeyFilter)");
        System.out.println("[SecurityConfig] SecurityFilterChain configured successfully\n");

        http.cors(cors -> {});
        return http.build();
    }
}