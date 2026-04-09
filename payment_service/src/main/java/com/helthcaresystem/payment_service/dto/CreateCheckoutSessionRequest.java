package com.helthcaresystem.payment_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCheckoutSessionRequest {

    @NotNull
    private Long doctorId;

    @NotBlank
    private String doctorName;

    private String doctorSpecialization;

    @NotBlank
    private String date;

    @NotBlank
    private String time;

    @NotBlank
    private String reason;

}
