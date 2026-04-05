package com.health.auth.auth_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter // Lombok annotation to generate getters for all fields
@Setter // Lombok annotation to generate setters for all fields
@NoArgsConstructor // Lombok annotation to generate a no-args constructor
@AllArgsConstructor // Lombok annotation to generate a constructor with all fields
@Builder // Lombok annotation to generate a builder for the class

public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Stored as a one-way hash; never store raw refresh token
    @Column(nullable = false, unique = true, length = 512)
    private String token;

    // JWT ID (jti) is used for constant-time DB lookups during rotation/revocation.
    @Column(name = "token_jti", nullable = false, unique = true, length = 64)
    private String tokenJti;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isRevokedOrUsed() {
        return this.revokedAt != null || this.usedAt != null;
    }
}