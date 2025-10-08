# HCX Platform - Sprint 1 Implementation Guide

## Overview

This document provides comprehensive guidance for the Sprint 1 infrastructure enhancement of the HCX Platform. The implementation follows a **zero-disruption deployment strategy** to ensure existing services remain operational while new infrastructure is added.

## Sprint 1 Goals

1. **Infrastructure Foundation**: Establish robust development environment with Docker Compose
2. **Provider Network Management**: Implement database schema for provider directory
3. **Monitoring & Observability**: Deploy Prometheus, Grafana, and ELK stack
4. **CI/CD Pipeline**: Automate testing, building, and deployment processes
5. **AI Services Foundation**: Prepare infrastructure for AI-powered policy digitization

## Architecture

### System Components

```
HCX Platform Sprint 1 Architecture:
├── Core Services
│   ├── HCX Gateway (Java/Spring Boot) - Port 8080
│   ├── PostgreSQL Database - Port 5432
│   ├── Redis Cache - Port 6379
│   └── Kafka Message Queue - Ports 9092/9093
├── Monitoring Stack
│   ├── Prometheus - Port 9090
│   └── Grafana - Port 3000
├── Logging Stack (ELK)
│   ├── Elasticsearch - Port 9200
│   ├── Logstash - Port 5044
│   └── Kibana - Port 5601
└── AI Services
    └── Policy Digitization Service - Port 8081
```

### Network Architecture

All services run on a dedicated Docker network (`hcx-network` - 172.25.0.0/16) with service discovery and health checks enabled.

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: Latest version
- **Make**: For running Makefile commands

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: Minimum 20GB free
- **OS**: Linux, macOS, or Windows with WSL2

### Required Ports

Ensure the following ports are available:
- 5432 (PostgreSQL)
- 6379 (Redis)
- 8080 (HCX Gateway)
- 9090 (Prometheus)
- 3000 (Grafana)
- 9200 (Elasticsearch)
- 5601 (Kibana)
- 9092/9093 (Kafka)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/HealthFlowEgy/hcx-platform.git
cd hcx-platform
```

### 2. Checkout Sprint 1 Branch

```bash
git checkout feature/sprint-01-infrastructure
```

### 3. Run Setup

```bash
# Using Makefile (recommended)
make sprint1-setup

# Or using setup script
./scripts/setup-sprint1.sh full
```

### 4. Verify Deployment

```bash
make sprint1-validate
```

## Detailed Setup Instructions

### Step 1: Environment Configuration

Create environment file from template:

```bash
cp .env.sprint1 .env
```

Edit `.env` and configure:
- Database passwords
- Redis password
- JWT secret
- OpenAI API key (for AI services)
- Grafana admin password

### Step 2: Start Core Services

```bash
# Start database and cache first
make start-core

