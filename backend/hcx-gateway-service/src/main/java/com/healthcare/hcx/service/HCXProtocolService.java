package com.healthcare.hcx.service;

import com.healthcare.hcx.model.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;
import java.util.Date;
import java.util.List;

@Service
public class HCXProtocolService {
    
    @Autowired
    private HCXHeaderService headerService;
    
    @Autowired
    private FHIRValidationService fhirValidator;
    
    @Autowired
    private HCXGatewayClient gatewayClient;
    
    @Value("${hcx.participant.code}")
    private String participantCode;
    
    public HCXResponse sendCoverageEligibilityRequest(
        CoverageEligibilityRequestDTO request
    ) {
        try {
            // 1. Validate FHIR resource
            ValidationResult validation = fhirValidator.validate(request.getEligibilityRequest());
            if (!validation.isValid()) {
                throw new InvalidFHIRResourceException(validation.getErrors());
            }
            
            // 2. Create HCX headers
            HCXHeaders headers = headerService.createHeaders(
                request.getRecipientCode(), 
                "request", 
                UUID.randomUUID().toString()
            );
            
            // 3. Create FHIR Bundle
            Bundle bundle = createBundle(request.getEligibilityRequest());
            
            // 4. Send to HCX Gateway
            return gatewayClient.send("/coverage/eligibility/check", headers, bundle);
            
        } catch (Exception e) {
            return HCXResponse.error("PROCESSING_ERROR", e.getMessage());
        }
    }
    
    public HCXResponse submitPreAuthorizationRequest(
        PreAuthorizationRequestDTO request
    ) {
        try {
            ValidationResult validation = fhirValidator.validate(request.getClaim());
            if (!validation.isValid()) {
                throw new InvalidFHIRResourceException(validation.getErrors());
            }
            
            HCXHeaders headers = headerService.createHeaders(
                request.getRecipientCode(),
                "request",
                UUID.randomUUID().toString()
            );
            
            Bundle bundle = createBundle(request.getClaim());
            return gatewayClient.send("/claim/pre_auth", headers, bundle);
            
        } catch (Exception e) {
            return HCXResponse.error("PROCESSING_ERROR", e.getMessage());
        }
    }
    
    public HCXResponse submitClaim(
        ClaimSubmissionRequestDTO request
    ) {
        try {
            ValidationResult validation = fhirValidator.validate(request.getClaim());
            if (!validation.isValid()) {
                throw new InvalidFHIRResourceException(validation.getErrors());
            }
            
            HCXHeaders headers = headerService.createHeaders(
                request.getRecipientCode(),
                "request", 
                UUID.randomUUID().toString()
            );
            
            Bundle bundle = createBundle(request.getClaim());
            return gatewayClient.send("/claim/submit", headers, bundle);
            
        } catch (Exception e) {
            return HCXResponse.error("PROCESSING_ERROR", e.getMessage());
        }
    }
    
    public HCXResponse getClaimStatus(String correlationId) {
        try {
            HCXHeaders headers = headerService.createStatusHeaders(correlationId);
            StatusRequest statusRequest = new StatusRequest(correlationId);
            
            return gatewayClient.send("/claim/status", headers, statusRequest);
            
        } catch (Exception e) {
            return HCXResponse.error("STATUS_ERROR", e.getMessage());
        }
    }
    
    public List<ParticipantInfo> searchParticipants(
        String participantCode, 
        String participantRole, 
        String status
    ) {
        try {
            return gatewayClient.searchParticipants(participantCode, participantRole, status);
        } catch (Exception e) {
            throw new HCXServiceException("Failed to search participants", e);
        }
    }
    
    private Bundle createBundle(Object resource) {
        Bundle bundle = new Bundle();
        bundle.setType(Bundle.BundleType.COLLECTION);
        bundle.addEntry().setResource((Resource) resource);
        bundle.setTimestamp(new Date());
        bundle.setId(UUID.randomUUID().toString());
        return bundle;
    }
}
