package com.health.auth.auth_service.service;

import com.health.auth.auth_service.entity.User;
import com.health.auth.auth_service.exception.AuthException;
import com.health.auth.auth_service.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private OtpService otpService;

    @Mock
    private ClientProfileService clientProfileService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    @Test
    void createUser_shouldFailWithConflict_whenPhoneAlreadyExists() {
        when(userRepository.existsByEmail("newadmin@test.com")).thenReturn(false);
        when(userRepository.existsByPhone("+94712345678")).thenReturn(true);

        AuthException ex = assertThrows(AuthException.class, () -> adminService.createUser(
                "newadmin@test.com",
                "+94712345678",
                "New Admin",
                User.Role.ADMIN,
                "Temp@1234"
        ));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("Phone number already in use.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_shouldPersistNormalizedFieldsIncludingPhone() {
        when(userRepository.existsByEmail("newadmin@test.com")).thenReturn(false);
        when(userRepository.existsByPhone("+94712345678")).thenReturn(false);
        when(passwordEncoder.encode("Temp@1234")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(99L);
            return user;
        });
        when(clientProfileService.initializeProfile(99L, "New Admin", User.Role.ADMIN)).thenReturn(null);

        User created = adminService.createUser(
                " NewAdmin@Test.com ",
                " +94712345678 ",
                " New Admin ",
                User.Role.ADMIN,
                "Temp@1234"
        );

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User saved = userCaptor.getValue();
        assertEquals("newadmin@test.com", saved.getEmail());
        assertEquals("+94712345678", saved.getPhone());
        assertEquals("New Admin", saved.getName());
        assertEquals(User.Role.ADMIN, saved.getRole());
        assertEquals("encoded", saved.getPasswordHash());

        assertEquals(99L, created.getId());
    }

    @Test
    void approveDoctor_shouldSendSmsWithDoctorActualName() {
        User doctor = User.builder()
                .id(55L)
                .phone("+94710000001")
                .name("  Dr Amal  ")
                .role(User.Role.PATIENT)
                .status(User.UserStatus.PENDING)
                .approvalStatus(User.DoctorRequestStatus.PENDING)
                .build();

        when(userRepository.findById(55L)).thenReturn(Optional.of(doctor));

        adminService.approveDoctor(55L);

        verify(otpService).sendDoctorApprovalSms("+94710000001", "Dr Amal");
    }

    @Test
    void rejectDoctor_shouldFallbackToDoctorWhenNameBlank() {
        User doctor = User.builder()
                .id(56L)
                .phone("+94710000002")
                .name("   ")
                .role(User.Role.PATIENT)
                .status(User.UserStatus.PENDING)
                .approvalStatus(User.DoctorRequestStatus.PENDING)
                .build();

        when(userRepository.findById(56L)).thenReturn(Optional.of(doctor));

        adminService.rejectDoctor(56L, "Insufficient documents");

        verify(otpService).sendDoctorRejectionSms("+94710000002", "Doctor", "Insufficient documents");
    }
}

