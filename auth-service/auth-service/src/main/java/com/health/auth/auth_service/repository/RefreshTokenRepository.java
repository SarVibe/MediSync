package com.health.auth.auth_service.repository;

import com.health.auth.auth_service.entity.RefreshToken;
import com.health.auth.auth_service.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    List<RefreshToken> findAllByUser(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByTokenJti(String tokenJti);

    Optional<RefreshToken> findByUserAndTokenJti(User user, String tokenJti);

    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken r SET r.revokedAt = :now WHERE r.user = :user AND r.revokedAt IS NULL")
    void revokeAllByUser(User user, LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.user = :user")
    void deleteAllByUser(User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now")
    void deleteAllExpired(LocalDateTime now);
}
