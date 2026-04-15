package com.medisync.symptom_checker_service.service;

import com.medisync.symptom_checker_service.dto.HealthResourceDto;
import com.medisync.symptom_checker_service.dto.SerperSearchRequest;
import com.medisync.symptom_checker_service.dto.SerperSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SerperSearchService {

    @Value("${serper.api.key}")
    private String apiKey;

    @Value("${serper.api.url}")
    private String serperUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<HealthResourceDto> searchTrustedResources(List<String> symptoms) {
        String query = buildTrustedMedicalQuery(symptoms);

        SerperSearchRequest requestBody = SerperSearchRequest.builder()
                .q(query)
                .gl("lk")
                .hl("en")
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-KEY", apiKey);

        HttpEntity<SerperSearchRequest> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<SerperSearchResponse> response = restTemplate.exchange(
                    serperUrl,
                    HttpMethod.POST,
                    entity,
                    SerperSearchResponse.class
            );

            SerperSearchResponse body = response.getBody();

            if (body == null || body.getOrganic() == null) {
                return Collections.emptyList();
            }

            return body.getOrganic().stream()
                    .filter(Objects::nonNull)
                    .limit(5)
                    .map(item -> HealthResourceDto.builder()
                            .title(item.getTitle())
                            .url(item.getLink())
                            .snippet(item.getSnippet())
                            .build())
                    .toList();

        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    private String buildTrustedMedicalQuery(List<String> symptoms) {
        String symptomText = String.join(" ", symptoms);
        return symptomText + " symptom guidance site:mayoclinic.org OR site:nhs.uk OR site:medlineplus.gov";
    }
}