# Wait for services to be ready
make health
```

### Step 3: Initialize Database

```bash
# Run database migrations and load sample data
make init-db
```

### Step 4: Start Monitoring Stack

```bash
make start-monitoring
```

### Step 5: Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| HCX Gateway | http://localhost:8080 | N/A |
| API Documentation | http://localhost:8080/swagger-ui.html | N/A |
| Grafana | http://localhost:3000 | admin / admin123 |
| Prometheus | http://localhost:9090 | N/A |
| Kibana | http://localhost:5601 | N/A |
| PgAdmin | http://localhost:5050 | admin@hcx.local / admin123 |

## Database Schema

### Provider Network Tables

#### `providers`
Stores provider information including hospitals, clinics, pharmacies, and diagnostic centers.

**Key Fields:**
- `provider_id` (UUID, Primary Key)
- `provider_code` (Unique identifier)
- `provider_name`
- `provider_type` (hospital, clinic, pharmacy, diagnostic, lab, imaging_center)
- `city`, `state` (with indexes for fast searching)
- `latitude`, `longitude` (for geolocation)
- `status` (active, inactive, suspended, pending)

#### `network_relationships`
Manages provider-payor network agreements.

**Key Fields:**
- `provider_id` (Foreign Key to providers)
- `payor_id` (Reference to payor)
- `network_tier` (preferred, standard, out_of_network)
- `agreement_start_date`, `agreement_end_date`
- `is_active`

#### `provider_performance`
Tracks provider performance metrics over time.

**Key Fields:**
- `provider_id` (Foreign Key to providers)
- `metric_period` (daily, weekly, monthly, quarterly, yearly)
- `total_claims_submitted`, `claims_approved`, `claims_rejected`
- `total_claim_amount`, `approved_amount`
- `approval_rate`, `rejection_rate`

#### `provider_services`
Catalogs services offered by each provider.

**Key Fields:**
- `provider_id` (Foreign Key to providers)
- `service_code`, `service_name`
- `service_category`
- `is_available`, `price`

### Sample Data

The setup includes 30 sample Egyptian healthcare providers:
- 15 Hospitals (Cairo, Alexandria, Mansoura, etc.)
- 5 Clinics
- 5 Pharmacies
- 5 Diagnostic/Imaging Centers

## Makefile Commands

### General Commands

```bash
make help              # Display all available commands
make check-requirements # Verify prerequisites
```

### Service Management

```bash
make start             # Start all services
make start-core        # Start only core services
make start-monitoring  # Start monitoring stack
make stop              # Stop all services
make restart           # Restart all services
make status            # Check service status
make health            # Run health checks
```

### Database Operations

```bash
make db-shell          # Open PostgreSQL shell
make db-backup         # Backup all databases
make db-restore        # Restore from backup
make db-reset          # Reset database (WARNING: destroys data)
```

### Logs & Monitoring

```bash
make logs              # Tail all logs
make logs-gateway      # Tail gateway logs
make logs-postgres     # Tail PostgreSQL logs
make logs-errors       # Show only error logs
```

### Development

```bash
make build             # Build all Docker images
make test              # Run all tests
make test-integration  # Run integration tests
make lint              # Run code linting
```

### Sprint 1 Specific

```bash
make sprint1-setup     # Complete Sprint 1 setup
make sprint1-validate  # Validate deployment
make sprint1-teardown  # Tear down environment
```

## CI/CD Pipeline

### Workflow Triggers

The CI/CD pipeline runs on:
- Pull requests to `main`, `develop`, or `feature/sprint-01-infrastructure`
- Pushes to these branches
- Manual workflow dispatch

### Pipeline Stages

1. **Code Quality Analysis**
   - Maven verify
   - Checkstyle
   - Build artifact upload

2. **Backend Tests**
   - Unit tests with PostgreSQL and Redis
   - Test coverage reporting
   - Test result artifacts

3. **Security Scanning**
   - Trivy vulnerability scanner
   - SARIF report upload

4. **Docker Image Building**
   - Build gateway image
   - Tag with branch and SHA
   - Cache optimization

5. **Deployment Validation**
   - Docker Compose validation
   - Environment configuration check
   - Database script validation

### GitHub Secrets Required

Configure these secrets in GitHub repository settings:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token
- `SONAR_TOKEN` - SonarCloud token (optional)
- `SNYK_TOKEN` - Snyk token (optional)

## Monitoring & Observability

### Prometheus Metrics

Prometheus scrapes metrics from:
- HCX Gateway (`/actuator/prometheus`)
- AI Policy Service (`/metrics`)
- PostgreSQL (via exporter)
- Redis (via exporter)

**Key Metrics:**
- HTTP request rates and latencies
- Database connection pool stats
- Cache hit/miss rates
- JVM memory and GC metrics

### Grafana Dashboards

Access Grafana at http://localhost:3000

**Pre-configured Datasources:**
- Prometheus (default)
- Elasticsearch

**Recommended Dashboards:**
- Spring Boot Statistics
- PostgreSQL Database
- Redis
- JVM Micrometer

### ELK Stack Logging

**Elasticsearch**: Stores all application logs
**Logstash**: Processes and forwards logs
**Kibana**: Visualizes and searches logs

**Index Pattern**: `hcx-logs-*`

**Log Fields:**
- `@timestamp` - Log timestamp
- `level` - Log level (INFO, WARN, ERROR)
- `message` - Log message
- `service` - Service name
- `environment` - Environment (development, staging, production)

## Troubleshooting

### Services Not Starting

```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs
make logs

