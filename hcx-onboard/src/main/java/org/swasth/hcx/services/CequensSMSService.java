package org.swasth.hcx.services;

import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import kong.unirest.UnirestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Cequens SMS Service implementation for Egyptian SMS gateway
 * Replaces AWS SNS dependency with local/regional SMS provider
 */
@Service
public class CequensSMSService {

    private static final Logger logger = LoggerFactory.getLogger(CequensSMSService.class);

    @Value("${cequens.api.url:https://apis.cequens.com}")
    private String cequensApiUrl;

    @Value("${cequens.access.token}")
    private String accessToken;

    @Value("${cequens.sender.name:HCX}")
    private String senderName;

    @Value("${cequens.api.version:v1}")
    private String apiVersion;

    /**
     * Send OTP SMS using Cequens gateway
     * @param phoneNumber Recipient phone number (with country code)
     * @param otp OTP code to send
     * @return CompletableFuture with result
     */
    @Async
    public CompletableFuture<String> sendOTP(String phoneNumber, String otp) {
        try {
            String message = String.format("Your HCX verification code is: %s. Valid for 10 minutes. Do not share this code.", otp);
            return sendSMS(phoneNumber, message);
        } catch (Exception e) {
            logger.error("Error sending OTP SMS to {}: {}", phoneNumber, e.getMessage());
            return CompletableFuture.completedFuture("FAILED: " + e.getMessage());
        }
    }

    /**
     * Send SMS using Cequens API
     * @param phoneNumber Recipient phone number
     * @param message SMS message content
     * @return CompletableFuture with result
     */
    @Async
    public CompletableFuture<String> sendSMS(String phoneNumber, String message) {
        try {
            // Clean and format phone number
            String formattedPhone = formatPhoneNumber(phoneNumber);
            
            // Prepare request payload according to Cequens API specification
            Map<String, Object> payload = new HashMap<>();
            payload.put("messageText", message);
            payload.put("recipients", formattedPhone);
            payload.put("senderName", senderName);
            payload.put("messageType", "text");
            
            // Build API endpoint - Cequens uses /sms/v1/messages
            String endpoint = String.format("%s/sms/%s/messages", cequensApiUrl, apiVersion);

            // Send HTTP request with access token
            HttpResponse<String> response = Unirest.post(endpoint)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + accessToken)
                    .body(payload)
                    .asString();

            if (response.getStatus() == 200 || response.getStatus() == 201) {
                logger.info("SMS sent successfully to {} via Cequens", formattedPhone);
                return CompletableFuture.completedFuture("SUCCESS: " + response.getBody());
            } else {
                logger.error("Failed to send SMS to {} via Cequens. Status: {}, Response: {}", 
                           formattedPhone, response.getStatus(), response.getBody());
                return CompletableFuture.completedFuture("FAILED: HTTP " + response.getStatus());
            }

        } catch (UnirestException e) {
            logger.error("Network error sending SMS to {} via Cequens: {}", phoneNumber, e.getMessage());
            return CompletableFuture.completedFuture("FAILED: Network error - " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error sending SMS to {} via Cequens: {}", phoneNumber, e.getMessage());
            return CompletableFuture.completedFuture("FAILED: " + e.getMessage());
        }
    }

    /**
     * Send notification SMS for important events
     * @param phoneNumber Recipient phone number
     * @param notificationType Type of notification
     * @param details Additional details
     * @return CompletableFuture with result
     */
    @Async
    public CompletableFuture<String> sendNotification(String phoneNumber, String notificationType, String details) {
        try {
            String message = buildNotificationMessage(notificationType, details);
            return sendSMS(phoneNumber, message);
        } catch (Exception e) {
            logger.error("Error sending notification SMS to {}: {}", phoneNumber, e.getMessage());
            return CompletableFuture.completedFuture("FAILED: " + e.getMessage());
        }
    }

