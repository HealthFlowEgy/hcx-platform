package com.healthcare.hcx.service;

import com.healthcare.hcx.model.HCXHeaders;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

@Service
public class HCXHeaderService {
    
    @Value("${hcx.participant.code}")
    private String senderCode;
    
    public HCXHeaders createHeaders(String recipientCode, String status, String correlationId) {
        return HCXHeaders.builder()
            .apiCallId(UUID.randomUUID().toString())
            .correlationId(correlationId)
            .timestamp(System.currentTimeMillis())
            .senderCode(senderCode)
            .recipientCode(recipientCode)
            .status(status)
            .protocolVersion("0.9")
            .build();
    }
    
    public HCXHeaders createStatusHeaders(String correlationId) {
        return HCXHeaders.builder()
            .apiCallId(UUID.randomUUID().toString())
            .correlationId(correlationId)
            .timestamp(System.currentTimeMillis())
            .senderCode(senderCode)
            .status("request")
            .protocolVersion("0.9")
            .build();
    }
    
    public boolean validateHeaders(HCXHeaders headers) {
        return headers != null &&
               headers.getApiCallId() != null &&
               headers.getCorrelationId() != null &&
               headers.getSenderCode() != null &&
               headers.getRecipientCode() != null &&
               headers.getStatus() != null;
    }
}
