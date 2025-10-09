-- Sample Provider Data for Development
-- Sprint 1 - Provider Network

\c hcx_gateway

-- Insert Sample Providers (Egyptian Healthcare Providers)
INSERT INTO providers (provider_code, provider_name, provider_type, city, state, latitude, longitude, status, onboarding_date, primary_contact_email, primary_contact_phone, address_line1)
VALUES
    ('PROV001', 'Cairo University Hospital', 'hospital', 'Cairo', 'Cairo Governorate', 30.0444, 31.2357, 'active', '2024-01-15', 'contact@cuh.edu.eg', '+20-2-23648000', 'El-Manial, Cairo'),
    ('PROV002', 'Ain Shams University Hospital', 'hospital', 'Cairo', 'Cairo Governorate', 30.0715, 31.2772, 'active', '2024-01-20', 'info@asuh.edu.eg', '+20-2-24821500', 'Abbassia, Cairo'),
    ('PROV003', 'Alexandria Main University Hospital', 'hospital', 'Alexandria', 'Alexandria Governorate', 31.2001, 29.9187, 'active', '2024-02-01', 'contact@alexmed.edu.eg', '+20-3-4210000', 'El-Khartoum Square, Alexandria'),
    ('PROV004', 'Mansoura University Hospital', 'hospital', 'Mansoura', 'Dakahlia Governorate', 31.0364, 31.3807, 'active', '2024-02-10', 'info@mans.edu.eg', '+20-50-2202500', 'Gehan Street, Mansoura'),
    ('PROV005', 'Assiut University Hospital', 'hospital', 'Assiut', 'Assiut Governorate', 27.1783, 31.1859, 'active', '2024-02-15', 'contact@aun.edu.eg', '+20-88-2080278', 'Assiut University Campus'),
    
    ('PROV006', 'Dar El Fouad Hospital', 'hospital', 'Giza', 'Giza Governorate', 30.0131, 31.2089, 'active', '2024-03-01', 'info@darelfoaud.com', '+20-2-38351000', '6th of October City, Giza'),
    ('PROV007', 'Saudi German Hospital Cairo', 'hospital', 'Cairo', 'Cairo Governorate', 30.0594, 31.3260, 'active', '2024-03-05', 'cairo@sghgroup.com', '+20-2-27976000', 'New Cairo'),
    ('PROV008', 'Cleopatra Hospital', 'hospital', 'Cairo', 'Cairo Governorate', 30.0626, 31.2497, 'active', '2024-03-10', 'info@cleopatrahospitals.com', '+20-2-24189888', 'Heliopolis, Cairo'),
    ('PROV009', 'Nile Badrawi Hospital', 'hospital', 'Cairo', 'Cairo Governorate', 30.0444, 31.2357, 'active', '2024-03-15', 'contact@nilebadrawi.com', '+20-2-23648000', 'Maadi, Cairo'),
    ('PROV010', 'Anglo American Hospital', 'hospital', 'Cairo', 'Cairo Governorate', 30.0626, 31.3260, 'active', '2024-03-20', 'info@angloamerican-hospital.com', '+20-2-27359000', 'Zahraa El Maadi, Cairo'),
    
    ('PROV011', 'El Salam International Hospital', 'hospital', 'Cairo', 'Cairo Governorate', 30.0626, 31.3260, 'active', '2024-04-01', 'info@elsalamhospital.com', '+20-2-27359000', 'Maadi, Cairo'),
    ('PROV012', 'Misr International Hospital', 'hospital', 'Cairo', 'Cairo Governorate', 30.0444, 31.2357, 'active', '2024-04-05', 'contact@misrhospital.com', '+20-2-33055555', 'Dokki, Giza'),
    ('PROV013', 'Al Salam Hospital Alexandria', 'hospital', 'Alexandria', 'Alexandria Governorate', 31.2001, 29.9187, 'active', '2024-04-10', 'info@alsalamalex.com', '+20-3-5442000', 'Smouha, Alexandria'),
    ('PROV014', 'Tanta University Hospital', 'hospital', 'Tanta', 'Gharbia Governorate', 30.7865, 31.0004, 'active', '2024-04-15', 'contact@tanta.edu.eg', '+20-40-3317928', 'Tanta University Campus'),
    ('PROV015', 'Zagazig University Hospital', 'hospital', 'Zagazig', 'Sharqia Governorate', 30.5852, 31.5021, 'active', '2024-04-20', 'info@zu.edu.eg', '+20-55-2303266', 'Zagazig University Campus'),
    
    -- Clinics
    ('PROV016', 'Heliopolis Medical Center', 'clinic', 'Cairo', 'Cairo Governorate', 30.0871, 31.3242, 'active', '2024-05-01', 'info@heliopolismc.com', '+20-2-22900000', 'Heliopolis, Cairo'),
    ('PROV017', 'Maadi Polyclinic', 'clinic', 'Cairo', 'Cairo Governorate', 29.9602, 31.2569, 'active', '2024-05-05', 'contact@maadipolyclinic.com', '+20-2-23806000', 'Maadi, Cairo'),
    ('PROV018', 'Nasr City Medical Center', 'clinic', 'Cairo', 'Cairo Governorate', 30.0626, 31.3260, 'active', '2024-05-10', 'info@nasrcitymc.com', '+20-2-22733000', 'Nasr City, Cairo'),
    ('PROV019', 'Alexandria Family Clinic', 'clinic', 'Alexandria', 'Alexandria Governorate', 31.2001, 29.9187, 'active', '2024-05-15', 'contact@alexfamilyclinic.com', '+20-3-5900000', 'Sporting, Alexandria'),
    ('PROV020', 'Mansoura Family Health Center', 'clinic', 'Mansoura', 'Dakahlia Governorate', 31.0364, 31.3807, 'active', '2024-05-20', 'info@mansourahealth.com', '+20-50-2200000', 'Mansoura City Center'),
    
    -- Pharmacies
    ('PROV021', 'Seif Pharmacy Chain - Cairo', 'pharmacy', 'Cairo', 'Cairo Governorate', 30.0444, 31.2357, 'active', '2024-06-01', 'info@seifpharmacy.com', '+20-2-19199', 'Multiple Locations, Cairo'),
    ('PROV022', 'El Ezaby Pharmacy - Alexandria', 'pharmacy', 'Alexandria', 'Alexandria Governorate', 31.2001, 29.9187, 'active', '2024-06-05', 'contact@elezaby.com', '+20-3-19191', 'Multiple Locations, Alexandria'),
    ('PROV023', 'Misr Pharmacy - Giza', 'pharmacy', 'Giza', 'Giza Governorate', 30.0131, 31.2089, 'active', '2024-06-10', 'info@misrpharmacy.com', '+20-2-19090', 'Dokki, Giza'),
    ('PROV024', 'Health Plus Pharmacy', 'pharmacy', 'Cairo', 'Cairo Governorate', 30.0626, 31.3260, 'active', '2024-06-15', 'contact@healthplus.com', '+20-2-19292', 'New Cairo'),
    ('PROV025', 'Care Pharmacy', 'pharmacy', 'Cairo', 'Cairo Governorate', 30.0871, 31.3242, 'active', '2024-06-20', 'info@carepharmacy.com', '+20-2-19393', 'Heliopolis, Cairo'),
    
    -- Diagnostic Centers
    ('PROV026', 'Al Borg Laboratories - Cairo', 'diagnostic', 'Cairo', 'Cairo Governorate', 30.0444, 31.2357, 'active', '2024-07-01', 'info@alborglabs.com', '+20-2-19777', 'Multiple Locations, Cairo'),
    ('PROV027', 'Alfa Lab - Alexandria', 'diagnostic', 'Alexandria', 'Alexandria Governorate', 31.2001, 29.9187, 'active', '2024-07-05', 'contact@alfalab.com', '+20-3-19888', 'Smouha, Alexandria'),
    ('PROV028', 'Cairo Scan Radiology Center', 'imaging_center', 'Cairo', 'Cairo Governorate', 30.0626, 31.3260, 'active', '2024-07-10', 'info@cairoscan.com', '+20-2-27000000', 'Nasr City, Cairo'),
    ('PROV029', 'Modern Lab - Mansoura', 'diagnostic', 'Mansoura', 'Dakahlia Governorate', 31.0364, 31.3807, 'active', '2024-07-15', 'contact@modernlab.com', '+20-50-2300000', 'Mansoura'),
    ('PROV030', 'Nile Scan Imaging Center', 'imaging_center', 'Cairo', 'Cairo Governorate', 30.0444, 31.2357, 'active', '2024-07-20', 'info@nilescan.com', '+20-2-23700000', 'Maadi, Cairo')
