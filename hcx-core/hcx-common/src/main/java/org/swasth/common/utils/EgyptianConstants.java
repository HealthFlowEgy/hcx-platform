package org.swasth.common.utils;

import java.util.Arrays;
import java.util.List;

/**
 * Egyptian-specific constants for HCX platform
 */
public class EgyptianConstants {

    // Egyptian country code
    public static final String EGYPT_COUNTRY_CODE = "+20";
    public static final String EGYPT_COUNTRY_CODE_NUMERIC = "20";
    public static final String EGYPT_COUNTRY_NAME = "Egypt";
    public static final String EGYPT_COUNTRY_NAME_ARABIC = "مصر";

    // Phone number constants
    public static final String PHONE_NUMBER_REGEX_EGYPTIAN_MOBILE = "^(\\+20|0020|20)?1[0-9]{9}$";
    public static final String PHONE_NUMBER_REGEX_EGYPTIAN_LANDLINE = "^(\\+20|0020|20)?[2-9][0-9]{7,8}$";
    public static final int EGYPTIAN_MOBILE_LENGTH_WITHOUT_COUNTRY_CODE = 11;
    public static final int EGYPTIAN_LANDLINE_MIN_LENGTH = 8;
    public static final int EGYPTIAN_LANDLINE_MAX_LENGTH = 9;

    // Address constants
    public static final String POSTAL_CODE_REGEX_EGYPTIAN = "^[0-9]{5}$";
    public static final int POSTAL_CODE_LENGTH_EGYPTIAN = 5;

    // Egyptian governorates (English)
    public static final List<String> EGYPTIAN_GOVERNORATES_ENGLISH = Arrays.asList(
        "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
        "Gharbiya", "Ismailia", "Menofia", "Minya", "Qaliubiya", "New Valley",
        "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta",
        "Sharkia", "South Sinai", "Kafr el-Sheikh", "Matrouh", "Luxor",
        "Qena", "North Sinai", "Sohag"
    );

    // Egyptian governorates (Arabic)
    public static final List<String> EGYPTIAN_GOVERNORATES_ARABIC = Arrays.asList(
        "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
        "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد",
        "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط",
        "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
        "قنا", "شمال سيناء", "سوهاج"
    );

    // Major Egyptian cities
    public static final List<String> MAJOR_EGYPTIAN_CITIES = Arrays.asList(
        "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez",
        "Luxor", "Mansoura", "El Mahalla El Kubra", "Tanta", "Asyut", "Ismailia",
        "Fayyum", "Zagazig", "Aswan", "Damietta", "Damanhur", "Minya", "Beni Suef",
        "Hurghada", "Qena", "Sohag", "Shibin El Kom", "Banha", "Kafr el-Sheikh",
        "Arish", "Mallawi", "10th of Ramadan City", "Bilbays", "Marsa Matruh"
    );

    // Egyptian mobile network prefixes (after country code +20)
    public static final List<String> EGYPTIAN_MOBILE_PREFIXES = Arrays.asList(
        "10", "11", "12", "15", // Vodafone
        "100", "101", "106", "109", "127", "128", // Vodafone
        "120", "121", "122", // Etisalat
        "150", "155", "156", "157", "158", "159" // Orange
    );

    // Address field names for Egyptian format
    public static final String ADDRESS_FIELD_STREET = "street_address";
    public static final String ADDRESS_FIELD_CITY = "city";
    public static final String ADDRESS_FIELD_GOVERNORATE = "governorate";
    public static final String ADDRESS_FIELD_POSTAL_CODE = "postal_code";
    public static final String ADDRESS_FIELD_COUNTRY = "country";

    // Phone field names
    public static final String PHONE_FIELD_PRIMARY_MOBILE = "primary_mobile";
    public static final String PHONE_FIELD_SECONDARY_MOBILE = "secondary_mobile";
    public static final String PHONE_FIELD_LANDLINE = "landline";

    // Validation error messages
    public static final String ERROR_INVALID_EGYPTIAN_MOBILE = "Invalid Egyptian mobile number format";
    public static final String ERROR_INVALID_EGYPTIAN_LANDLINE = "Invalid Egyptian landline number format";
    public static final String ERROR_INVALID_EGYPTIAN_POSTAL_CODE = "Invalid Egyptian postal code format (must be 5 digits)";
    public static final String ERROR_INVALID_EGYPTIAN_GOVERNORATE = "Invalid Egyptian governorate";
    public static final String ERROR_REQUIRED_FIELD = "This field is required";
    public static final String ERROR_INVALID_EMAIL = "Invalid email format";

