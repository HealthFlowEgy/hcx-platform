#!/bin/bash

###############################################################################
# HCX Protocol - Sprint 1 Setup Script
# Zero-Disruption Infrastructure Deployment
# 
# Usage:
#   ./setup-sprint1.sh            # Full setup
#   ./setup-sprint1.sh core       # Core services only
#   ./setup-sprint1.sh monitoring # Add monitoring stack
###############################################################################

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="hcx-platform"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./logs/setup-$(date +%Y%m%d_%H%M%S).log"
REQUIRED_DOCKER_VERSION="20.10"
REQUIRED_COMPOSE_VERSION="2.0"

###############################################################################
# Utility Functions
###############################################################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install $1 and try again."
        exit 1
    fi
}

version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

###############################################################################
# Pre-flight Checks
###############################################################################

preflight_checks() {
    log "Running pre-flight checks..."
    
    # Check Docker
    check_command docker
    DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+' | head -1)
    log "✓ Docker version: $DOCKER_VERSION"
    
    # Check Docker Compose
    check_command docker-compose
    COMPOSE_VERSION=$(docker-compose --version | grep -oP '\d+\.\d+' | head -1)
    log "✓ Docker Compose version: $COMPOSE_VERSION"
    
    # Check available disk space (minimum 20GB)
    AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -lt 20 ]; then
        log_warning "Low disk space: ${AVAILABLE_SPACE}GB available. Recommended: 20GB+"
    else
        log "✓ Disk space: ${AVAILABLE_SPACE}GB available"
    fi
    
    # Check if ports are available
    REQUIRED_PORTS=(5432 6379 8080 9090 3000 5601 9200)
    for PORT in "${REQUIRED_PORTS[@]}"; do
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Port $PORT is already in use"
        fi
    done
    
    log "✓ Pre-flight checks completed"
}

###############################################################################
# Environment Setup
###############################################################################

setup_environment() {
    log "Setting up environment..."
    
    # Create necessary directories
    mkdir -p logs backups data secrets
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        log "Creating .env file from template..."
        cp .env.sprint1 .env
        log "✓ .env file created"
    else
        log "✓ .env file already exists"
    fi
    
    log "✓ Environment setup completed"
}

###############################################################################
# Start Services
###############################################################################

start_services() {
    local MODE=${1:-"full"}
    
    log "Starting HCX services (mode: $MODE)..."
    
    case $MODE in
        core)
            log "Starting core services only..."
            docker-compose -f docker-compose.sprint1.yml up -d postgres redis kafka zookeeper hcx-gateway
            ;;
        monitoring)
            log "Starting monitoring stack..."
            docker-compose -f docker-compose.sprint1.yml up -d prometheus grafana elasticsearch logstash kibana
            ;;
        full|*)
            log "Starting all services..."
            docker-compose -f docker-compose.sprint1.yml up -d
            ;;
    esac
    
    log "Waiting for services to be healthy..."
    sleep 15
    
    # Wait for PostgreSQL
    log "Waiting for PostgreSQL..."
    until docker exec hcx-postgres pg_isready -U hcx_user -d hcx_gateway > /dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    echo ""
    log "✓ PostgreSQL is ready"
    
    # Wait for Redis
    log "Waiting for Redis..."
    until docker exec hcx-redis redis-cli ping > /dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    echo ""
    log "✓ Redis is ready"
    
    log "✓ Services started successfully"
}

###############################################################################
# Initialize Database
###############################################################################

initialize_database() {
    log "Initializing database..."
    
    sleep 5
    
    # Load sample data
    if [ -f docker/postgres/seed/01-sample-providers.sql ]; then
        log "Loading sample provider data..."
        docker exec -i hcx-postgres psql -U hcx_user -d hcx_gateway < docker/postgres/seed/01-sample-providers.sql || true
        log "✓ Sample data loaded"
    fi
    
    # Verify data
    PROVIDER_COUNT=$(docker exec hcx-postgres psql -U hcx_user -d hcx_gateway -t -c "SELECT COUNT(*) FROM providers;" 2>/dev/null | tr -d ' ' || echo "0")
    log "✓ Database initialized with $PROVIDER_COUNT providers"
}

###############################################################################
# Health Check
###############################################################################

health_check() {
    log "Running health checks..."
    
    HEALTHY=true
    
    # Check PostgreSQL
    if docker exec hcx-postgres pg_isready -U hcx_user > /dev/null 2>&1; then
        log "✓ PostgreSQL: Healthy"
    else
        log_error "✗ PostgreSQL: Unhealthy"
        HEALTHY=false
    fi
    
    # Check Redis
    if docker exec hcx-redis redis-cli ping > /dev/null 2>&1; then
        log "✓ Redis: Healthy"
    else
        log_error "✗ Redis: Unhealthy"
        HEALTHY=false
    fi
    
    # Check Gateway (with retry)
    for i in {1..5}; do
        if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
            log "✓ HCX Gateway: Healthy"
            break
        elif [ $i -eq 5 ]; then
            log_warning "✗ HCX Gateway: Not responding (may still be starting)"
        else
            sleep 5
        fi
    done
    
    if [ "$HEALTHY" = true ]; then
        log "✓ All critical services are healthy"
    else
        log_error "Some services are unhealthy. Check logs for details."
        return 1
    fi
}

###############################################################################
# Display Access Information
###############################################################################

display_info() {
    log "Sprint 1 Setup Complete!"
    echo ""
    echo -e "${BLUE}===========================================================${NC}"
    echo -e "${GREEN}HCX Platform Sprint 1 - Access Information${NC}"
    echo -e "${BLUE}===========================================================${NC}"
    echo ""
    echo -e "${YELLOW}Core Services:${NC}"
    echo "  HCX Gateway:     http://localhost:8080"
    echo "  API Docs:        http://localhost:8080/swagger-ui.html"
    echo "  Health Check:    http://localhost:8080/actuator/health"
    echo ""
    echo -e "${YELLOW}Monitoring:${NC}"
    echo "  Grafana:         http://localhost:3000 (admin/admin123)"
    echo "  Prometheus:      http://localhost:9090"
    echo "  Kibana:          http://localhost:5601"
    echo ""
    echo -e "${YELLOW}Development Tools:${NC}"
    echo "  PgAdmin:         http://localhost:5050 (admin@hcx.local/admin123)"
    echo "  Redis Commander: http://localhost:8082"
    echo "  Kafka UI:        http://localhost:8083"
    echo ""
    echo -e "${YELLOW}Database:${NC}"
    echo "  Host:            localhost:5432"
    echo "  Database:        hcx_gateway"
    echo "  User:            hcx_user"
    echo ""
    echo -e "${BLUE}===========================================================${NC}"
    echo ""
    echo -e "${GREEN}Next Steps:${NC}"
    echo "  1. Access Grafana to view metrics"
    echo "  2. Check Kibana for logs"
    echo "  3. Test API endpoints via Swagger"
    echo "  4. Run 'make sprint1-validate' to verify deployment"
    echo ""
}

###############################################################################
# Main Execution
###############################################################################

main() {
    local MODE=${1:-"full"}
    
    echo -e "${BLUE}===========================================================${NC}"
    echo -e "${GREEN}HCX Platform Sprint 1 - Setup Script${NC}"
    echo -e "${BLUE}===========================================================${NC}"
    echo ""
    
    preflight_checks
    setup_environment
    start_services "$MODE"
    
    if [ "$MODE" = "full" ] || [ "$MODE" = "core" ]; then
        initialize_database
    fi
    
    health_check
    display_info
    
    log "Setup completed successfully!"
}

# Run main function
main "$@"
