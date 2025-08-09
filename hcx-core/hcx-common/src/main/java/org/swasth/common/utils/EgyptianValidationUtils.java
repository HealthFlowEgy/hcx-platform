package org.swasth.common.utils;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Validation utilities for Egyptian phone numbers and addresses
 */
public class EgyptianValidationUtils {

    // Egyptian mobile number patterns
    private static final Pattern EGYPTIAN_MOBILE_PATTERN = Pattern.compile("^(\\+20|0020|20)?1[0-9]{9}$");
    private static final Pattern EGYPTIAN_LANDLINE_PATTERN = Pattern.compile("^(\\+20|0020|20)?[2-9][0-9]{7,8}$");
    
    // Egyptian postal code pattern (5 digits)
    private static final Pattern EGYPTIAN_POSTAL_CODE_PATTERN = Pattern.compile("^[0-9]{5}$");
    
    // Egyptian governorates (states)
    private static final List<String> EGYPTIAN_GOVERNORATES = Arrays.asList(
        "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
        "Gharbiya", "Ismailia", "Menofia", "Minya", "Qaliubiya", "New Valley",
        "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta",
        "Sharkia", "South Sinai", "Kafr el-Sheikh", "Matrouh", "Luxor",
        "Qena", "North Sinai", "Sohag"
    );

    // Arabic names for governorates
    private static final List<String> EGYPTIAN_GOVERNORATES_ARABIC = Arrays.asList(
        "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
        "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد",
        "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط",
        "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
        "قنا", "شمال سيناء", "سوهاج"
    );

    /**
     * Validate Egyptian mobile phone number
     * @param phoneNumber Phone number to validate
     * @return true if valid Egyptian mobile number
     */
    public static boolean isValidEgyptianMobile(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        
        String cleanedNumber = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");
        return EGYPTIAN_MOBILE_PATTERN.matcher(cleanedNumber).matches();
    }

    /**
     * Validate Egyptian landline phone number
     * @param phoneNumber Phone number to validate
     * @return true if valid Egyptian landline number
     */
    public static boolean isValidEgyptianLandline(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        
        String cleanedNumber = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");
        return EGYPTIAN_LANDLINE_PATTERN.matcher(cleanedNumber).matches();
    }

    /**
     * Validate any Egyptian phone number (mobile or landline)
     * @param phoneNumber Phone number to validate
     * @return true if valid Egyptian phone number
     */
    public static boolean isValidEgyptianPhoneNumber(String phoneNumber) {
        return isValidEgyptianMobile(phoneNumber) || isValidEgyptianLandline(phoneNumber);
    }

