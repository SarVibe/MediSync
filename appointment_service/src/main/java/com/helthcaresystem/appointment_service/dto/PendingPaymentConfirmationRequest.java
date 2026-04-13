package com.helthcaresystem.appointment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PendingPaymentConfirmationRequest {

    @NotBlank
    private String paymentSessionId;
}
