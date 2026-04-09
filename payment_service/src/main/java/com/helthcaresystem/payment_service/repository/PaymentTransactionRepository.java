package com.helthcaresystem.payment_service.repository;

import com.helthcaresystem.payment_service.model.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByStripeSessionId(String stripeSessionId);
    Optional<PaymentTransaction> findTopByAppointmentIdAndStatusOrderByCreatedAtDesc(Long appointmentId, PaymentTransaction.Status status);
    Optional<PaymentTransaction> findTopByStripeSessionIdAndStatusOrderByCreatedAtDesc(String stripeSessionId, PaymentTransaction.Status status);

    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();

    List<PaymentTransaction> findByStatusOrderByCreatedAtDesc(PaymentTransaction.Status status);
}
