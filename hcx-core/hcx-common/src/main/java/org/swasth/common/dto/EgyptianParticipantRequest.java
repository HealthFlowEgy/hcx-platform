package org.swasth.common.dto;

import org.swasth.common.utils.EgyptianValidationUtils;
import org.swasth.common.utils.EgyptianValidationUtils.EgyptianAddress;

import java.util.HashMap;
import java.util.Map;

/**
 * Egyptian-specific participant request DTO with proper validation
 * for Egyptian phone numbers and addresses
 */
public class EgyptianParticipantRequest {

    private String participantName;
    private String primaryEmail;
    private String primaryMobile;
    private String secondaryMobile;
    private EgyptianAddress address;
    private String participantCode;
    private String organizationType;
    private Map<String, Object> additionalInfo = new HashMap<>();

    public EgyptianParticipantRequest() {}

    /**
     * Validate the participant request for Egyptian compliance
     * @return ValidationResult with status and error messages
     */
    public ValidationResult validate() {
        ValidationResult result = new ValidationResult();

        // Validate participant name
        if (participantName == null || participantName.trim().isEmpty()) {
            result.addError("Participant name is required");
        }

        // Validate primary email
        if (primaryEmail == null || primaryEmail.trim().isEmpty()) {
            result.addError("Primary email is required");
        } else if (!isValidEmail(primaryEmail)) {
            result.addError("Primary email format is invalid");
        }

        // Validate primary mobile (required)
        if (primaryMobile == null || primaryMobile.trim().isEmpty()) {
            result.addError("Primary mobile number is required");
        } else if (!EgyptianValidationUtils.isValidEgyptianPhoneNumber(primaryMobile)) {
            result.addError("Primary mobile number is not a valid Egyptian phone number");
        }

        // Validate secondary mobile (optional)
        if (secondaryMobile != null && !secondaryMobile.trim().isEmpty()) {
            if (!EgyptianValidationUtils.isValidEgyptianPhoneNumber(secondaryMobile)) {
                result.addError("Secondary mobile number is not a valid Egyptian phone number");
            }
        }

        // Validate address
        if (address != null) {
            if (!EgyptianValidationUtils.isValidEgyptianAddress(address)) {
                result.addError("Address contains invalid Egyptian address components");
            }
        }

        return result;
    }

    /**
     * Format phone numbers to Egyptian international format
     */
    public void formatPhoneNumbers() {
        if (primaryMobile != null && !primaryMobile.trim().isEmpty()) {
            primaryMobile = EgyptianValidationUtils.formatEgyptianPhoneNumber(primaryMobile);
        }
        
        if (secondaryMobile != null && !secondaryMobile.trim().isEmpty()) {
            secondaryMobile = EgyptianValidationUtils.formatEgyptianPhoneNumber(secondaryMobile);
        }
    }

    /**
     * Convert to map for API requests
     * @return Map representation of the participant request
     */
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        
        map.put("participant_name", participantName);
        map.put("primary_email", primaryEmail);
        map.put("primary_mobile", primaryMobile);
        
        if (secondaryMobile != null && !secondaryMobile.trim().isEmpty()) {
            map.put("secondary_mobile", secondaryMobile);
        }
        
        if (address != null) {
            Map<String, Object> addressMap = new HashMap<>();
            addressMap.put("street", address.getStreet());
            addressMap.put("city", address.getCity());
            addressMap.put("governorate", address.getGovernorate());
            addressMap.put("postal_code", address.getPostalCode());
            addressMap.put("country", address.getCountry());
            map.put("address", addressMap);
        }
        
        if (participantCode != null && !participantCode.trim().isEmpty()) {
            map.put("participant_code", participantCode);
        }
        
        if (organizationType != null && !organizationType.trim().isEmpty()) {
            map.put("organization_type", organizationType);
        }
        
        if (!additionalInfo.isEmpty()) {
            map.put("additional_info", additionalInfo);
        }
        
        return map;
    }

    /**
     * Create from map (for API responses)
     * @param map Map representation
     * @return EgyptianParticipantRequest object
     */
    public static EgyptianParticipantRequest fromMap(Map<String, Object> map) {
        EgyptianParticipantRequest request = new EgyptianParticipantRequest();
        
        request.setParticipantName((String) map.get("participant_name"));
        request.setPrimaryEmail((String) map.get("primary_email"));
        request.setPrimaryMobile((String) map.get("primary_mobile"));
        request.setSecondaryMobile((String) map.get("secondary_mobile"));
        request.setParticipantCode((String) map.get("participant_code"));
        request.setOrganizationType((String) map.get("organization_type"));
        
        // Parse address
        Map<String, Object> addressMap = (Map<String, Object>) map.get("address");
        if (addressMap != null) {
            EgyptianAddress address = new EgyptianAddress();
            address.setStreet((String) addressMap.get("street"));
            address.setCity((String) addressMap.get("city"));
            address.setGovernorate((String) addressMap.get("governorate"));
            address.setPostalCode((String) addressMap.get("postal_code"));
            address.setCountry((String) addressMap.getOrDefault("country", "Egypt"));
            request.setAddress(address);
        }
        
        // Parse additional info
        Map<String, Object> additionalInfo = (Map<String, Object>) map.get("additional_info");
        if (additionalInfo != null) {
            request.setAdditionalInfo(additionalInfo);
        }
        
        return request;
    }

    /**
     * Simple email validation
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    // Getters and setters
    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public String getPrimaryEmail() { return primaryEmail; }
    public void setPrimaryEmail(String primaryEmail) { this.primaryEmail = primaryEmail; }

    public String getPrimaryMobile() { return primaryMobile; }
    public void setPrimaryMobile(String primaryMobile) { this.primaryMobile = primaryMobile; }

    public String getSecondaryMobile() { return secondaryMobile; }
    public void setSecondaryMobile(String secondaryMobile) { this.secondaryMobile = secondaryMobile; }

    public EgyptianAddress getAddress() { return address; }
    public void setAddress(EgyptianAddress address) { this.address = address; }

    public String getParticipantCode() { return participantCode; }
    public void setParticipantCode(String participantCode) { this.participantCode = participantCode; }

    public String getOrganizationType() { return organizationType; }
    public void setOrganizationType(String organizationType) { this.organizationType = organizationType; }

    public Map<String, Object> getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(Map<String, Object> additionalInfo) { this.additionalInfo = additionalInfo; }

    /**
     * Validation result class
     */
    public static class ValidationResult {
        private boolean valid = true;
        private StringBuilder errors = new StringBuilder();

        public void addError(String error) {
            valid = false;
            if (errors.length() > 0) {
                errors.append("; ");
            }
            errors.append(error);
        }

        public boolean isValid() { return valid; }
        public String getErrors() { return errors.toString(); }
    }
}

