package com.health.auth.auth_service.util;


import com.health.auth.auth_service.entity.User;
import com.health.auth.auth_service.entity.User.Role;
import com.health.auth.auth_service.entity.User.UserStatus;
import com.health.auth.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed-email}")
    private String adminEmail;

    @Value("${app.admin.seed-password}")
    private String adminPassword;

    @Value("${app.admin.seed-phone}")
    private String adminPhone;

    @Override
    public void run(ApplicationArguments args) {
        boolean emailExists = userRepository.existsByEmail(adminEmail);
        boolean phoneExists = userRepository.existsByPhone(adminPhone);

        if (emailExists || phoneExists) {
            log.info("Default admin seed skipped. Existing user found for email or phone.");
            log.info("Seed email exists: {}, seed phone exists: {}", emailExists, phoneExists);
            return;
        }

        User admin = User.builder()
                .phone(adminPhone)
                .name("Administrator")
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .isFirstLogin(true) // Forces password change on first login
                .isVerified(true)
                .build();

        userRepository.save(admin);
        log.info("=================================================");
        log.info("Default admin account seeded.");
        log.info("Phone   : {}", adminPhone);
        log.info("Email   : {}", adminEmail);
        log.info("Password: {} (CHANGE THIS IMMEDIATELY)", adminPassword);
        log.info("=================================================");
    }
}
