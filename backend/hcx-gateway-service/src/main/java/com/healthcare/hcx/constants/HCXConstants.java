package com.healthcare.hcx.constants;

/**
 * HCX Protocol Constants
 * Centralized constants for better maintainability and consistency
 * Based on HCX Protocol v0.9 specifications
 */
public final class HCXConstants {

    private HCXConstants() {
        // Utility class - prevent instantiation
    }

    // ===============================
    // HCX Protocol Headers
    // ===============================
    public static final class Headers {
        public static final String API_CALL_ID = "x-hcx-api_call_id";
        public static final String CORRELATION_ID = "x-hcx-correlation_id";
        public static final String TIMESTAMP = "x-hcx-timestamp";
        public static final String SENDER_CODE = "x-hcx-sender_code";
        public static final String RECIPIENT_CODE = "x-hcx-recipient_code";
        public static final String STATUS = "x-hcx-status";
        public static final String ERROR_DETAILS = "x-hcx-error_details";
        public static final String DEBUG_DETAILS = "x-hcx-debug_details";
        public static final String PROTOCOL_VERSION = "x-hcx-protocol_version";
        public static final String ENCRYPTION_ALGO = "x-hcx-encryption_algo";
        public static final String SIGNATURE = "x-hcx-signature";
    }

    // ===============================
    // HCX Protocol Status Values
    // ===============================
    public static final class Status {
        public static final String REQUEST = "request";
        public static final String RESPONSE = "response";
        public static final String REDIRECT = "redirect";
        public static final String ERROR = "error";
        public static final String ACKNOWLEDGEMENT = "acknowledgement";
    }

    // ===============================
    // HCX API Endpoints
    // ===============================
    public static final class Endpoints {
        public static final String COVERAGE_ELIGIBILITY_CHECK = "/coverage/eligibility/check";
        public static final String COVERAGE_ELIGIBILITY_ON_CHECK = "/coverage/eligibility/on_check";
        public static final String CLAIM_PRE_AUTH = "/claim/pre_auth";
        public static final String CLAIM_ON_PRE_AUTH = "/claim/on_pre_auth";
        public static final String CLAIM_SUBMIT = "/claim/submit";
        public static final String CLAIM_ON_SUBMIT = "/claim/on_submit";
        public static final String CLAIM_STATUS = "/claim/status";
        public static final String CLAIM_ON_STATUS = "/claim/on_status";
        public static final String PARTICIPANT_SEARCH = "/participant/search";
        public static final String COMMUNICATION_REQUEST = "/communication/request";
        public static final String COMMUNICATION_ON_REQUEST = "/communication/on_request";
    }

    // ===============================
    // Error Codes (HCX Standard)
    // ===============================
    public static final class ErrorCodes {
        public static final String ERR_INVALID_PAYLOAD = "ERR_INVALID_PAYLOAD";
        public static final String ERR_INVALID_ENCRYPTION = "ERR_INVALID_ENCRYPTION";
        public static final String ERR_INVALID_SIGNATURE = "ERR_INVALID_SIGNATURE";
        public static final String ERR_INVALID_PARTICIPANT_CODE = "ERR_INVALID_PARTICIPANT_CODE";
        public static final String ERR_INVALID_CORRELATION_ID = "ERR_INVALID_CORRELATION_ID";
        public static final String ERR_INVALID_API_CALL_ID = "ERR_INVALID_API_CALL_ID";
        public static final String ERR_INVALID_TIMESTAMP = "ERR_INVALID_TIMESTAMP";
        public static final String ERR_INVALID_REDIRECT_TO = "ERR_INVALID_REDIRECT_TO";
        public static final String ERR_INVALID_STATUS = "ERR_INVALID_STATUS";
        public static final String ERR_INVALID_DOMAIN_PAYLOAD = "ERR_INVALID_DOMAIN_PAYLOAD";
        public static final String ERR_INVALID_WORKFLOW_ID = "ERR_INVALID_WORKFLOW_ID";
        public static final String ERR_SENDER_NOT_SUPPORTED = "ERR_SENDER_NOT_SUPPORTED";
        public static final String ERR_RECIPIENT_NOT_SUPPORTED = "ERR_RECIPIENT_NOT_SUPPORTED";
        public static final String ERR_SERVICE_UNAVAILABLE = "ERR_SERVICE_UNAVAILABLE";
        public static final String ERR_DOMAIN_PROCESSING = "ERR_DOMAIN_PROCESSING";
    }

    // ===============================
    // FHIR Constants
    // ===============================
    public static final class FHIR {
        public static final String BUNDLE_TYPE_COLLECTION = "collection";
        public static final String BUNDLE_TYPE_DOCUMENT = "document";
        public static final String RESOURCE_TYPE_BUNDLE = "Bundle";
        public static final String RESOURCE_TYPE_PATIENT = "Patient";
        public static final String RESOURCE_TYPE_COVERAGE = "Coverage";
        public static final String RESOURCE_TYPE_CLAIM = "Claim";
        public static final String RESOURCE_TYPE_COVERAGE_ELIGIBILITY_REQUEST = "CoverageEligibilityRequest";
        public static final String RESOURCE_TYPE_COVERAGE_ELIGIBILITY_RESPONSE = "CoverageEligibilityResponse";
        public static final String RESOURCE_TYPE_CLAIM_RESPONSE = "ClaimResponse";
        
