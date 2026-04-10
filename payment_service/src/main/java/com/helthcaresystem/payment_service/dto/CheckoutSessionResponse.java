package com.helthcaresystem.payment_service.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CheckoutSessionResponse {
    String sessionId;
    String paymentIntentId;
    String clientSecret;
    Long amountMinor;
    Long amount;
    String currency;
}
