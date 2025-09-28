package com.healthcare.hcx.model;

import lombok.Data;
import java.util.List;

@Data
public class ClaimSubmissionRequestDTO {
    private String patientId;
    private String payorCode;
    private String recipientCode;
    private String serviceDate;
    private List<DiagnosisInfo> diagnosis;
    private List<ProcedureInfo> procedures;
    private Double totalAmount;
    private String[] supportingDocuments;
    private Object claim; // FHIR Claim resource
}
