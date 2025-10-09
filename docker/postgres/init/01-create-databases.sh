#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create additional databases
    CREATE DATABASE hcx_registry;
    CREATE DATABASE hcx_claims;
    CREATE DATABASE hcx_analytics;
    CREATE DATABASE hcx_ai_services;
    
    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE hcx_registry TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE hcx_claims TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE hcx_analytics TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE hcx_ai_services TO $POSTGRES_USER;
    
    -- Create extensions in main database
    \\c hcx_gateway
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Create extensions in other databases
    \\c hcx_registry
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    \\c hcx_claims
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    \\c hcx_ai_services
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    \\c hcx_analytics
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "✓ Multiple databases created successfully"
