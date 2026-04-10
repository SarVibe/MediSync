package com.helthcaresystem.payment_service.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PaymentConfigResponse {
    Long consultationFee;
    Long consultationFeeMinor;
    String currency;
    Boolean autoRefundEnabled;
    Integer refundPercentage;
}
