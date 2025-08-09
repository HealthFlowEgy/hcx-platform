# HCX Platform - Health Claims Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)]()

## Overview

The Health Claims Exchange (HCX) Platform is an open-source, interoperable healthcare claims processing system built on HL7 FHIR R4 standards. It enables seamless communication between healthcare providers, insurance companies, and other stakeholders in the healthcare ecosystem.

### Key Features

- **FHIR R4 Compliance**: Built on international healthcare interoperability standards
- **Microservices Architecture**: Scalable and maintainable service-oriented design
- **Asynchronous Processing**: Handles high-volume claims processing efficiently
- **Security & Privacy**: End-to-end encryption, digital signatures, and audit trails
- **Multi-tenant Support**: Supports multiple healthcare organizations
- **Real-time Monitoring**: Comprehensive logging and monitoring capabilities

## Architecture

The HCX Platform consists of the following core components:

- **HCX APIs**: Core business logic and FHIR-compliant APIs
- **API Gateway**: Entry point for all external communications
- **Registry Services**: Participant and configuration management
- **Pipeline Jobs**: Asynchronous processing workflows
- **Demo Applications**: Reference implementations and testing tools

## Quick Start with Docker

### Prerequisites

- Docker (version 20.0 or higher)
- Docker Compose (version 1.29 or higher)
- 8GB RAM minimum
- 20GB free disk space

### 1. Clone the Repository

```bash
git clone https://github.com/HealthFlowEgy/hcx-platform.git
cd hcx-platform
```

### 2. Start the Platform

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Verify Installation

```bash
# Check API health
curl http://localhost:8080/health

# Check API Gateway
curl http://localhost:8090/health

# Access Demo Application
open http://localhost:3000
```

## Manual Installation

### Prerequisites

- Java 11 or higher
- Maven 3.6 or higher
- PostgreSQL 12 or higher
- Apache Kafka 2.8 or higher
- Redis 6.0 or higher

### 1. Database Setup

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE hcx;
CREATE USER hcx_user WITH PASSWORD 'hcx_password';
GRANT ALL PRIVILEGES ON DATABASE hcx TO hcx_user;
\q

# Initialize database
psql -h localhost -U hcx_user -d hcx -f scripts/init-db.sql
```

### 2. Kafka Setup

```bash
# Using Docker for Kafka (recommended)
docker-compose up -d zookeeper kafka

# Or install Kafka manually
# Download and extract Kafka
wget https://downloads.apache.org/kafka/2.8.0/kafka_2.13-2.8.0.tgz
tar -xzf kafka_2.13-2.8.0.tgz
cd kafka_2.13-2.8.0

# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka
bin/kafka-server-start.sh config/server.properties
```

### 3. Redis Setup

```bash
# Install Redis
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 4. Build and Run

```bash
# Build the platform
mvn clean install -DskipTests

# Start HCX APIs
cd hcx-apis
mvn spring-boot:run

# Start API Gateway (in new terminal)
cd api-gateway
mvn spring-boot:run
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hcx
DB_USER=hcx_user
DB_PASSWORD=hcx_password

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application Configuration
HCX_APIS_PORT=8080
API_GATEWAY_PORT=8090
DEMO_APP_PORT=3000

# Security Configuration
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# External Services
REGISTRY_URL=http://localhost:8080/registry
AUDIT_SERVICE_URL=http://localhost:8080/audit
```

### Application Properties

Key configuration files:

- `hcx-apis/src/main/resources/application.yml`
- `api-gateway/src/main/resources/application.yml`

## API Documentation

### Core Endpoints

- **Health Check**: `GET /health`
- **Coverage Eligibility**: `POST /coverageeligibility/check`
- **Pre-authorization**: `POST /preauth/submit`
- **Claims**: `POST /claim/submit`
- **Registry**: `GET /participant/search`

### FHIR Resources

The platform supports the following FHIR R4 resources:

- CoverageEligibilityRequest/Response
- Claim/ClaimResponse
- Patient
- Practitioner
- Organization
- Coverage

### Authentication

All API calls require JWT authentication:

