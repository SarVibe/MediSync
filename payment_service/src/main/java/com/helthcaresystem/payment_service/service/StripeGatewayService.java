package com.helthcaresystem.payment_service.service;

import com.helthcaresystem.payment_service.dto.CreateCheckoutSessionRequest;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeGatewayService {

    private final String stripeSecretKey;
    private final String currency;

    public StripeGatewayService(@Value("${stripe.secret-key}") String stripeSecretKey,
                                @Value("${stripe.currency:inr}") String currency) {
        this.stripeSecretKey = stripeSecretKey;
        this.currency = currency;
    }

    @PostConstruct
    public void initializeStripe() {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            return;
        }
        Stripe.apiKey = stripeSecretKey;
    }

    public PaymentIntent createPaymentIntent(CreateCheckoutSessionRequest request,
                                             Long amountMinor,
                                             Long patientId) throws StripeException {
        validateStripeConfiguration();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountMinor)
                .setCurrency(currency)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .putMetadata("patientId", String.valueOf(patientId))
                .putMetadata("doctorId", String.valueOf(request.getDoctorId()))
                .putMetadata("doctorName", request.getDoctorName())
                .putMetadata("doctorSpecialization", safe(request.getDoctorSpecialization()))
                .putMetadata("date", request.getDate())
                .putMetadata("time", request.getTime())
                .putMetadata("reason", request.getReason())
                .setDescription("Doctor appointment consultation payment")
                .build();

        return PaymentIntent.create(params);
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        validateStripeConfiguration();
        return PaymentIntent.retrieve(paymentIntentId);
    }

    private void validateStripeConfiguration() {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new IllegalArgumentException("Stripe secret key is not configured.");
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
