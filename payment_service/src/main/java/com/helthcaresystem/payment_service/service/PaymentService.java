package com.helthcaresystem.payment_service.service;

import com.helthcaresystem.payment_service.client.AppointmentClient;
import com.helthcaresystem.payment_service.dto.CheckoutSessionResponse;
import com.helthcaresystem.payment_service.dto.ConfirmCheckoutRequest;
import com.helthcaresystem.payment_service.dto.CreateCheckoutSessionRequest;
import com.helthcaresystem.payment_service.dto.PaymentConfigResponse;
import com.helthcaresystem.payment_service.dto.PaymentTransactionResponse;
import com.helthcaresystem.payment_service.dto.UpdatePaymentConfigRequest;
import com.helthcaresystem.payment_service.model.entity.PaymentConfiguration;
import com.helthcaresystem.payment_service.model.entity.PaymentTransaction;
import com.helthcaresystem.payment_service.repository.PaymentConfigurationRepository;
import com.helthcaresystem.payment_service.repository.PaymentTransactionRepository;
import com.helthcaresystem.payment_service.security.AuthenticatedUser;
import com.stripe.model.PaymentIntent;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Long CONFIG_ID = 1L;

    private final PaymentConfigurationRepository paymentConfigurationRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final StripeGatewayService stripeGatewayService;
    private final AppointmentClient appointmentClient;

    @Value("${payment.default-consultation-fee:500}")
    private Long defaultConsultationFee;

    @Value("${stripe.currency:inr}")
    private String defaultCurrency;

    @Transactional(readOnly = true)
    public PaymentConfigResponse getPaymentConfig() {
        return toConfigResponse(getOrCreateConfig());
    }

    @Transactional
    public PaymentConfigResponse updatePaymentConfig(UpdatePaymentConfigRequest request, AuthenticatedUser user) {
        requireAdmin(user);

        PaymentConfiguration configuration = getOrCreateConfig();
        configuration.setConsultationFeeMinor(toMinorUnit(request.getConsultationFee()));
        paymentConfigurationRepository.save(configuration);
        return toConfigResponse(configuration);
    }

    @Transactional
    public CheckoutSessionResponse createCheckoutSession(CreateCheckoutSessionRequest request,
                                                         AuthenticatedUser user,
                                                         String authHeader) throws StripeException {
        requirePatient(user);

        PaymentConfiguration configuration = getOrCreateConfig();
        Long amountMinor = configuration.getConsultationFeeMinor();

        PaymentIntent paymentIntent = stripeGatewayService.createPaymentIntent(request, amountMinor, user.userId());

        AppointmentClient.CreatePendingAppointmentRequest appointmentRequest = new AppointmentClient.CreatePendingAppointmentRequest();
        appointmentRequest.setDoctorId(request.getDoctorId());
        appointmentRequest.setReason(request.getReason().trim());
        appointmentRequest.setDate(request.getDate());
        appointmentRequest.setTime(request.getTime());
        appointmentRequest.setPaymentSessionId(paymentIntent.getId());
        appointmentClient.createPendingPaymentAppointment(authHeader, appointmentRequest);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setStripeSessionId(paymentIntent.getId());
        transaction.setStripePaymentIntentId(paymentIntent.getId());
        transaction.setPatientId(user.userId());
        transaction.setDoctorId(request.getDoctorId());
        transaction.setDoctorName(request.getDoctorName().trim());
        transaction.setDoctorSpecialization(request.getDoctorSpecialization());
        transaction.setAppointmentDate(request.getDate());
        transaction.setAppointmentTime(request.getTime());
        transaction.setReason(request.getReason().trim());
        transaction.setAmountMinor(amountMinor);
        transaction.setCurrency(configuration.getCurrency());
        transaction.setStatus(PaymentTransaction.Status.PENDING);
        paymentTransactionRepository.save(transaction);

        return CheckoutSessionResponse.builder()
                .sessionId(paymentIntent.getId())
                .paymentIntentId(paymentIntent.getId())
                .clientSecret(paymentIntent.getClientSecret())
                .amountMinor(amountMinor)
                .amount(amountMinor / 100L)
                .currency(configuration.getCurrency())
                .build();
    }

    @Transactional
    public PaymentTransactionResponse confirmCheckout(ConfirmCheckoutRequest request,
                                                      AuthenticatedUser user,
                                                      String authHeader) throws StripeException {
        requirePatient(user);

        PaymentTransaction transaction = getTransactionBySessionId(request.getSessionId());
        if (!transaction.getPatientId().equals(user.userId())) {
            throw new AccessDeniedException("You are not allowed to confirm this payment.");
        }
        if (transaction.getStatus() == PaymentTransaction.Status.PAID && transaction.getAppointmentId() != null) {
            return PaymentTransactionResponse.fromEntity(transaction);
        }

        PaymentIntent paymentIntent = stripeGatewayService.retrievePaymentIntent(request.getSessionId());
        validatePaidPaymentIntent(paymentIntent, user.userId());

        AppointmentClient.ConfirmPendingAppointmentRequest appointmentRequest = new AppointmentClient.ConfirmPendingAppointmentRequest();
        appointmentRequest.setPaymentSessionId(request.getSessionId());
        AppointmentClient.AppointmentPayload appointment =
                appointmentClient.confirmPendingPaymentAppointment(authHeader, appointmentRequest);

        transaction.setAppointmentId(appointment.getId());
        transaction.setStripePaymentIntentId(paymentIntent.getId());
        transaction.setStatus(PaymentTransaction.Status.PAID);
        transaction.setFailureReason(null);
        transaction.setPaidAt(LocalDateTime.now());
        paymentTransactionRepository.save(transaction);

        return PaymentTransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public PaymentTransactionResponse cancelCheckout(ConfirmCheckoutRequest request,
                                                     AuthenticatedUser user,
                                                     String authHeader) {
        requirePatient(user);

        PaymentTransaction transaction = getTransactionBySessionId(request.getSessionId());
        if (!transaction.getPatientId().equals(user.userId())) {
            throw new AccessDeniedException("You are not allowed to cancel this payment.");
        }
        if (transaction.getStatus() == PaymentTransaction.Status.PAID) {
            return PaymentTransactionResponse.fromEntity(transaction);
        }

        AppointmentClient.ConfirmPendingAppointmentRequest appointmentRequest = new AppointmentClient.ConfirmPendingAppointmentRequest();
        appointmentRequest.setPaymentSessionId(request.getSessionId());
        appointmentClient.cancelPendingPaymentAppointment(authHeader, appointmentRequest);

        transaction.setStatus(PaymentTransaction.Status.CANCELLED);
        transaction.setFailureReason("Checkout cancelled before payment completion.");
        paymentTransactionRepository.save(transaction);

        return PaymentTransactionResponse.fromEntity(transaction);
    }

    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getTransactions(String status, AuthenticatedUser user) {
        requireAdmin(user);

        List<PaymentTransaction> transactions;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            transactions = paymentTransactionRepository.findAllByOrderByCreatedAtDesc();
        } else {
            PaymentTransaction.Status resolvedStatus = PaymentTransaction.Status.valueOf(status.trim().toUpperCase(Locale.ROOT));
            transactions = paymentTransactionRepository.findByStatusOrderByCreatedAtDesc(resolvedStatus);
        }

        return transactions.stream()
                .map(PaymentTransactionResponse::fromEntity)
                .toList();
    }

    private PaymentTransaction getTransactionBySessionId(String sessionId) {
        return paymentTransactionRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Payment session not found."));
    }

    private void validatePaidPaymentIntent(PaymentIntent paymentIntent, Long patientId) {
        if (paymentIntent == null) {
            throw new IllegalArgumentException("Stripe payment intent not found.");
        }
        String metadataPatientId = paymentIntent.getMetadata() == null ? null : paymentIntent.getMetadata().get("patientId");
        if (metadataPatientId == null || !metadataPatientId.equals(String.valueOf(patientId))) {
            throw new AccessDeniedException("This payment session does not belong to the current patient.");
        }
        if (!"succeeded".equalsIgnoreCase(paymentIntent.getStatus())) {
            throw new IllegalArgumentException("Payment is not completed yet.");
        }
    }

    private PaymentConfiguration getOrCreateConfig() {
        return paymentConfigurationRepository.findById(CONFIG_ID)
                .map(configuration -> {
                    if (configuration.getCurrency() == null
                            || !defaultCurrency.equalsIgnoreCase(configuration.getCurrency())) {
                        configuration.setCurrency(defaultCurrency.toLowerCase(Locale.ROOT));
                        return paymentConfigurationRepository.save(configuration);
                    }
                    return configuration;
                })
                .orElseGet(() -> {
                    PaymentConfiguration config = new PaymentConfiguration();
                    config.setId(CONFIG_ID);
                    config.setConsultationFeeMinor(toMinorUnit(defaultConsultationFee));
                    config.setCurrency(defaultCurrency.toLowerCase(Locale.ROOT));
                    return paymentConfigurationRepository.save(config);
                });
    }

    private PaymentConfigResponse toConfigResponse(PaymentConfiguration configuration) {
        return PaymentConfigResponse.builder()
                .consultationFee(configuration.getConsultationFeeMinor() / 100L)
                .consultationFeeMinor(configuration.getConsultationFeeMinor())
                .currency(configuration.getCurrency())
                .build();
    }

    private Long toMinorUnit(Long amount) {
        if (amount == null || amount < 1) {
            throw new IllegalArgumentException("Consultation fee must be at least Rs 1.");
        }
        return amount * 100L;
    }

    private void requirePatient(AuthenticatedUser user) {
        if (!user.hasRole("PATIENT")) {
            throw new AccessDeniedException("Only patients can perform this action.");
        }
    }

    private void requireAdmin(AuthenticatedUser user) {
        if (!user.hasRole("ADMIN")) {
            throw new AccessDeniedException("Only admins can perform this action.");
        }
    }
}
