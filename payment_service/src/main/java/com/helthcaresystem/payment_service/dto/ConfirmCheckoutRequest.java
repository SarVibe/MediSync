package com.helthcaresystem.payment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmCheckoutRequest {

    @NotBlank
    private String sessionId;
}
