-- HCX Platform Database Initialization Script
-- This script creates the necessary tables and initial data for HCX platform

-- Create payload table for message storage
CREATE TABLE IF NOT EXISTS public.payload
(
    mid character varying COLLATE pg_catalog."default" NOT NULL,
    data character varying COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payload_pkey PRIMARY KEY (mid)
);

-- Create participants table for registry
CREATE TABLE IF NOT EXISTS public.participants
(
    participant_code character varying(50) NOT NULL,
    participant_name character varying(255) NOT NULL,
    participant_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'active',
    endpoint_url character varying(500),
    public_key text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT participants_pkey PRIMARY KEY (participant_code)
);

-- Create audit table for tracking
CREATE TABLE IF NOT EXISTS public.audit_logs
(
    id SERIAL PRIMARY KEY,
    correlation_id character varying(100),
    participant_code character varying(50),
    action character varying(100),
    request_data text,
    response_data text,
    status character varying(20),
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create claims table for claims processing
CREATE TABLE IF NOT EXISTS public.claims
(
    claim_id character varying(100) NOT NULL,
    correlation_id character varying(100),
    participant_code character varying(50),
    claim_data jsonb,
    status character varying(50) DEFAULT 'submitted',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT claims_pkey PRIMARY KEY (claim_id)
);

-- Create coverage eligibility table
CREATE TABLE IF NOT EXISTS public.coverage_eligibility
(
    eligibility_id character varying(100) NOT NULL,
    correlation_id character varying(100),
    participant_code character varying(50),
    eligibility_data jsonb,
    status character varying(50) DEFAULT 'submitted',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT coverage_eligibility_pkey PRIMARY KEY (eligibility_id)
);

-- Create pre-authorization table
CREATE TABLE IF NOT EXISTS public.pre_authorization
(
    preauth_id character varying(100) NOT NULL,
    correlation_id character varying(100),
    participant_code character varying(50),
    preauth_data jsonb,
    status character varying(50) DEFAULT 'submitted',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pre_authorization_pkey PRIMARY KEY (preauth_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payload_created_at ON public.payload(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_type ON public.participants(participant_type);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON public.audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_participant_code ON public.audit_logs(participant_code);
CREATE INDEX IF NOT EXISTS idx_claims_correlation_id ON public.claims(correlation_id);
CREATE INDEX IF NOT EXISTS idx_claims_participant_code ON public.claims(participant_code);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_coverage_eligibility_correlation_id ON public.coverage_eligibility(correlation_id);
CREATE INDEX IF NOT EXISTS idx_pre_authorization_correlation_id ON public.pre_authorization(correlation_id);

-- Insert sample participants for testing
INSERT INTO public.participants (participant_code, participant_name, participant_type, endpoint_url) VALUES
('PROV001', 'Sample Healthcare Provider', 'provider', 'http://localhost:8080/provider/callback'),
('PAYOR001', 'Sample Insurance Company', 'payor', 'http://localhost:8080/payor/callback'),
('HIE001', 'Sample Health Information Exchange', 'hie', 'http://localhost:8080/hie/callback')
ON CONFLICT (participant_code) DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hcx_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hcx_user;

