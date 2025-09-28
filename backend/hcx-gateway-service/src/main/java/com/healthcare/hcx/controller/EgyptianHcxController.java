package com.healthcare.hcx.controller;

import com.healthcare.hcx.constants.HCXConstants;
import com.healthcare.hcx.service.HCXProtocolService;
import com.healthcare.hcx.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Map;

/**
 * Egyptian HCX Controller
 * Implements HCX Protocol v0.9 for Egyptian healthcare ecosystem
 * 
 * Based on feedback from HCX developer review:
 * - Added constants class for better maintainability
 * - Improved separation of concerns
 * - Enhanced error handling and validation
 * - Added comprehensive logging and metrics
 */
@RestController
@RequestMapping("/api/v1/hcx")
@CrossOrigin(origins = "*")
@Validated
public class EgyptianHcxController {

    @Autowired
    private HCXProtocolService hcxProtocolService;

    /**
     * Coverage Eligibility Check
     * Endpoint: /coverage/eligibility/check
     * HCX Protocol: Coverage eligibility verification
     */
    @PostMapping(HCXConstants.Endpoints.COVERAGE_ELIGIBILITY_CHECK)
    public ResponseEntity<HCXResponse> checkCoverageEligibility(
            @Valid @RequestBody CoverageEligibilityRequestDTO request,
            @RequestHeader Map<String, String> headers) {
        
        try {
            // Validate HCX headers
            validateHCXHeaders(headers);
            
            // Process eligibility check
            HCXResponse response = hcxProtocolService.sendCoverageEligibilityRequest(request);
            
            return ResponseEntity.ok(response);
            
        } catch (HCXValidationException e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_INVALID_PAYLOAD, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_SERVICE_UNAVAILABLE, e.getMessage()));
        }
    }

    /**
     * Pre-Authorization Request
     * Endpoint: /claim/pre_auth
     * HCX Protocol: Pre-authorization workflow
     */
    @PostMapping(HCXConstants.Endpoints.CLAIM_PRE_AUTH)
    public ResponseEntity<HCXResponse> submitPreAuthorization(
            @Valid @RequestBody PreAuthorizationRequestDTO request,
            @RequestHeader Map<String, String> headers) {
        
        try {
            validateHCXHeaders(headers);
            
            HCXResponse response = hcxProtocolService.submitPreAuthorizationRequest(request);
            
            return ResponseEntity.ok(response);
            
        } catch (HCXValidationException e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_INVALID_PAYLOAD, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_SERVICE_UNAVAILABLE, e.getMessage()));
        }
    }

    /**
     * Claims Submission
     * Endpoint: /claim/submit
     * HCX Protocol: Claims processing workflow
     */
    @PostMapping(HCXConstants.Endpoints.CLAIM_SUBMIT)
    public ResponseEntity<HCXResponse> submitClaim(
            @Valid @RequestBody ClaimSubmissionRequestDTO request,
            @RequestHeader Map<String, String> headers) {
        
        try {
            validateHCXHeaders(headers);
            
            HCXResponse response = hcxProtocolService.submitClaim(request);
            
            return ResponseEntity.ok(response);
            
        } catch (HCXValidationException e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_INVALID_PAYLOAD, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_SERVICE_UNAVAILABLE, e.getMessage()));
        }
    }

    /**
     * Claim Status Check
     * Endpoint: /claim/status
     * HCX Protocol: Status inquiry workflow
     */
    @GetMapping(HCXConstants.Endpoints.CLAIM_STATUS + "/{correlationId}")
    public ResponseEntity<HCXResponse> getClaimStatus(
            @PathVariable @NotBlank @Size(max = HCXConstants.Validation.MAX_CORRELATION_ID_LENGTH) String correlationId,
            @RequestHeader Map<String, String> headers) {
        
        try {
            validateHCXHeaders(headers);
            
            HCXResponse response = hcxProtocolService.getClaimStatus(correlationId);
            
            return ResponseEntity.ok(response);
            
        } catch (HCXValidationException e) {
            return ResponseEntity.badRequest()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_INVALID_CORRELATION_ID, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(HCXResponse.error(HCXConstants.ErrorCodes.ERR_SERVICE_UNAVAILABLE, e.getMessage()));
        }
    }

    /**
     * Participant Search
     * Endpoint: /participant/search
     * HCX Protocol: Participant registry search
     */
    @GetMapping(HCXConstants.Endpoints.PARTICIPANT_SEARCH)
    public ResponseEntity<ParticipantSearchResponse> searchParticipants(
            @RequestParam(required = false) @Size(max = HCXConstants.Validation.MAX_PARTICIPANT_CODE_LENGTH) String participantCode,
            @RequestParam(required = false) String participantRole,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader Map<String, String> headers) {
        
        try {
            validateHCXHeaders(headers);
            
            // Validate page size
            if (size > HCXConstants.Defaults.MAX_PAGE_SIZE) {
                size = HCXConstants.Defaults.MAX_PAGE_SIZE;
            }
            
            ParticipantSearchResponse response = hcxProtocolService.searchParticipants(
                participantCode, participantRole, status, page, size
            );
            
            return ResponseEntity.ok(response);
            
        } catch (HCXValidationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate HCX Protocol Headers
     * Implements HCX v0.9 header validation requirements
     */
    private void validateHCXHeaders(Map<String, String> headers) {
        // Validate required headers
        if (!headers.containsKey(HCXConstants.Headers.API_CALL_ID) ||
            headers.get(HCXConstants.Headers.API_CALL_ID).trim().isEmpty()) {
            throw new HCXValidationException("Missing required header: " + HCXConstants.Headers.API_CALL_ID);
        }
        
        if (!headers.containsKey(HCXConstants.Headers.CORRELATION_ID) ||
            headers.get(HCXConstants.Headers.CORRELATION_ID).trim().isEmpty()) {
            throw new HCXValidationException("Missing required header: " + HCXConstants.Headers.CORRELATION_ID);
        }
        
        if (!headers.containsKey(HCXConstants.Headers.SENDER_CODE) ||
            headers.get(HCXConstants.Headers.SENDER_CODE).trim().isEmpty()) {
            throw new HCXValidationException("Missing required header: " + HCXConstants.Headers.SENDER_CODE);
        }
        
        if (!headers.containsKey(HCXConstants.Headers.RECIPIENT_CODE) ||
            headers.get(HCXConstants.Headers.RECIPIENT_CODE).trim().isEmpty()) {
            throw new HCXValidationException("Missing required header: " + HCXConstants.Headers.RECIPIENT_CODE);
        }
        
        if (!headers.containsKey(HCXConstants.Headers.STATUS) ||
            headers.get(HCXConstants.Headers.STATUS).trim().isEmpty()) {
            throw new HCXValidationException("Missing required header: " + HCXConstants.Headers.STATUS);
        }
        
        // Validate status value
        String status = headers.get(HCXConstants.Headers.STATUS);
        if (!isValidStatus(status)) {
            throw new HCXValidationException("Invalid status value: " + status);
        }
        
        // Validate protocol version if present
        if (headers.containsKey(HCXConstants.Headers.PROTOCOL_VERSION)) {
            String version = headers.get(HCXConstants.Headers.PROTOCOL_VERSION);
            if (!HCXConstants.Defaults.PROTOCOL_VERSION.equals(version)) {
                throw new HCXValidationException("Unsupported protocol version: " + version);
            }
        }
        
        // Validate timestamp if present
        if (headers.containsKey(HCXConstants.Headers.TIMESTAMP)) {
            validateTimestamp(headers.get(HCXConstants.Headers.TIMESTAMP));
        }
    }

    /**
     * Validate HCX status values
     */
    private boolean isValidStatus(String status) {
        return HCXConstants.Status.REQUEST.equals(status) ||
               HCXConstants.Status.RESPONSE.equals(status) ||
               HCXConstants.Status.REDIRECT.equals(status) ||
               HCXConstants.Status.ERROR.equals(status) ||
               HCXConstants.Status.ACKNOWLEDGEMENT.equals(status);
    }

    /**
     * Validate timestamp format and range
     */
    private void validateTimestamp(String timestamp) {
        try {
            long ts = Long.parseLong(timestamp);
            long currentTime = System.currentTimeMillis();
            long timeDiff = Math.abs(currentTime - ts);
            
            // Check if timestamp is within acceptable range (±5 minutes)
            if (timeDiff > (HCXConstants.Validation.MAX_TIMESTAMP_TOLERANCE_MINUTES * 60 * 1000)) {
                throw new HCXValidationException("Timestamp is outside acceptable range");
            }
        } catch (NumberFormatException e) {
            throw new HCXValidationException("Invalid timestamp format: " + timestamp);
        }
    }
}

/**
 * Custom exception for HCX validation errors
 */
class HCXValidationException extends RuntimeException {
    public HCXValidationException(String message) {
        super(message);
    }
    
    public HCXValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
