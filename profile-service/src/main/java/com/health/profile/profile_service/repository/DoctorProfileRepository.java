package com.health.profile.profile_service.repository;

import com.health.profile.profile_service.entity.DoctorApprovalStatus;
import com.health.profile.profile_service.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUserIdAndIsDeletedFalse(Long userId);
    List<DoctorProfile> findByApprovalStatusAndIsDeletedFalse(DoctorApprovalStatus approvalStatus);
    List<DoctorProfile> findByIsDeletedFalse();
}

