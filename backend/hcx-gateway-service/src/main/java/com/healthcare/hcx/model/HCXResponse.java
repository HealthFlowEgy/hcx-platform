package com.healthcare.hcx.model;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class HCXResponse {
    private String status;
    private HCXHeaders headers;
    private Object payload;
    private String errorCode;
    private String errorMessage;
    private Long timestamp;
    
    public static HCXResponse success(HCXHeaders headers, Object payload) {
        return HCXResponse.builder()
            .status("success")
            .headers(headers)
            .payload(payload)
            .timestamp(System.currentTimeMillis())
            .build();
    }
    
    public static HCXResponse error(String errorCode, String errorMessage) {
        return HCXResponse.builder()
            .status("error")
            .errorCode(errorCode)
            .errorMessage(errorMessage)
            .timestamp(System.currentTimeMillis())
            .build();
    }
}
