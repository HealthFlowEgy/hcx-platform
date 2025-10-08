package io.hcx.platform.tests.integration;

import io.hcx.platform.HCXPlatformApplication;
import io.hcx.platform.model.*;
import io.hcx.platform.repository.*;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;

import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for complete claim submission workflow
 * Tests end-to-end flow from submission to status updates
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */
@SpringBootTest(
    classes = HCXPlatformApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ClaimSubmissionIntegrationTest {

    @LocalServerPort
    private int port;

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("hcx_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", () -> redis.getMappedPort(6379).toString());
    }

    private String authToken;
    private String claimId;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        
        // Authenticate and get token
        authToken = authenticateAndGetToken();
    }

    // ============================================
    // Authentication Tests
    // ============================================

    @Test
    @Order(1)
    @DisplayName("Should authenticate successfully")
    void testAuthentication() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "participantCode": "PROVIDER001",
                    "apiKey": "test-api-key"
                }
                """)
        .when()
            .post("/api/v1/auth/token")
        .then()
            .statusCode(200)
            .body("accessToken", notNullValue())
            .body("tokenType", equalTo("Bearer"))
            .body("expiresIn", greaterThan(0));
    }

    @Test
    @Order(2)
    @DisplayName("Should reject invalid credentials")
    void testAuthenticationFailure() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "participantCode": "INVALID",
                    "apiKey": "wrong-key"
                }
                """)
        .when()
            .post("/api/v1/auth/token")
        .then()
            .statusCode(401)
            .body("error", equalTo("unauthorized"))
            .body("message", containsString("Invalid credentials"));
    }

    // ============================================
    // Claim Submission Tests
    // ============================================

    @Test
    @Order(3)
    @DisplayName("Should submit claim successfully")
    void testClaimSubmission() {
        String response = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "providerClaimId": "CLAIM-TEST-001",
                    "providerId": "PROVIDER001",
                    "payorId": "PAYOR001",
                    "beneficiaryId": "BENEFICIARY001",
                    "policyNumber": "POL-123456",
                    "serviceDate": "2025-10-01",
                    "claimAmount": 5000.00,
                    "claimType": "INPATIENT",
                    "diagnosisCode": "A00.0",
                    "procedureCode": "99213"
                }
                """)
        .when()
            .post("/api/v1/claims/submit")
        .then()
            .statusCode(201)
            .body("claimId", notNullValue())
            .body("status", equalTo("SUBMITTED"))
            .body("message", containsString("successfully"))
            .extract()
            .path("claimId");

        claimId = response;
    }

    @Test
    @Order(4)
    @DisplayName("Should validate required fields")
    void testClaimSubmissionValidation() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "providerId": "PROVIDER001"
                }
                """)
        .when()
            .post("/api/v1/claims/submit")
        .then()
            .statusCode(400)
            .body("errors", hasSize(greaterThan(0)))
            .body("errors[0].field", notNullValue())
            .body("errors[0].message", notNullValue());
    }

    @Test
    @Order(5)
    @DisplayName("Should reject duplicate claim")
    void testDuplicateClaimRejection() {
        // Submit first claim
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "providerClaimId": "CLAIM-DUPLICATE-001",
                    "providerId": "PROVIDER001",
                    "payorId": "PAYOR001",
                    "beneficiaryId": "BENEFICIARY001",
                    "policyNumber": "POL-123456",
                    "serviceDate": "2025-10-01",
                    "claimAmount": 5000.00,
                    "claimType": "INPATIENT",
                    "diagnosisCode": "A00.0",
                    "procedureCode": "99213"
                }
                """)
        .when()
            .post("/api/v1/claims/submit")
        .then()
            .statusCode(201);

        // Attempt duplicate submission
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "providerClaimId": "CLAIM-DUPLICATE-001",
                    "providerId": "PROVIDER001",
                    "payorId": "PAYOR001",
                    "beneficiaryId": "BENEFICIARY001",
                    "policyNumber": "POL-123456",
                    "serviceDate": "2025-10-01",
                    "claimAmount": 5000.00,
                    "claimType": "INPATIENT",
                    "diagnosisCode": "A00.0",
                    "procedureCode": "99213"
                }
                """)
        .when()
            .post("/api/v1/claims/submit")
        .then()
            .statusCode(409)
            .body("error", equalTo("duplicate_claim"))
            .body("message", containsString("already exists"));
    }

    // ============================================
    // Claim Status Tests
    // ============================================

    @Test
    @Order(6)
    @DisplayName("Should get claim status")
    void testGetClaimStatus() {
        // First submit a claim
        String claimId = submitTestClaim();

        // Get status
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/v1/claims/{claimId}/status", claimId)
        .then()
            .statusCode(200)
            .body("claimId", equalTo(claimId))
            .body("status", equalTo("SUBMITTED"))
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Order(7)
    @DisplayName("Should return 404 for non-existent claim")
    void testGetNonExistentClaimStatus() {
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/v1/claims/{claimId}/status", "NON-EXISTENT-ID")
        .then()
            .statusCode(404)
            .body("error", equalTo("claim_not_found"))
            .body("message", containsString("not found"));
    }

    // ============================================
    // Eligibility Check Tests
    // ============================================

    @Test
    @Order(8)
    @DisplayName("Should check eligibility successfully")
    void testEligibilityCheck() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "beneficiaryId": "BENEFICIARY001",
                    "policyNumber": "POL-123456",
                    "payorId": "PAYOR001",
                    "serviceDate": "2025-10-01"
                }
                """)
        .when()
            .post("/api/v1/eligibility/check")
        .then()
            .statusCode(200)
            .body("eligible", equalTo(true))
            .body("coverageDetails", notNullValue())
            .body("coverageDetails.policyNumber", equalTo("POL-123456"))
            .body("coverageDetails.coverageAmount", greaterThan(0));
    }

    @Test
    @Order(9)
    @DisplayName("Should return ineligible for invalid policy")
    void testEligibilityCheckInvalidPolicy() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "beneficiaryId": "BENEFICIARY001",
                    "policyNumber": "INVALID-POLICY",
                    "payorId": "PAYOR001",
                    "serviceDate": "2025-10-01"
                }
                """)
        .when()
            .post("/api/v1/eligibility/check")
        .then()
            .statusCode(200)
            .body("eligible", equalTo(false))
            .body("reason", containsString("not found"));
    }

    // ============================================
    // Pre-Authorization Tests
    // ============================================

    @Test
    @Order(10)
    @DisplayName("Should submit pre-authorization successfully")
    void testPreAuthSubmission() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "providerId": "PROVIDER001",
                    "payorId": "PAYOR001",
                    "beneficiaryId": "BENEFICIARY001",
                    "policyNumber": "POL-123456",
                    "proposedServiceDate": "2025-10-15",
                    "estimatedAmount": 10000.00,
                    "serviceType": "SURGERY",
                    "procedureCode": "47562"
                }
                """)
        .when()
            .post("/api/v1/preauth/submit")
        .then()
            .statusCode(201)
            .body("preAuthId", notNullValue())
            .body("status", equalTo("PENDING"))
            .body("message", containsString("successfully"));
    }

    // ============================================
    // Claim Search Tests
    // ============================================

    @Test
    @Order(11)
    @DisplayName("Should search claims by provider")
    void testSearchClaimsByProvider() {
        // Submit multiple claims
        submitTestClaim();
        submitTestClaim();

        given()
            .header("Authorization", "Bearer " + authToken)
            .queryParam("providerId", "PROVIDER001")
        .when()
            .get("/api/v1/claims/search")
        .then()
            .statusCode(200)
            .body("claims", hasSize(greaterThan(0)))
            .body("claims[0].providerId", equalTo("PROVIDER001"))
            .body("total", greaterThan(0));
    }

    @Test
    @Order(12)
    @DisplayName("Should search claims by date range")
    void testSearchClaimsByDateRange() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .queryParam("startDate", "2025-10-01")
            .queryParam("endDate", "2025-10-31")
        .when()
            .get("/api/v1/claims/search")
        .then()
            .statusCode(200)
            .body("claims", hasSize(greaterThan(0)))
            .body("total", greaterThan(0));
    }

    @Test
    @Order(13)
    @DisplayName("Should search claims by status")
    void testSearchClaimsByStatus() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .queryParam("status", "SUBMITTED")
        .when()
            .get("/api/v1/claims/search")
        .then()
            .statusCode(200)
            .body("claims", hasSize(greaterThan(0)))
            .body("claims[0].status", equalTo("SUBMITTED"));
    }

    // ============================================
    // Pagination Tests
    // ============================================

    @Test
    @Order(14)
    @DisplayName("Should support pagination")
    void testPagination() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .queryParam("page", 1)
            .queryParam("pageSize", 10)
        .when()
            .get("/api/v1/claims/search")
        .then()
            .statusCode(200)
            .body("claims", hasSize(lessThanOrEqualTo(10)))
            .body("page", equalTo(1))
            .body("pageSize", equalTo(10))
            .body("total", greaterThan(0));
    }

    // ============================================
    // Error Handling Tests
    // ============================================

    @Test
    @Order(15)
    @DisplayName("Should handle unauthorized access")
    void testUnauthorizedAccess() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "providerId": "PROVIDER001",
                    "payorId": "PAYOR001"
                }
                """)
        .when()
            .post("/api/v1/claims/submit")
        .then()
            .statusCode(401)
            .body("error", equalTo("unauthorized"));
    }

    @Test
    @Order(16)
    @DisplayName("Should handle invalid JSON")
    void testInvalidJSON() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("{ invalid json }")
        .when()
            .post("/api/v1/claims/submit")
        .then()
            .statusCode(400)
            .body("error", equalTo("invalid_request"));
    }

    // ============================================
    // Helper Methods
    // ============================================

    private String authenticateAndGetToken() {
        return given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "participantCode": "PROVIDER001",
                    "apiKey": "test-api-key"
                }
                """)
        .when()
            .post("/api/v1/auth/token")
        .then()
            .statusCode(200)
            .extract()
            .path("accessToken");
    }

    private String submitTestClaim() {
        return given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "providerClaimId": "CLAIM-TEST-%d",
                    "providerId": "PROVIDER001",
                    "payorId": "PAYOR001",
                    "beneficiaryId": "BENEFICIARY001",
                    "policyNumber": "POL-123456",
                    "serviceDate": "2025-10-01",
                    "claimAmount": 5000.00,
                    "claimType": "INPATIENT",
                    "diagnosisCode": "A00.0",
                    "procedureCode": "99213"
                }
                """.formatted(System.currentTimeMillis()))
        .when()
            .post("/api/v1/claims/submit")
        .then()
            .statusCode(201)
            .extract()
            .path("claimId");
    }
}