    /**
     * Validate SMS configuration
     * @return true if configuration is valid
     */
    public boolean validateConfiguration() {
        if (accessToken == null || accessToken.trim().isEmpty()) {
            logger.error("Cequens access token is not configured");
            return false;
        }
        
        if (cequensApiUrl == null || cequensApiUrl.trim().isEmpty()) {
            logger.error("Cequens API URL is not configured");
            return false;
        }
        
        return true;
    }

    /**
     * Test SMS service connectivity
     * @return true if service is reachable
     */
    public boolean testConnectivity() {
        try {
            String healthEndpoint = String.format("%s/health", cequensApiUrl);
            HttpResponse<String> response = Unirest.get(healthEndpoint)
                    .header("Authorization", "Bearer " + accessToken)
                    .asString();
            
            return response.getStatus() == 200;
        } catch (Exception e) {
            logger.error("Connectivity test failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Format phone number for Cequens API (Egyptian format)
     * @param phoneNumber Raw phone number
     * @return Formatted phone number
     */
    private String formatPhoneNumber(String phoneNumber) {
        // Remove all non-digit characters
        String cleaned = phoneNumber.replaceAll("[^0-9]", "");
        
        // Handle Egyptian phone numbers
        if (cleaned.startsWith("20")) {
            // Already has country code
            cleaned = "+" + cleaned;
        } else if (cleaned.startsWith("0")) {
            // Remove leading zero and add Egyptian country code
            cleaned = "+20" + cleaned.substring(1);
        } else if (cleaned.length() == 10 || cleaned.length() == 11) {
            // Local Egyptian number, add country code
            cleaned = "+20" + cleaned;
        } else if (!cleaned.startsWith("+")) {
            // Ensure + prefix for international format
            cleaned = "+" + cleaned;
        }
        
        return cleaned;
    }

    /**
     * Generate unique message ID for tracking
     * @return Unique message ID
     */
    private String generateMessageId() {
        return "HCX-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    /**
     * Build notification message based on type
     * @param notificationType Type of notification
     * @param details Additional details
     * @return Formatted message
     */
    private String buildNotificationMessage(String notificationType, String details) {
        switch (notificationType.toLowerCase()) {
            case "claim_approved":
                return String.format("Your claim has been approved. Reference: %s. Check HCX portal for details.", details);
            case "claim_rejected":
                return String.format("Your claim has been rejected. Reference: %s. Contact support for assistance.", details);
            case "preauth_approved":
                return String.format("Pre-authorization approved. Reference: %s. Proceed with treatment.", details);
            case "preauth_rejected":
                return String.format("Pre-authorization rejected. Reference: %s. Contact your insurer.", details);
            case "coverage_verified":
                return String.format("Coverage eligibility verified. Reference: %s. Coverage is active.", details);
            case "coverage_expired":
                return String.format("Coverage has expired. Reference: %s. Please renew your policy.", details);
            case "participant_onboarded":
                return String.format("Welcome to HCX! Your participant code is: %s. Keep this safe.", details);
            case "account_verified":
                return "Your HCX account has been successfully verified. You can now access all services.";
            default:
                return String.format("HCX Notification: %s. Details: %s", notificationType, details);
        }
    }

    /**
     * Validate SMS configuration
     * @return true if configuration is valid
     */
    public boolean validateConfiguration() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("Cequens API key is not configured");
            return false;
        }
        
        if (apiSecret == null || apiSecret.trim().isEmpty()) {
            logger.error("Cequens API secret is not configured");
            return false;
        }
        
        if (cequensApiUrl == null || cequensApiUrl.trim().isEmpty()) {
            logger.error("Cequens API URL is not configured");
            return false;
        }
        
        return true;
    }

    /**
     * Test SMS service connectivity
     * @return true if service is reachable
     */
    public boolean testConnectivity() {
        try {
            String healthEndpoint = String.format("%s/health", cequensApiUrl);
            HttpResponse<String> response = Unirest.get(healthEndpoint)
                    .header("Authorization", "Bearer " + getAccessToken())
                    .asString();
            
            return response.getStatus() == 200;
        } catch (Exception e) {
            logger.error("Connectivity test failed: {}", e.getMessage());
            return false;
        }
    }
}