ON CONFLICT (provider_code) DO NOTHING;

-- Insert Sample Network Relationships
INSERT INTO network_relationships (provider_id, payor_id, network_tier, agreement_start_date, is_active, contract_number)
SELECT 
    p.provider_id, 
    gen_random_uuid(), 
    CASE 
        WHEN p.provider_type = 'hospital' THEN 'preferred'
        WHEN p.provider_type = 'clinic' THEN 'standard'
        ELSE 'standard'
    END,
    '2024-01-01',
    true,
    'CONTRACT-' || p.provider_code || '-2024'
FROM providers p
WHERE p.provider_code IN ('PROV001', 'PROV002', 'PROV003', 'PROV006', 'PROV007', 'PROV021', 'PROV026')
ON CONFLICT (provider_id, payor_id) DO NOTHING;

-- Insert Sample Provider Performance Data
INSERT INTO provider_performance (provider_id, metric_period, period_start_date, period_end_date, total_claims_submitted, claims_approved, claims_rejected, total_claim_amount, approved_amount, approval_rate)
SELECT 
    p.provider_id,
    'monthly',
    '2024-09-01',
    '2024-09-30',
    FLOOR(RANDOM() * 500 + 100)::INTEGER,
    FLOOR(RANDOM() * 400 + 80)::INTEGER,
    FLOOR(RANDOM() * 50 + 10)::INTEGER,
    ROUND((RANDOM() * 500000 + 100000)::NUMERIC, 2),
    ROUND((RANDOM() * 450000 + 90000)::NUMERIC, 2),
    ROUND((RANDOM() * 20 + 75)::NUMERIC, 2)
