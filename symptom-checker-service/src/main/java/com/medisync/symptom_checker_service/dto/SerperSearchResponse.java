package com.medisync.symptom_checker_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class SerperSearchResponse {
    private List<OrganicResult> organic;

    @Data
    public static class OrganicResult {
        private String title;
        private String link;
        private String snippet;
    }
}