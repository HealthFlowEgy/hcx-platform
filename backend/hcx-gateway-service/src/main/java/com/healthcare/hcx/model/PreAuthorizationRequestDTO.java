package com.healthcare.hcx.model;

import lombok.Data;
import java.util.List;

@Data
public class PreAuthorizationRequestDTO {
    private String patientId;
    private String payorCode;
    private String recipientCode;
    private List<DiagnosisInfo> diagnosis;
    private List<ProcedureInfo> procedures;
    private Double estimatedCost;
    private Object claim; // FHIR Claim resource
}

@Data
class DiagnosisInfo {
    private String code;
    private String description;
    private String type;
}

@Data
class ProcedureInfo {
    private String code;
    private String description;
    private Integer quantity;
    private Double unitPrice;
}
