package com.helthcaresystem.payment_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePaymentConfigRequest {

    @NotNull
    @Min(1)
    private Long consultationFee;
}
