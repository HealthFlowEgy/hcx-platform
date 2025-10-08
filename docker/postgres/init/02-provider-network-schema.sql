-- Provider Network Management Schema
-- Sprint 1 - Track 2

\c hcx_gateway

-- Providers Table
CREATE TABLE IF NOT EXISTS providers (
    provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hcx_participant_id UUID,
    provider_code VARCHAR(50) UNIQUE NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    
    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(20),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'Egypt',
    
    -- Geolocation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Status and Metadata
    status VARCHAR(20) DEFAULT 'active',
    onboarding_date DATE NOT NULL,
    license_number VARCHAR(100),
    accreditation_status VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    CONSTRAINT chk_provider_type CHECK (provider_type IN ('hospital', 'clinic', 'pharmacy', 'diagnostic', 'lab', 'imaging_center', 'dental', 'physiotherapy')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'under_review'))
);

-- Indexes for Providers
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_providers_state ON providers(state);
CREATE INDEX idx_providers_type ON providers(provider_type);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_code ON providers(provider_code);
CREATE INDEX idx_providers_name ON providers USING gin(to_tsvector('english', provider_name));

-- Network Relationships Table
CREATE TABLE IF NOT EXISTS network_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
    payor_id UUID NOT NULL,
    network_tier VARCHAR(20),
    agreement_start_date DATE NOT NULL,
    agreement_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    contract_number VARCHAR(100),
    terms_and_conditions TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    UNIQUE(provider_id, payor_id),
    CONSTRAINT chk_network_tier CHECK (network_tier IN ('preferred', 'standard', 'out_of_network', 'premium'))
);

-- Indexes for Network Relationships
CREATE INDEX idx_network_relationships_provider ON network_relationships(provider_id);
CREATE INDEX idx_network_relationships_payor ON network_relationships(payor_id);
CREATE INDEX idx_network_relationships_active ON network_relationships(is_active);

-- Provider Performance Table
CREATE TABLE IF NOT EXISTS provider_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
    metric_period VARCHAR(20),
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    
    -- Claims Metrics
    total_claims_submitted INTEGER DEFAULT 0,
    claims_approved INTEGER DEFAULT 0,
    claims_rejected INTEGER DEFAULT 0,
    claims_pending INTEGER DEFAULT 0,
    
    -- Financial Metrics
    total_claim_amount DECIMAL(15, 2) DEFAULT 0,
    approved_amount DECIMAL(15, 2) DEFAULT 0,
    rejected_amount DECIMAL(15, 2) DEFAULT 0,
    
    -- Performance Metrics
    average_processing_time_hours DECIMAL(10, 2),
    approval_rate DECIMAL(5, 2),
    rejection_rate DECIMAL(5, 2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(provider_id, metric_period, period_start_date),
    CONSTRAINT chk_metric_period CHECK (metric_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'))
);

-- Indexes for Provider Performance
CREATE INDEX idx_performance_provider ON provider_performance(provider_id);
CREATE INDEX idx_performance_period ON provider_performance(metric_period, period_start_date);

-- Provider Services Table
CREATE TABLE IF NOT EXISTS provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
    service_code VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    price DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(provider_id, service_code)
);

-- Indexes for Provider Services
CREATE INDEX idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX idx_provider_services_category ON provider_services(service_category);
CREATE INDEX idx_provider_services_available ON provider_services(is_available);

-- Comments
COMMENT ON TABLE providers IS 'Provider network directory with comprehensive information';
COMMENT ON TABLE network_relationships IS 'Provider-Payor network agreements and contracts';
COMMENT ON TABLE provider_performance IS 'Provider performance metrics tracking over time';
COMMENT ON TABLE provider_services IS 'Services offered by each provider';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_relationships_updated_at BEFORE UPDATE ON network_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_performance_updated_at BEFORE UPDATE ON provider_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_services_updated_at BEFORE UPDATE ON provider_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
