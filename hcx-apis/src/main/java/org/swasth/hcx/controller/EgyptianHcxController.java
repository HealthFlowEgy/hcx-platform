package org..hcx.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org..hcx.service.HcxIntegrationService;

import java.util.Map;

/**
 * Controller for Egyptian HCX specific endpoints
 * Handles integration with Egyptian Healthcare KYC Registry
 */
@RestController
@RequestMapping("/v0.9/egyptian")
@RequiredArgsConstructor
@Slf4j
public class EgyptianHcxController {
    
    private final HcxIntegrationService hcxIntegrationService;
    
    /**
     * Lookup beneficiary information by ESHIC number
     */
    @GetMapping("/beneficiary/lookup/{eshicNumber}")
    public ResponseEntity<Map<String, Object>> lookupBeneficiary(
            @PathVariable String eshicNumber) {
        
        log.info("Received beneficiary lookup request for ESHIC: {}", 
            maskEshic(eshicNumber));
        
        Map<String, Object> beneficiary = hcxIntegrationService.lookupBeneficiary(eshicNumber);
        
        if (beneficiary != null) {
            return ResponseEntity.ok(beneficiary);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Verify beneficiary eligibility for coverage
     */
    @PostMapping("/beneficiary/verify-eligibility")
    public ResponseEntity<Map<String, Object>> verifyEligibility(
            @RequestBody Map<String, String> request) {
        
        String eshicNumber = request.get("eshicNumber");
        String payerCode = request.get("payerCode");
        
        log.info("Received eligibility verification request for ESHIC: {} and payer: {}", 
            maskEshic(eshicNumber), payerCode);
        
        boolean eligible = hcxIntegrationService.verifyEligibility(eshicNumber, payerCode);
        
        return ResponseEntity.ok(Map.of(
            "eshicNumber", eshicNumber,
            "payerCode", payerCode,
            "eligible", eligible,
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    /**
     * Get beneficiary enrollment information
     */
    @GetMapping("/beneficiary/enrollments/{eshicNumber}")
    public ResponseEntity<Map<String, Object>> getBeneficiaryEnrollments(
            @PathVariable String eshicNumber) {
        
        log.info("Received enrollment lookup request for ESHIC: {}", 
            maskEshic(eshicNumber));
        
        Map<String, Object> enrollments = hcxIntegrationService.getBeneficiaryEnrollments(eshicNumber);
        
        if (enrollments != null) {
            return ResponseEntity.ok(enrollments);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Health check for Egyptian KYC Registry connectivity
     */
    @GetMapping("/health/kyc-registry")
    public ResponseEntity<Map<String, Object>> checkKycRegistryHealth() {
        
        boolean healthy = hcxIntegrationService.isKycRegistryHealthy();
        
        return ResponseEntity.ok(Map.of(
            "service", "Egyptian KYC Registry",
            "status", healthy ? "UP" : "DOWN",
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    private String maskEshic(String eshic) {
        if (eshic == null || eshic.length() < 4) {
            return "****";
        }
        return eshic.substring(0, 2) + "****" + eshic.substring(eshic.length() - 2);
    }
}

