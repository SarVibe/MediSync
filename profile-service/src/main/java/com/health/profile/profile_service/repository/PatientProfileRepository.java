package com.health.profile.profile_service.repository;

import com.health.profile.profile_service.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUserIdAndIsDeletedFalse(Long userId);
    List<PatientProfile> findByUserIdInAndIsDeletedFalse(java.util.Collection<Long> userIds);
    List<PatientProfile> findByIsDeletedFalse();
}

