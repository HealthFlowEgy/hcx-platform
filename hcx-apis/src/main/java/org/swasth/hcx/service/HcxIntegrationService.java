package org..hcx.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for integrating with Egyptian Healthcare KYC Registry
 * Handles beneficiary lookup and verification through HCX Protocol v0.9
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HcxIntegrationService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${hcx.egyptian.kyc.registry.url:http://localhost:8082}")
    private String egyptianKycRegistryUrl;
    
    @Value("${hcx.egyptian.kyc.registry.api-key:}")
    private String apiKey;
    
    /**
     * Lookup beneficiary information from Egyptian KYC Registry
     */
    public Map<String, Object> lookupBeneficiary(String eshicNumber) {
        try {
            log.info("Looking up beneficiary with ESHIC: {}", maskEshic(eshicNumber));
            
            String url = egyptianKycRegistryUrl + "/api/v1/beneficiaries/" + eshicNumber;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!apiKey.isEmpty()) {
                headers.set("X-API-Key", apiKey);
            }
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Successfully retrieved beneficiary information");
                return response.getBody();
            } else {
                log.warn("Failed to retrieve beneficiary information. Status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            log.error("Error looking up beneficiary with ESHIC: {}", maskEshic(eshicNumber), e);
            return null;
        }
    }
    
    /**
     * Verify beneficiary eligibility for coverage
     */
    public boolean verifyEligibility(String eshicNumber, String payerCode) {
        try {
            log.info("Verifying eligibility for ESHIC: {} with payer: {}", 
                maskEshic(eshicNumber), payerCode);
            
            String url = egyptianKycRegistryUrl + "/api/v1/enrollments/verify";
            
            Map<String, String> request = Map.of(
                "eshicNumber", eshicNumber,
                "payerCode", payerCode
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!apiKey.isEmpty()) {
                headers.set("X-API-Key", apiKey);
            }
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Boolean eligible = (Boolean) response.getBody().get("eligible");
                log.info("Eligibility verification result: {}", eligible);
                return Boolean.TRUE.equals(eligible);
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("Error verifying eligibility for ESHIC: {}", maskEshic(eshicNumber), e);
            return false;
        }
    }
    
    /**
     * Get beneficiary enrollment information
     */
    public Map<String, Object> getBeneficiaryEnrollments(String eshicNumber) {
        try {
            log.info("Getting enrollments for ESHIC: {}", maskEshic(eshicNumber));
            
            String url = egyptianKycRegistryUrl + "/api/v1/enrollments/beneficiary/" + eshicNumber;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!apiKey.isEmpty()) {
                headers.set("X-API-Key", apiKey);
            }
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Successfully retrieved enrollment information");
                return response.getBody();
            }
            
            return null;
            
        } catch (Exception e) {
            log.error("Error getting enrollments for ESHIC: {}", maskEshic(eshicNumber), e);
            return null;
        }
    }
    
    /**
     * Health check for Egyptian KYC Registry connectivity
     */
    public boolean isKycRegistryHealthy() {
        try {
            String url = egyptianKycRegistryUrl + "/actuator/health";
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String status = (String) response.getBody().get("status");
                return "UP".equals(status);
            }
            
            return false;
            
        } catch (Exception e) {
            log.warn("Egyptian KYC Registry health check failed", e);
            return false;
        }
    }
    
    private String maskEshic(String eshic) {
        if (eshic == null || eshic.length() < 4) {
            return "****";
        }
        return eshic.substring(0, 2) + "****" + eshic.substring(eshic.length() - 2);
    }
}

