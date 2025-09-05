package org.swasth.hcx.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HcxIntegrationServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private HcxIntegrationService hcxIntegrationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(hcxIntegrationService, "egyptianKycRegistryUrl", "http://localhost:8082");
        ReflectionTestUtils.setField(hcxIntegrationService, "apiKey", "test-api-key");
    }

    @Test
    void testLookupBeneficiary_Success() {
        // Given
        String eshicNumber = "EG123456789";
        Map<String, Object> expectedResponse = Map.of(
            "eshicNumber", eshicNumber,
            "name", "Test Beneficiary",
            "status", "ACTIVE"
        );

        when(restTemplate.exchange(anyString(), any(), any(), eq(Map.class)))
            .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        // When
        Map<String, Object> result = hcxIntegrationService.lookupBeneficiary(eshicNumber);

        // Then
        assertNotNull(result);
        assertEquals(eshicNumber, result.get("eshicNumber"));
        assertEquals("Test Beneficiary", result.get("name"));
        assertEquals("ACTIVE", result.get("status"));
    }

    @Test
    void testLookupBeneficiary_NotFound() {
        // Given
        String eshicNumber = "EG999999999";

        when(restTemplate.exchange(anyString(), any(), any(), eq(Map.class)))
            .thenReturn(new ResponseEntity<>(HttpStatus.NOT_FOUND));

        // When
        Map<String, Object> result = hcxIntegrationService.lookupBeneficiary(eshicNumber);

        // Then
        assertNull(result);
    }

    @Test
    void testVerifyEligibility_Eligible() {
        // Given
        String eshicNumber = "EG123456789";
        String payerCode = "PAYER001";
        Map<String, Object> response = Map.of("eligible", true);

        when(restTemplate.exchange(anyString(), any(), any(), eq(Map.class)))
            .thenReturn(new ResponseEntity<>(response, HttpStatus.OK));

        // When
        boolean result = hcxIntegrationService.verifyEligibility(eshicNumber, payerCode);

        // Then
        assertTrue(result);
    }

    @Test
    void testVerifyEligibility_NotEligible() {
        // Given
        String eshicNumber = "EG123456789";
        String payerCode = "PAYER001";
        Map<String, Object> response = Map.of("eligible", false);

        when(restTemplate.exchange(anyString(), any(), any(), eq(Map.class)))
            .thenReturn(new ResponseEntity<>(response, HttpStatus.OK));

        // When
        boolean result = hcxIntegrationService.verifyEligibility(eshicNumber, payerCode);

        // Then
        assertFalse(result);
    }

    @Test
    void testGetBeneficiaryEnrollments_Success() {
        // Given
        String eshicNumber = "EG123456789";
        Map<String, Object> expectedResponse = Map.of(
            "enrollments", Map.of(
                "PAYER001", "ACTIVE",
                "PAYER002", "INACTIVE"
            )
        );

        when(restTemplate.exchange(anyString(), any(), any(), eq(Map.class)))
            .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        // When
        Map<String, Object> result = hcxIntegrationService.getBeneficiaryEnrollments(eshicNumber);

        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("enrollments"));
    }

    @Test
    void testIsKycRegistryHealthy_Healthy() {
        // Given
        Map<String, Object> healthResponse = Map.of("status", "UP");

        when(restTemplate.getForEntity(anyString(), eq(Map.class)))
            .thenReturn(new ResponseEntity<>(healthResponse, HttpStatus.OK));

        // When
        boolean result = hcxIntegrationService.isKycRegistryHealthy();

        // Then
        assertTrue(result);
    }

    @Test
    void testIsKycRegistryHealthy_Unhealthy() {
        // Given
        when(restTemplate.getForEntity(anyString(), eq(Map.class)))
            .thenThrow(new RuntimeException("Connection failed"));

        // When
        boolean result = hcxIntegrationService.isKycRegistryHealthy();

        // Then
        assertFalse(result);
    }
}