# Verify ports are available
netstat -tuln | grep -E '(5432|6379|8080|9090|3000)'
```

### Database Connection Issues

```bash
# Check PostgreSQL health
docker exec hcx-postgres pg_isready -U hcx_user

# Check connection from gateway
docker exec hcx-gateway curl -f postgres:5432

# View PostgreSQL logs
make logs-postgres
```

### Gateway Not Responding

```bash
# Check gateway health
curl http://localhost:8080/actuator/health

# View gateway logs
make logs-gateway

# Restart gateway
make restart-gateway
```

### Out of Memory Errors

```bash
# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → 8GB+

# Check container memory usage
docker stats
```

## Zero-Disruption Deployment Strategy

### Principles

1. **Isolation**: New services run in isolated containers
2. **Backward Compatibility**: Existing APIs remain unchanged
3. **Gradual Rollout**: Services added incrementally
4. **Health Checks**: Automated health monitoring
5. **Rollback Ready**: Easy rollback to previous state

### Deployment Steps

1. **Backup**: Create database and configuration backups
2. **Feature Branch**: Work in isolated Git branch
3. **Incremental Deployment**: Deploy services one at a time
4. **Validation**: Run health checks after each step
5. **Monitoring**: Watch metrics and logs
6. **Rollback Plan**: Document rollback procedures

### Rollback Procedure

```bash
# Stop new services
make stop

# Restore from backup
make db-restore BACKUP_FILE=backups/hcx-backup-YYYYMMDD_HHMMSS.sql

# Checkout previous version
git checkout main

# Restart original services
docker-compose up -d
```

## Best Practices

### Development

- Always work in feature branches
- Write tests for new features
- Use meaningful commit messages
- Keep Docker images small and efficient
- Use environment variables for configuration

### Operations

- Monitor logs regularly
- Set up alerts for critical errors
- Backup database daily
- Keep Docker images updated
- Document configuration changes

### Security

- Never commit secrets to Git
- Use strong passwords
- Keep dependencies updated
- Run security scans regularly
- Limit network exposure

## Next Steps (Sprint 2)

1. **Frontend Development**
   - Provider portal UI
   - Payor portal UI
   - Beneficiary portal UI

2. **AI Services**
   - Policy digitization API
   - Document OCR integration
   - Natural language processing

3. **Provider Network APIs**
   - Provider search and filtering
   - Network management endpoints
   - Performance analytics

4. **Integration Testing**
   - End-to-end test scenarios
   - Load testing
   - Security testing

## Support & Resources

### Documentation

- [HCX Protocol Specification](https://docs.hcxprotocol.io/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Documentation](https://docs.docker.com/)
- [Prometheus Documentation](https://prometheus.io/docs/)

### Contact

- **Team**: HealthFlow Egypt Development Team
- **Repository**: https://github.com/HealthFlowEgy/hcx-platform
- **Issues**: https://github.com/HealthFlowEgy/hcx-platform/issues

## Changelog

### Sprint 1 (October 2025)

- ✅ Docker Compose infrastructure setup
- ✅ PostgreSQL multi-database configuration
- ✅ Provider network schema implementation
- ✅ Sample data loading (30 providers)
- ✅ Prometheus + Grafana monitoring
- ✅ ELK stack logging
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Makefile automation
- ✅ Comprehensive documentation

---

**Last Updated**: October 8, 2025  
**Version**: Sprint 1.0  
**Status**: Implementation Complete
