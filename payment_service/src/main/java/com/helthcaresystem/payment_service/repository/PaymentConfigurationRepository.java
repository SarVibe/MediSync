package com.helthcaresystem.payment_service.repository;

import com.helthcaresystem.payment_service.model.entity.PaymentConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentConfigurationRepository extends JpaRepository<PaymentConfiguration, Long> {
}
