package io.hcx.platform.tests.unit;

import io.hcx.platform.service.ProviderService;
import io.hcx.platform.model.Provider;
import io.hcx.platform.model.ProviderSearchRequest;
import io.hcx.platform.repository.ProviderRepository;
import io.hcx.platform.exception.HCXException;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProviderService
 * Tests provider registration, search, and management operations
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProviderService Unit Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProviderServiceTest {

    @Mock
    private ProviderRepository providerRepository;
    
    @InjectMocks
    private ProviderService providerService;
    
    private Provider testProvider;
    private String testProviderId;
    
    @BeforeEach
    void setUp() {
        testProviderId = UUID.randomUUID().toString();
        testProvider = createTestProvider();
    }
    
    @AfterEach
    void tearDown() {
        reset(providerRepository);
    }
    
    // ============================================
    // Provider Registration Tests
    // ============================================
    
    @Test
    @Order(1)
    @DisplayName("Should register provider successfully")
    void testRegisterProviderSuccess() throws HCXException {
        // Arrange
        when(providerRepository.save(any(Provider.class))).thenReturn(testProvider);
        when(providerRepository.existsByProviderCode(anyString())).thenReturn(false);
        
        // Act
        Provider registered = providerService.registerProvider(testProvider);
        
        // Assert
        assertNotNull(registered);
        assertNotNull(registered.getProviderId());
        assertEquals("PROVIDER001", registered.getProviderCode());
        assertEquals("active", registered.getStatus());
        
        verify(providerRepository, times(1)).save(any(Provider.class));
    }
    
    @Test
    @Order(2)
    @DisplayName("Should throw exception for duplicate provider code")
    void testRegisterProviderDuplicate() {
        // Arrange
        when(providerRepository.existsByProviderCode(anyString())).thenReturn(true);
        
        // Act & Assert
        HCXException exception = assertThrows(HCXException.class, () -> {
            providerService.registerProvider(testProvider);
        });
        
        assertTrue(exception.getMessage().contains("already exists"));
        verify(providerRepository, never()).save(any());
    }
    
    @Test
    @Order(3)
    @DisplayName("Should validate provider data before registration")
    void testRegisterProviderValidation() {
        // Arrange
        Provider invalidProvider = new Provider();
        // Missing required fields
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            providerService.registerProvider(invalidProvider);
        });
        
        verify(providerRepository, never()).save(any());
    }
    
    // ============================================
    // Provider Search Tests
    // ============================================
    
    @Test
    @Order(4)
    @DisplayName("Should search providers by city")
    void testSearchProvidersByCity() {
        // Arrange
        ProviderSearchRequest searchRequest = new ProviderSearchRequest();
        searchRequest.setCity("Cairo");
        
        List<Provider> expectedProviders = List.of(testProvider);
        when(providerRepository.findByCity("Cairo")).thenReturn(expectedProviders);
        
        // Act
        List<Provider> providers = providerService.searchProviders(searchRequest);
        
        // Assert
        assertNotNull(providers);
        assertEquals(1, providers.size());
        assertEquals("Cairo", providers.get(0).getCity());
        
        verify(providerRepository, times(1)).findByCity("Cairo");
    }
    
    @Test
    @Order(5)
    @DisplayName("Should search providers by type")
    void testSearchProvidersByType() {
        // Arrange
        ProviderSearchRequest searchRequest = new ProviderSearchRequest();
        searchRequest.setProviderType("hospital");
        
        List<Provider> expectedProviders = List.of(testProvider);
        when(providerRepository.findByProviderType("hospital")).thenReturn(expectedProviders);
        
        // Act
        List<Provider> providers = providerService.searchProviders(searchRequest);
        
        // Assert
        assertNotNull(providers);
        assertEquals(1, providers.size());
        assertEquals("hospital", providers.get(0).getProviderType());
    }
    
    @Test
    @Order(6)
    @DisplayName("Should search providers by specialty")
    void testSearchProvidersBySpecialty() {
        // Arrange
        ProviderSearchRequest searchRequest = new ProviderSearchRequest();
        searchRequest.setSpecialty("Cardiology");
        
        List<Provider> expectedProviders = List.of(testProvider);
        when(providerRepository.findBySpecialty("Cardiology")).thenReturn(expectedProviders);
        
        // Act
        List<Provider> providers = providerService.searchProviders(searchRequest);
        
        // Assert
        assertNotNull(providers);
        assertEquals(1, providers.size());
    }
    
    @Test
    @Order(7)
    @DisplayName("Should search providers by name")
    void testSearchProvidersByName() {
        // Arrange
        String searchTerm = "Cairo Hospital";
        List<Provider> expectedProviders = List.of(testProvider);
        when(providerRepository.searchByName(searchTerm)).thenReturn(expectedProviders);
        
        // Act
        List<Provider> providers = providerService.searchByName(searchTerm);
        
        // Assert
        assertNotNull(providers);
        assertEquals(1, providers.size());
        assertTrue(providers.get(0).getProviderName().contains("Cairo"));
    }
    
    // ============================================
    // Provider Retrieval Tests
    // ============================================
    
    @Test
    @Order(8)
    @DisplayName("Should get provider by ID successfully")
    void testGetProviderByIdSuccess() throws HCXException {
        // Arrange
        when(providerRepository.findById(testProviderId)).thenReturn(Optional.of(testProvider));
        
        // Act
        Provider provider = providerService.getProviderById(testProviderId);
        
        // Assert
        assertNotNull(provider);
        assertEquals(testProviderId, provider.getProviderId());
        
        verify(providerRepository, times(1)).findById(testProviderId);
    }
    
    @Test
    @Order(9)
    @DisplayName("Should throw exception when provider not found")
    void testGetProviderByIdNotFound() {
        // Arrange
        String nonExistentId = UUID.randomUUID().toString();
        when(providerRepository.findById(nonExistentId)).thenReturn(Optional.empty());
        
        // Act & Assert
        HCXException exception = assertThrows(HCXException.class, () -> {
            providerService.getProviderById(nonExistentId);
        });
        
        assertTrue(exception.getMessage().contains("not found"));
    }
    
    // ============================================
    // Provider Update Tests
    // ============================================
    
    @Test
    @Order(10)
    @DisplayName("Should update provider successfully")
    void testUpdateProviderSuccess() throws HCXException {
        // Arrange
        when(providerRepository.findById(testProviderId)).thenReturn(Optional.of(testProvider));
        when(providerRepository.save(any(Provider.class))).thenReturn(testProvider);
        
        testProvider.setContactEmail("newemail@hospital.com");
        
        // Act
        Provider updated = providerService.updateProvider(testProviderId, testProvider);
        
        // Assert
        assertNotNull(updated);
        assertEquals("newemail@hospital.com", updated.getContactEmail());
        
        verify(providerRepository, times(1)).save(any(Provider.class));
    }
    
    @Test
    @Order(11)
    @DisplayName("Should not allow updating provider code")
    void testUpdateProviderCodeNotAllowed() {
        // Arrange
        when(providerRepository.findById(testProviderId)).thenReturn(Optional.of(testProvider));
        
        Provider updateRequest = new Provider();
        updateRequest.setProviderCode("NEW-CODE");
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            providerService.updateProvider(testProviderId, updateRequest);
        });
    }
    
    // ============================================
    // Provider Status Tests
    // ============================================
    
    @Test
    @Order(12)
    @DisplayName("Should activate provider successfully")
    void testActivateProviderSuccess() throws HCXException {
        // Arrange
        testProvider.setStatus("inactive");
        when(providerRepository.findById(testProviderId)).thenReturn(Optional.of(testProvider));
        when(providerRepository.save(any(Provider.class))).thenReturn(testProvider);
        
        // Act
        providerService.activateProvider(testProviderId);
        
        // Assert
        verify(providerRepository, times(1)).save(argThat(provider -> 
            "active".equals(provider.getStatus())
        ));
    }
    
    @Test
    @Order(13)
    @DisplayName("Should suspend provider successfully")
    void testSuspendProviderSuccess() throws HCXException {
        // Arrange
        when(providerRepository.findById(testProviderId)).thenReturn(Optional.of(testProvider));
        when(providerRepository.save(any(Provider.class))).thenReturn(testProvider);
        
        // Act
        providerService.suspendProvider(testProviderId, "Compliance review");
        
        // Assert
        verify(providerRepository, times(1)).save(argThat(provider -> 
            "suspended".equals(provider.getStatus())
        ));
    }
    
    // ============================================
    // Provider Geolocation Tests
    // ============================================
    
    @Test
    @Order(14)
    @DisplayName("Should find nearby providers")
    void testFindNearbyProviders() {
        // Arrange
        double latitude = 30.0444;
        double longitude = 31.2357;
        double radiusKm = 10.0;
        
        List<Provider> expectedProviders = List.of(testProvider);
        when(providerRepository.findNearbyProviders(latitude, longitude, radiusKm))
            .thenReturn(expectedProviders);
        
        // Act
        List<Provider> providers = providerService.findNearbyProviders(latitude, longitude, radiusKm);
        
        // Assert
        assertNotNull(providers);
        assertEquals(1, providers.size());
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    private Provider createTestProvider() {
        Provider provider = new Provider();
        provider.setProviderId(testProviderId);
        provider.setProviderCode("PROVIDER001");
        provider.setProviderName("Cairo University Hospital");
        provider.setProviderType("hospital");
        provider.setCity("Cairo");
        provider.setState("Cairo Governorate");
        provider.setCountry("Egypt");
        provider.setContactPhone("+20-2-1234-5678");
        provider.setContactEmail("info@cairohospital.eg");
        provider.setLatitude(30.0444);
        provider.setLongitude(31.2357);
        provider.setStatus("active");
        provider.setSpecialty("General, Cardiology, Neurology");
        return provider;
    }
}
