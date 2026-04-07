package com.health.auth.auth_service.repository;

import com.health.auth.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    List<User> findByApprovalStatus(User.DoctorRequestStatus approvalStatus);

    long deleteByIsVerifiedFalseAndCreatedAtBefore(LocalDateTime cutoff);
}