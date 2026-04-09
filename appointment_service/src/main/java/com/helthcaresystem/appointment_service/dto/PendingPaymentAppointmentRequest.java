package com.helthcaresystem.appointment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PendingPaymentAppointmentRequest extends AppointmentRequest {

    @NotBlank
    private String paymentSessionId;
}
