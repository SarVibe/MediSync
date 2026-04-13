package com.helthcaresystem.payment_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import lombok.Data;

@Data
public class UpdatePaymentConfigRequest {

    @NotNull
    @Min(1)
    private Long consultationFee;

    @NotNull
    private Boolean autoRefundEnabled;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer refundPercentage;
}
