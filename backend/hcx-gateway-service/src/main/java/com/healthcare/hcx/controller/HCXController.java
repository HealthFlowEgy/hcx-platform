package com.healthcare.hcx.controller;

import com.healthcare.hcx.service.HCXProtocolService;
import com.healthcare.hcx.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hcx")
@CrossOrigin(origins = "*")
public class HCXController {
    
    @Autowired
    private HCXProtocolService hcxService;
    
    @PostMapping("/coverage/eligibility/check")
    public ResponseEntity<HCXResponse> checkCoverageEligibility(
        @RequestBody CoverageEligibilityRequestDTO request
    ) {
        try {
            HCXResponse response = hcxService.sendCoverageEligibilityRequest(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error("REQUEST_ERROR", e.getMessage()));
        }
    }
    
    @PostMapping("/claim/pre_auth")
    public ResponseEntity<HCXResponse> submitPreAuthorization(
        @RequestBody PreAuthorizationRequestDTO request
    ) {
        try {
            HCXResponse response = hcxService.submitPreAuthorizationRequest(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error("REQUEST_ERROR", e.getMessage()));
        }
    }
    
    @PostMapping("/claim/submit")
    public ResponseEntity<HCXResponse> submitClaim(
        @RequestBody ClaimSubmissionRequestDTO request
    ) {
        try {
            HCXResponse response = hcxService.submitClaim(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error("REQUEST_ERROR", e.getMessage()));
        }
    }
    
    @GetMapping("/claim/status/{correlationId}")
    public ResponseEntity<HCXResponse> getClaimStatus(
        @PathVariable String correlationId
    ) {
        try {
            HCXResponse response = hcxService.getClaimStatus(correlationId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error("STATUS_ERROR", e.getMessage()));
        }
    }
    
    @GetMapping("/participants/search")
    public ResponseEntity<List<ParticipantInfo>> searchParticipants(
        @RequestParam(required = false) String participantCode,
        @RequestParam(required = false) String participantRole,
        @RequestParam(required = false) String status
    ) {
        try {
            List<ParticipantInfo> participants = hcxService.searchParticipants(
                participantCode, participantRole, status
            );
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("HCX Gateway Service is running");
    }
}