        // FHIR Code Systems
        public static final String SYSTEM_ICD_10 = "http://hl7.org/fhir/sid/icd-10";
        public static final String SYSTEM_CPT = "http://www.ama-assn.org/go/cpt";
        public static final String SYSTEM_SNOMED = "http://snomed.info/sct";
        public static final String SYSTEM_CLAIM_TYPE = "http://terminology.hl7.org/CodeSystem/claim-type";
        public static final String SYSTEM_DIAGNOSIS_TYPE = "http://terminology.hl7.org/CodeSystem/ex-diagnosistype";
    }

    // ===============================
    // Egyptian Healthcare Constants
    // ===============================
    public static final class Egyptian {
        public static final String COUNTRY_CODE = "EG";
        public static final String CURRENCY_CODE = "EGP";
        public static final String TIMEZONE = "Africa/Cairo";
        public static final String LANGUAGE_CODE = "ar-EG";
        public static final String PHONE_COUNTRY_CODE = "+20";
        
        // Egyptian Insurance Payors
        public static final String PAYOR_GOVERNMENT = "EG-GOVT-HEALTH";
        public static final String PAYOR_SOCIAL_INSURANCE = "EG-SOCIAL-INS";
        public static final String PAYOR_PRIVATE_INSURANCE = "EG-PRIVATE-INS";
        
        // Egyptian Provider Types
        public static final String PROVIDER_HOSPITAL = "EG-HOSPITAL";
        public static final String PROVIDER_CLINIC = "EG-CLINIC";
        public static final String PROVIDER_PHARMACY = "EG-PHARMACY";
        public static final String PROVIDER_LAB = "EG-LABORATORY";
    }

    // ===============================
    // Validation Constants
    // ===============================
    public static final class Validation {
        public static final int MAX_CORRELATION_ID_LENGTH = 255;
        public static final int MAX_API_CALL_ID_LENGTH = 255;
        public static final int MAX_PARTICIPANT_CODE_LENGTH = 50;
        public static final int MAX_ERROR_MESSAGE_LENGTH = 1000;
        public static final int MIN_TIMESTAMP_TOLERANCE_MINUTES = 5;
        public static final int MAX_TIMESTAMP_TOLERANCE_MINUTES = 5;
        
        // Egyptian National ID validation
        public static final int EGYPTIAN_NATIONAL_ID_LENGTH = 14;
        public static final String EGYPTIAN_PHONE_PATTERN = "^(\\+20|0)?1[0-2,5]\\d{8}$";
    }

    // ===============================
    // Configuration Keys
    // ===============================
    public static final class Config {
        public static final String HCX_PARTICIPANT_CODE = "hcx.participant.code";
        public static final String HCX_GATEWAY_URL = "hcx.gateway.url";
        public static final String HCX_PROTOCOL_VERSION = "hcx.protocol.version";
        public static final String HCX_ENCRYPTION_ENABLED = "hcx.encryption.enabled";
        public static final String HCX_SIGNATURE_ENABLED = "hcx.signature.enabled";
        public static final String HCX_TIMEOUT_SECONDS = "hcx.timeout.seconds";
        public static final String FHIR_VALIDATION_ENABLED = "fhir.validation.enabled";
        public static final String AUDIT_LOGGING_ENABLED = "audit.logging.enabled";
    }

    // ===============================
    // Metrics Constants
    // ===============================
    public static final class Metrics {
        public static final String HCX_REQUESTS_TOTAL = "hcx_requests_total";
        public static final String HCX_REQUESTS_SUCCESS = "hcx_requests_success";
        public static final String HCX_REQUESTS_ERROR = "hcx_requests_error";
        public static final String HCX_RESPONSE_TIME = "hcx_response_time";
        public static final String FHIR_VALIDATION_TOTAL = "fhir_validation_total";
        public static final String FHIR_VALIDATION_SUCCESS = "fhir_validation_success";
        public static final String FHIR_VALIDATION_ERROR = "fhir_validation_error";
    }

    // ===============================
    // Cache Keys
    // ===============================
    public static final class CacheKeys {
        public static final String PARTICIPANT_INFO = "participant_info:";
        public static final String CLAIM_STATUS = "claim_status:";
        public static final String FHIR_VALIDATION_RESULT = "fhir_validation:";
        public static final String API_RATE_LIMIT = "api_rate_limit:";
        public static final int DEFAULT_CACHE_TTL_SECONDS = 300; // 5 minutes
    }

    // ===============================
    // Default Values
    // ===============================
    public static final class Defaults {
        public static final String PROTOCOL_VERSION = "0.9";
        public static final int DEFAULT_TIMEOUT_SECONDS = 30;
        public static final int DEFAULT_RETRY_ATTEMPTS = 3;
        public static final int DEFAULT_PAGE_SIZE = 20;
        public static final int MAX_PAGE_SIZE = 100;
    }
}
