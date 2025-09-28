package com.healthcare.hcx.model;

import lombok.Data;

@Data
public class CoverageEligibilityRequestDTO {
    private String patientId;
    private String payorCode;
    private String recipientCode;
    private String serviceCategory;
    private String[] serviceCodes;
    private Object eligibilityRequest; // FHIR CoverageEligibilityRequest
}
