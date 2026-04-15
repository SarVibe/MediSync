package com.medisync.symptom_checker_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerperSearchRequest {
    private String q;
    private String gl;
    private String hl;
}
