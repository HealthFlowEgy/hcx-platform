package org.swasth.hcx.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.swasth.hcx.service.HcxIntegrationService;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EgyptianHcxController.class)
class EgyptianHcxControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HcxIntegrationService hcxIntegrationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testLookupBeneficiary_Success() throws Exception {
        // Given
        String eshicNumber = "EG123456789";
        Map<String, Object> beneficiaryData = Map.of(
            "eshicNumber", eshicNumber,
            "name", "Test Beneficiary",
            "status", "ACTIVE"
        );

        when(hcxIntegrationService.lookupBeneficiary(eshicNumber))
            .thenReturn(beneficiaryData);

        // When & Then
        mockMvc.perform(get("/v0.9/egyptian/beneficiary/lookup/{eshicNumber}", eshicNumber))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.eshicNumber").value(eshicNumber))
            .andExpect(jsonPath("$.name").value("Test Beneficiary"))
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testLookupBeneficiary_NotFound() throws Exception {
        // Given
        String eshicNumber = "EG999999999";

        when(hcxIntegrationService.lookupBeneficiary(eshicNumber))
            .thenReturn(null);

        // When & Then
        mockMvc.perform(get("/v0.9/egyptian/beneficiary/lookup/{eshicNumber}", eshicNumber))
            .andExpect(status().isNotFound());
    }

    @Test
    void testVerifyEligibility_Eligible() throws Exception {
        // Given
        String eshicNumber = "EG123456789";
        String payerCode = "PAYER001";
        Map<String, String> request = Map.of(
            "eshicNumber", eshicNumber,
            "payerCode", payerCode
        );

        when(hcxIntegrationService.verifyEligibility(eshicNumber, payerCode))
            .thenReturn(true);

        // When & Then
        mockMvc.perform(post("/v0.9/egyptian/beneficiary/verify-eligibility")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.eshicNumber").value(eshicNumber))
            .andExpect(jsonPath("$.payerCode").value(payerCode))
            .andExpect(jsonPath("$.eligible").value(true));
    }

    @Test
    void testVerifyEligibility_NotEligible() throws Exception {
        // Given
        String eshicNumber = "EG123456789";
        String payerCode = "PAYER001";
        Map<String, String> request = Map.of(
            "eshicNumber", eshicNumber,
            "payerCode", payerCode
        );

        when(hcxIntegrationService.verifyEligibility(eshicNumber, payerCode))
            .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/v0.9/egyptian/beneficiary/verify-eligibility")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.eshicNumber").value(eshicNumber))
            .andExpect(jsonPath("$.payerCode").value(payerCode))
            .andExpect(jsonPath("$.eligible").value(false));
    }

    @Test
    void testGetBeneficiaryEnrollments_Success() throws Exception {
        // Given
        String eshicNumber = "EG123456789";
        Map<String, Object> enrollmentData = Map.of(
            "enrollments", Map.of(
                "PAYER001", "ACTIVE",
                "PAYER002", "INACTIVE"
            )
        );

        when(hcxIntegrationService.getBeneficiaryEnrollments(eshicNumber))
            .thenReturn(enrollmentData);

        // When & Then
        mockMvc.perform(get("/v0.9/egyptian/beneficiary/enrollments/{eshicNumber}", eshicNumber))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.enrollments").exists());
    }

    @Test
    void testGetBeneficiaryEnrollments_NotFound() throws Exception {
        // Given
        String eshicNumber = "EG999999999";

        when(hcxIntegrationService.getBeneficiaryEnrollments(eshicNumber))
            .thenReturn(null);

        // When & Then
        mockMvc.perform(get("/v0.9/egyptian/beneficiary/enrollments/{eshicNumber}", eshicNumber))
            .andExpect(status().isNotFound());
    }

    @Test
    void testCheckKycRegistryHealth_Healthy() throws Exception {
        // Given
        when(hcxIntegrationService.isKycRegistryHealthy())
            .thenReturn(true);

        // When & Then
        mockMvc.perform(get("/v0.9/egyptian/health/kyc-registry"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.service").value("Egyptian KYC Registry"))
            .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void testCheckKycRegistryHealth_Unhealthy() throws Exception {
        // Given
        when(hcxIntegrationService.isKycRegistryHealthy())
            .thenReturn(false);

        // When & Then
        mockMvc.perform(get("/v0.9/egyptian/health/kyc-registry"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.service").value("Egyptian KYC Registry"))
            .andExpect(jsonPath("$.status").value("DOWN"));
    }
}