FROM providers p
WHERE p.provider_type IN ('hospital', 'clinic')
ON CONFLICT (provider_id, metric_period, period_start_date) DO NOTHING;

-- Insert Sample Provider Services
INSERT INTO provider_services (provider_id, service_code, service_name, service_category, is_available, price)
SELECT 
    p.provider_id,
    'SVC-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
    CASE 
        WHEN p.provider_type = 'hospital' THEN 'General Consultation'
        WHEN p.provider_type = 'clinic' THEN 'Family Medicine Consultation'
        WHEN p.provider_type = 'diagnostic' THEN 'Complete Blood Count (CBC)'
        WHEN p.provider_type = 'pharmacy' THEN 'Medication Dispensing'
        ELSE 'General Service'
    END,
    CASE 
        WHEN p.provider_type = 'hospital' THEN 'Consultation'
        WHEN p.provider_type = 'clinic' THEN 'Primary Care'
        WHEN p.provider_type = 'diagnostic' THEN 'Laboratory'
        WHEN p.provider_type = 'pharmacy' THEN 'Pharmacy'
        ELSE 'General'
    END,
    true,
    ROUND((RANDOM() * 500 + 100)::NUMERIC, 2)
FROM providers p
LIMIT 50
ON CONFLICT (provider_id, service_code) DO NOTHING;