```bash
# Get access token
curl -X POST http://localhost:8090/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "your-username", "password": "your-password"}'

# Use token in API calls
curl -X GET http://localhost:8080/participant/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Project Structure

```
hcx-platform/
├── api-gateway/          # API Gateway service
├── hcx-apis/            # Core HCX APIs
├── hcx-core/            # Shared libraries
│   ├── hcx-common/      # Common utilities
│   ├── kafka-client/    # Kafka integration
│   ├── postgresql-client/ # Database client
│   └── redis-cache/     # Redis integration
├── hcx-pipeline-jobs/   # Asynchronous processing
├── demo-app/            # Demo application
├── onboarding-app/      # Participant onboarding
├── docs/                # Documentation
└── scripts/             # Deployment scripts
```

### Building from Source

```bash
# Clean build
mvn clean compile

# Run tests
mvn test

# Package applications
mvn package

# Install to local repository
mvn install
```

### Running Tests

```bash
# Unit tests
mvn test

# Integration tests
mvn verify

# Coverage report
mvn jacoco:report
```

## Deployment

### Production Deployment

1. **Environment Setup**
   - Use production-grade databases (PostgreSQL cluster)
   - Configure Kafka cluster for high availability
   - Set up Redis cluster for caching
   - Use load balancers for API services

2. **Security Configuration**
   - Enable HTTPS/TLS encryption
   - Configure proper JWT secrets
   - Set up certificate management
   - Enable audit logging

3. **Monitoring**
   - Configure application monitoring (Prometheus/Grafana)
   - Set up log aggregation (ELK stack)
   - Configure alerting rules
   - Monitor database performance

### Kubernetes Deployment

Kubernetes manifests are available in the `k8s/` directory:

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n hcx

# Access services
kubectl port-forward svc/hcx-api-gateway 8090:8090
```

### Cloud Deployment

#### AWS
- Use RDS for PostgreSQL
- Use MSK for Kafka
- Use ElastiCache for Redis
- Deploy on EKS or ECS

#### Azure
- Use Azure Database for PostgreSQL
- Use Event Hubs for Kafka
- Use Azure Cache for Redis
- Deploy on AKS or Container Instances

#### Google Cloud
- Use Cloud SQL for PostgreSQL
- Use Pub/Sub for messaging
- Use Memorystore for Redis
- Deploy on GKE or Cloud Run

## Monitoring and Observability

### Health Checks

```bash
# Application health
curl http://localhost:8080/health

# Database connectivity
curl http://localhost:8080/health/db

# Kafka connectivity
curl http://localhost:8080/health/kafka

# Redis connectivity
curl http://localhost:8080/health/redis
```

### Metrics

The platform exposes Prometheus metrics at `/actuator/prometheus`:

- Request rates and latencies
- Database connection pool metrics
- Kafka consumer/producer metrics
- JVM metrics

### Logging

Structured logging is configured with:

- JSON format for production
- Correlation IDs for request tracing
- Configurable log levels
- Integration with ELK stack

## Security

### Data Protection

- All sensitive data is encrypted at rest
- TLS encryption for data in transit
- JWT-based authentication
- Role-based access control (RBAC)

### Compliance

- HIPAA compliance ready
- GDPR compliance features
- Audit trail for all operations
- Data retention policies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Java coding standards
- Write unit tests for new features
- Update documentation
- Ensure FHIR compliance

## Support

### Documentation

- [API Documentation](docs/api/)
- [FHIR Implementation Guide](docs/fhir/)
- [Deployment Guide](docs/deployment/)
- [Troubleshooting](docs/troubleshooting/)

### Community

- [GitHub Issues](https://github.com/HealthFlowEgy/hcx-platform/issues)
- [Discussions](https://github.com/HealthFlowEgy/hcx-platform/discussions)
- [Wiki](https://github.com/HealthFlowEgy/hcx-platform/wiki)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original HCX Platform by Swasth Digital Health Foundation
- HL7 FHIR Community
- Open source contributors

---

**Note**: This is a community-maintained fork of the original HCX platform, adapted for broader deployment and enhanced with additional features for production use.