    /**
     * Format Egyptian phone number to international format
     * @param phoneNumber Phone number to format
     * @return Formatted phone number with +20 prefix
     */
    public static String formatEgyptianPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return phoneNumber;
        }

        String cleanedNumber = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");
        
        // Remove existing country code if present
        if (cleanedNumber.startsWith("+20")) {
            cleanedNumber = cleanedNumber.substring(3);
        } else if (cleanedNumber.startsWith("0020")) {
            cleanedNumber = cleanedNumber.substring(4);
        } else if (cleanedNumber.startsWith("20")) {
            cleanedNumber = cleanedNumber.substring(2);
        } else if (cleanedNumber.startsWith("0")) {
            cleanedNumber = cleanedNumber.substring(1);
        }

        // Add Egyptian country code
        return "+20" + cleanedNumber;
    }

    /**
     * Validate Egyptian postal code
     * @param postalCode Postal code to validate
     * @return true if valid Egyptian postal code
     */
    public static boolean isValidEgyptianPostalCode(String postalCode) {
        if (postalCode == null || postalCode.trim().isEmpty()) {
            return false;
        }
        
        return EGYPTIAN_POSTAL_CODE_PATTERN.matcher(postalCode.trim()).matches();
    }

    /**
     * Validate Egyptian governorate
     * @param governorate Governorate name to validate
     * @return true if valid Egyptian governorate
     */
    public static boolean isValidEgyptianGovernorate(String governorate) {
        if (governorate == null || governorate.trim().isEmpty()) {
            return false;
        }
        
        String normalizedGovernorate = governorate.trim();
        return EGYPTIAN_GOVERNORATES.stream().anyMatch(g -> g.equalsIgnoreCase(normalizedGovernorate)) ||
               EGYPTIAN_GOVERNORATES_ARABIC.contains(normalizedGovernorate);
    }

    /**
     * Get list of Egyptian governorates in English
     * @return List of Egyptian governorates
     */
    public static List<String> getEgyptianGovernoratesEnglish() {
        return EGYPTIAN_GOVERNORATES;
    }

    /**
     * Get list of Egyptian governorates in Arabic
     * @return List of Egyptian governorates in Arabic
     */
    public static List<String> getEgyptianGovernoratesArabic() {
        return EGYPTIAN_GOVERNORATES_ARABIC;
    }

    /**
     * Validate complete Egyptian address
     * @param address Address object containing street, city, governorate, postal code
     * @return true if all address components are valid
     */
    public static boolean isValidEgyptianAddress(EgyptianAddress address) {
        if (address == null) {
            return false;
        }

        // Street address is required
        if (address.getStreet() == null || address.getStreet().trim().isEmpty()) {
            return false;
        }

        // City is required
        if (address.getCity() == null || address.getCity().trim().isEmpty()) {
            return false;
        }

        // Governorate must be valid if provided
        if (address.getGovernorate() != null && !address.getGovernorate().trim().isEmpty()) {
            if (!isValidEgyptianGovernorate(address.getGovernorate())) {
                return false;
            }
        }

        // Postal code must be valid if provided
        if (address.getPostalCode() != null && !address.getPostalCode().trim().isEmpty()) {
            if (!isValidEgyptianPostalCode(address.getPostalCode())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Egyptian address data structure
     */
    public static class EgyptianAddress {
        private String street;
        private String city;
        private String governorate;
        private String postalCode;
        private String country = "Egypt";

        public EgyptianAddress() {}

        public EgyptianAddress(String street, String city, String governorate, String postalCode) {
            this.street = street;
            this.city = city;
            this.governorate = governorate;
            this.postalCode = postalCode;
        }

        // Getters and setters
        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getGovernorate() { return governorate; }
        public void setGovernorate(String governorate) { this.governorate = governorate; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            if (street != null && !street.trim().isEmpty()) {
                sb.append(street);
            }
            if (city != null && !city.trim().isEmpty()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(city);
            }
            if (governorate != null && !governorate.trim().isEmpty()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(governorate);
            }
            if (postalCode != null && !postalCode.trim().isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(postalCode);
            }
            if (sb.length() > 0) sb.append(", ");
            sb.append(country);
            return sb.toString();
        }
    }

    /**
     * Parse address string into Egyptian address components
     * @param addressString Full address string
     * @return EgyptianAddress object
     */
    public static EgyptianAddress parseEgyptianAddress(String addressString) {
        if (addressString == null || addressString.trim().isEmpty()) {
            return null;
        }

        EgyptianAddress address = new EgyptianAddress();
        String[] parts = addressString.split(",");
        
        if (parts.length >= 1) {
            address.setStreet(parts[0].trim());
        }
        if (parts.length >= 2) {
            address.setCity(parts[1].trim());
        }
        if (parts.length >= 3) {
            String governorateAndPostal = parts[2].trim();
            // Try to extract postal code (5 digits at the end)
            if (governorateAndPostal.matches(".*\\s[0-9]{5}$")) {
                String[] govAndPostal = governorateAndPostal.split("\\s(?=[0-9]{5}$)");
                if (govAndPostal.length == 2) {
                    address.setGovernorate(govAndPostal[0].trim());
                    address.setPostalCode(govAndPostal[1].trim());
                }
            } else {
                address.setGovernorate(governorateAndPostal);
            }
        }

        return address;
    }
}

