package com.helthcaresystem.appointment_service.dto;

import lombok.Data;

@Data
public class RescheduleRequest {
    private String newDateTime;
}