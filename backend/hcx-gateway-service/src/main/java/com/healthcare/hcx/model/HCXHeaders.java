package com.healthcare.hcx.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HCXHeaders {
    private String apiCallId;
    private String correlationId;
    private Long timestamp;
    private String senderCode;
    private String recipientCode;
    private String status;
    private String protocolVersion;
    private ErrorDetails errorDetails;
    private DebugInfo debugDetails;
}
