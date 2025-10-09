package io.hcx.platform.tests.unit;

import io.hcx.platform.service.ClaimService;
import io.hcx.platform.model.*;
import io.hcx.platform.repository.ClaimRepository;
import io.hcx.platform.exception.HCXException;
import io.hcx.platform.util.FHIRBundleBuilder;
import io.hcx.platform.auth.AuthenticationManager;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ClaimService
 * Tests claim submission, pre-authorization, and eligibility check operations
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ClaimService Unit Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;
    
    @Mock
    private AuthenticationManager authManager;
    
    @Mock
    private FHIRBundleBuilder bundleBuilder;
    
    @InjectMocks
    private ClaimService claimService;
    
    private ClaimSubmissionRequest testClaimRequest;
    private Claim testClaim;
    private String testClaimId;
    
    @BeforeEach
    void setUp() {
        testClaimId = UUID.randomUUID().toString();
        testClaimRequest = createTestClaimRequest();
        testClaim = createTestClaim();
    }
    
    @AfterEach
    void tearDown() {
        reset(claimRepository, authManager, bundleBuilder);
    }
    
    // ============================================
    // Claim Submission Tests
    // ============================================
    
    @Test
    @Order(1)
    @DisplayName("Should submit claim successfully")
    void testSubmitClaimSuccess() throws HCXException {
        // Arrange
        when(authManager.getAccessToken()).thenReturn("mock-jwt-token");
        when(bundleBuilder.buildClaimBundle(any())).thenReturn("fhir-bundle-json");
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);
        
        // Act
        ClaimSubmissionResponse response = claimService.submitClaim(testClaimRequest);
        
        // Assert
        assertNotNull(response);
        assertNotNull(response.getClaimId());
        assertEquals("SUBMITTED", response.getStatus());
        assertEquals("Claim submitted successfully", response.getMessage());
        
        verify(authManager, times(1)).getAccessToken();
        verify(bundleBuilder, times(1)).buildClaimBundle(any());
        verify(claimRepository, times(1)).save(any(Claim.class));
    }
    
    @Test
    @Order(2)
    @DisplayName("Should throw exception when authentication fails")
    void testSubmitClaimAuthenticationFailure() {
        // Arrange
        when(authManager.getAccessToken()).thenThrow(new HCXException("Authentication failed"));
        
        // Act & Assert
        HCXException exception = assertThrows(HCXException.class, () -> {
            claimService.submitClaim(testClaimRequest);
        });
        
        assertEquals("Authentication failed", exception.getMessage());
        verify(authManager, times(1)).getAccessToken();
        verify(claimRepository, never()).save(any());
    }
    
    @Test
    @Order(3)
    @DisplayName("Should validate claim request before submission")
    void testSubmitClaimValidation() {
        // Arrange
        ClaimSubmissionRequest invalidRequest = new ClaimSubmissionRequest();
        // Missing required fields
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            claimService.submitClaim(invalidRequest);
        });
        
        verify(claimRepository, never()).save(any());
    }
    
    @Test
    @Order(4)
    @DisplayName("Should handle duplicate claim submission")
    void testSubmitDuplicateClaim() throws HCXException {
        // Arrange
        when(claimRepository.findByProviderClaimId(anyString()))
            .thenReturn(Optional.of(testClaim));
        
        // Act & Assert
        HCXException exception = assertThrows(HCXException.class, () -> {
            claimService.submitClaim(testClaimRequest);
        });
        
        assertTrue(exception.getMessage().contains("duplicate"));
        verify(claimRepository, never()).save(any());
    }
    
    // ============================================
    // Pre-Authorization Tests
    // ============================================
    
    @Test
    @Order(5)
    @DisplayName("Should submit pre-authorization successfully")
    void testSubmitPreAuthSuccess() throws HCXException {
        // Arrange
        PreAuthRequest preAuthRequest = createTestPreAuthRequest();
        when(authManager.getAccessToken()).thenReturn("mock-jwt-token");
        when(bundleBuilder.buildPreAuthBundle(any())).thenReturn("fhir-preauth-bundle");
        
        PreAuth preAuth = new PreAuth();
        preAuth.setPreAuthId(UUID.randomUUID().toString());
        preAuth.setStatus("PENDING");
        when(claimRepository.savePreAuth(any())).thenReturn(preAuth);
        
        // Act
        PreAuthResponse response = claimService.submitPreAuth(preAuthRequest);
        
        // Assert
        assertNotNull(response);
        assertNotNull(response.getPreAuthId());
        assertEquals("PENDING", response.getStatus());
        
        verify(authManager, times(1)).getAccessToken();
        verify(bundleBuilder, times(1)).buildPreAuthBundle(any());
    }
    
    @Test
    @Order(6)
    @DisplayName("Should validate pre-auth request")
    void testSubmitPreAuthValidation() {
        // Arrange
        PreAuthRequest invalidRequest = new PreAuthRequest();
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            claimService.submitPreAuth(invalidRequest);
        });
    }
    
    // ============================================
    // Eligibility Check Tests
    // ============================================
    
    @Test
    @Order(7)
    @DisplayName("Should check eligibility successfully")
    void testCheckEligibilitySuccess() throws HCXException {
        // Arrange
        EligibilityCheckRequest eligibilityRequest = createTestEligibilityRequest();
        when(authManager.getAccessToken()).thenReturn("mock-jwt-token");
        when(bundleBuilder.buildEligibilityBundle(any())).thenReturn("fhir-eligibility-bundle");
        
        // Act
        EligibilityCheckResponse response = claimService.checkEligibility(eligibilityRequest);
        
        // Assert
        assertNotNull(response);
        assertTrue(response.isEligible());
        assertNotNull(response.getCoverageDetails());
        
        verify(authManager, times(1)).getAccessToken();
        verify(bundleBuilder, times(1)).buildEligibilityBundle(any());
    }
    
    @Test
    @Order(8)
    @DisplayName("Should return ineligible when coverage not found")
    void testCheckEligibilityNotCovered() throws HCXException {
        // Arrange
        EligibilityCheckRequest eligibilityRequest = createTestEligibilityRequest();
        eligibilityRequest.setPolicyNumber("INVALID-POLICY");
        
        when(authManager.getAccessToken()).thenReturn("mock-jwt-token");
        when(bundleBuilder.buildEligibilityBundle(any())).thenReturn("fhir-eligibility-bundle");
        
        // Act
        EligibilityCheckResponse response = claimService.checkEligibility(eligibilityRequest);
        
        // Assert
        assertNotNull(response);
        assertFalse(response.isEligible());
        assertNull(response.getCoverageDetails());
    }
    
    // ============================================
    // Claim Status Tests
    // ============================================
    
    @Test
    @Order(9)
    @DisplayName("Should get claim status successfully")
    void testGetClaimStatusSuccess() throws HCXException {
        // Arrange
        when(claimRepository.findById(testClaimId)).thenReturn(Optional.of(testClaim));
        
        // Act
        ClaimStatusResponse response = claimService.getClaimStatus(testClaimId);
        
        // Assert
        assertNotNull(response);
        assertEquals(testClaimId, response.getClaimId());
        assertEquals("SUBMITTED", response.getStatus());
        
        verify(claimRepository, times(1)).findById(testClaimId);
    }
    
    @Test
    @Order(10)
    @DisplayName("Should throw exception when claim not found")
    void testGetClaimStatusNotFound() {
        // Arrange
        String nonExistentClaimId = UUID.randomUUID().toString();
        when(claimRepository.findById(nonExistentClaimId)).thenReturn(Optional.empty());
        
        // Act & Assert
        HCXException exception = assertThrows(HCXException.class, () -> {
            claimService.getClaimStatus(nonExistentClaimId);
        });
        
        assertTrue(exception.getMessage().contains("not found"));
    }
    
    // ============================================
    // Claim Update Tests
    // ============================================
    
    @Test
    @Order(11)
    @DisplayName("Should update claim status successfully")
    void testUpdateClaimStatusSuccess() throws HCXException {
        // Arrange
        when(claimRepository.findById(testClaimId)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);
        
        // Act
        claimService.updateClaimStatus(testClaimId, "APPROVED");
        
        // Assert
        verify(claimRepository, times(1)).findById(testClaimId);
        verify(claimRepository, times(1)).save(any(Claim.class));
    }
    
    @Test
    @Order(12)
    @DisplayName("Should validate status transition")
    void testUpdateClaimStatusInvalidTransition() {
        // Arrange
        testClaim.setStatus("REJECTED");
        when(claimRepository.findById(testClaimId)).thenReturn(Optional.of(testClaim));
        
        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            claimService.updateClaimStatus(testClaimId, "APPROVED");
        });
    }
    
    // ============================================
    // Claim Search Tests
    // ============================================
    
    @Test
    @Order(13)
    @DisplayName("Should search claims by provider")
    void testSearchClaimsByProvider() {
        // Arrange
        String providerId = "PROVIDER001";
        List<Claim> expectedClaims = List.of(testClaim);
        when(claimRepository.findByProviderId(providerId)).thenReturn(expectedClaims);
        
        // Act
        List<Claim> claims = claimService.searchClaimsByProvider(providerId);
        
        // Assert
        assertNotNull(claims);
        assertEquals(1, claims.size());
        assertEquals(testClaimId, claims.get(0).getClaimId());
        
        verify(claimRepository, times(1)).findByProviderId(providerId);
    }
    
    @Test
    @Order(14)
    @DisplayName("Should search claims by date range")
    void testSearchClaimsByDateRange() {
        // Arrange
        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();
        List<Claim> expectedClaims = List.of(testClaim);
        
        when(claimRepository.findByDateRange(startDate, endDate)).thenReturn(expectedClaims);
        
        // Act
        List<Claim> claims = claimService.searchClaimsByDateRange(startDate, endDate);
        
        // Assert
        assertNotNull(claims);
        assertEquals(1, claims.size());
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    private ClaimSubmissionRequest createTestClaimRequest() {
        ClaimSubmissionRequest request = new ClaimSubmissionRequest();
        request.setProviderClaimId("CLAIM-" + System.currentTimeMillis());
        request.setProviderId("PROVIDER001");
        request.setPayorId("PAYOR001");
        request.setBeneficiaryId("BENEFICIARY001");
        request.setPolicyNumber("POL-123456");
        request.setServiceDate(LocalDate.now());
        request.setClaimAmount(new BigDecimal("5000.00"));
        request.setClaimType("INPATIENT");
        request.setDiagnosisCode("A00.0");
        request.setProcedureCode("99213");
        return request;
    }
    
    private Claim createTestClaim() {
        Claim claim = new Claim();
        claim.setClaimId(testClaimId);
        claim.setProviderClaimId("CLAIM-" + System.currentTimeMillis());
        claim.setProviderId("PROVIDER001");
        claim.setPayorId("PAYOR001");
        claim.setBeneficiaryId("BENEFICIARY001");
        claim.setPolicyNumber("POL-123456");
        claim.setServiceDate(LocalDate.now());
        claim.setClaimAmount(new BigDecimal("5000.00"));
        claim.setStatus("SUBMITTED");
        claim.setCreatedAt(LocalDateTime.now());
        return claim;
    }
    
    private PreAuthRequest createTestPreAuthRequest() {
        PreAuthRequest request = new PreAuthRequest();
        request.setProviderId("PROVIDER001");
        request.setPayorId("PAYOR001");
        request.setBeneficiaryId("BENEFICIARY001");
        request.setPolicyNumber("POL-123456");
        request.setProposedServiceDate(LocalDate.now().plusDays(7));
        request.setEstimatedAmount(new BigDecimal("10000.00"));
        request.setServiceType("SURGERY");
        request.setProcedureCode("47562");
        return request;
    }
    
    private EligibilityCheckRequest createTestEligibilityRequest() {
        EligibilityCheckRequest request = new EligibilityCheckRequest();
        request.setBeneficiaryId("BENEFICIARY001");
        request.setPolicyNumber("POL-123456");
        request.setPayorId("PAYOR001");
        request.setServiceDate(LocalDate.now());
        return request;
    }
}