    // Default values
    public static final String DEFAULT_COUNTRY = "Egypt";
    public static final String DEFAULT_COUNTRY_ARABIC = "مصر";
    public static final String DEFAULT_GOVERNORATE = "Cairo";
    public static final String DEFAULT_GOVERNORATE_ARABIC = "القاهرة";

    // SMS message templates for Egyptian context
    public static final String SMS_OTP_TEMPLATE_ENGLISH = "Your HCX verification code is: %s. Valid for 10 minutes. Do not share this code.";
    public static final String SMS_OTP_TEMPLATE_ARABIC = "رمز التحقق الخاص بك في HCX هو: %s. صالح لمدة 10 دقائق. لا تشارك هذا الرمز.";
    
    public static final String SMS_WELCOME_TEMPLATE_ENGLISH = "Welcome to HCX Egypt! Your participant code is: %s. Keep this safe.";
    public static final String SMS_WELCOME_TEMPLATE_ARABIC = "مرحباً بك في HCX مصر! رمز المشارك الخاص بك هو: %s. احتفظ به في مكان آمن.";

    // Locale settings
    public static final String LOCALE_EGYPT_ENGLISH = "en_EG";
    public static final String LOCALE_EGYPT_ARABIC = "ar_EG";
    public static final String TIMEZONE_EGYPT = "Africa/Cairo";

    // Currency
    public static final String CURRENCY_CODE_EGYPT = "EGP";
    public static final String CURRENCY_SYMBOL_EGYPT = "ج.م";

    // Healthcare system specific constants
    public static final String HEALTHCARE_SYSTEM_NAME = "Egyptian Universal Health Insurance System";
    public static final String HEALTHCARE_SYSTEM_NAME_ARABIC = "نظام التأمين الصحي الشامل المصري";
    
    // Regulatory compliance
    public static final String DATA_PROTECTION_LAW = "Egyptian Data Protection Law No. 151 of 2020";
    public static final String HEALTHCARE_REGULATION = "Egyptian Ministry of Health and Population Regulations";

    // Common Egyptian organization types
    public static final List<String> EGYPTIAN_ORGANIZATION_TYPES = Arrays.asList(
        "Public Hospital", "Private Hospital", "Clinic", "Pharmacy", "Laboratory",
        "Insurance Company", "Government Health Authority", "Medical Center",
        "Diagnostic Center", "Rehabilitation Center", "Emergency Services"
    );

    // Egyptian organization types in Arabic
    public static final List<String> EGYPTIAN_ORGANIZATION_TYPES_ARABIC = Arrays.asList(
        "مستشفى حكومي", "مستشفى خاص", "عيادة", "صيدلية", "معمل",
        "شركة تأمين", "هيئة صحية حكومية", "مركز طبي",
        "مركز تشخيص", "مركز تأهيل", "خدمات الطوارئ"
    );

    // Utility methods
    public static boolean isValidEgyptianGovernorate(String governorate) {
        if (governorate == null || governorate.trim().isEmpty()) {
            return false;
        }
        String normalized = governorate.trim();
        return EGYPTIAN_GOVERNORATES_ENGLISH.stream().anyMatch(g -> g.equalsIgnoreCase(normalized)) ||
               EGYPTIAN_GOVERNORATES_ARABIC.contains(normalized);
    }

    public static boolean isValidEgyptianCity(String city) {
        if (city == null || city.trim().isEmpty()) {
            return false;
        }
        String normalized = city.trim();
        return MAJOR_EGYPTIAN_CITIES.stream().anyMatch(c -> c.equalsIgnoreCase(normalized));
    }

    public static boolean isValidEgyptianOrganizationType(String orgType) {
        if (orgType == null || orgType.trim().isEmpty()) {
            return false;
        }
        String normalized = orgType.trim();
        return EGYPTIAN_ORGANIZATION_TYPES.stream().anyMatch(t -> t.equalsIgnoreCase(normalized)) ||
               EGYPTIAN_ORGANIZATION_TYPES_ARABIC.contains(normalized);
    }
}

