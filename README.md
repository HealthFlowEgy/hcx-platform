# HCX Protocol v0.9 Implementation for Egyptian Healthcare
## Zero-Disruption Integration with HealthFlow System

[![HCX Protocol](https://img.shields.io/badge/HCX%20Protocol-v0.9-blue.svg)](https://docs.hcxprotocol.io/)
[![FHIR](https://img.shields.io/badge/FHIR-R4-green.svg)](https://hl7.org/fhir/R4/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Cloud Deployment](#cloud-deployment)
- [HCX Protocol Compliance](#hcx-protocol-compliance)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [Support](#support)

---

## 🎯 Overview

This implementation provides **complete HCX Protocol v0.9 compliance** for the Egyptian healthcare ecosystem while maintaining **zero disruption** to existing HealthFlow operations.

### Key Features

✅ **Full HCX Protocol v0.9 Support**
- Coverage eligibility checking
- Pre-authorization workflows
- Claims submission and tracking
- Real-time status monitoring
- Participant registry management

✅ **FHIR R4 Compliance**
- Complete FHIR bundle creation and validation
- Egyptian healthcare localization
- Resource transformation and mapping

✅ **Zero-Disruption Integration**
- Existing HealthFlow functionality unchanged
- Additive development approach
- Feature flags for gradual rollout
- Complete rollback capability

✅ **Production-Ready**
- Kubernetes deployment
- Comprehensive monitoring
- Security best practices
- Performance optimization

### Egyptian Healthcare Localization

- **Arabic/English bilingual support**
- **Egyptian National ID validation**
- **Local insurance payor integration**
- **Egyptian phone number validation**
- **Timezone and currency support**
- **Regulatory compliance**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   HealthFlow    │  HCX Portal     │    Mobile App               │
│   (Existing)    │  (New)          │   (Future)                  │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                               │
│           (Enhanced with HCX routing)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ HealthFlow    │    │ HCX Gateway   │    │ HCX FHIR      │
│ Services      │    │ Service       │    │ Service       │
│ (Unchanged)   │    │ (New)         │    │ (New)         │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   PostgreSQL    │      Redis      │   Kubernetes/Docker         │
│   (Enhanced)    │    (Shared)     │      (Orchestration)        │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Service Components

| Component | Purpose | Technology | Status |
|-----------|---------|------------|--------|
| **HCX Gateway** | HCX Protocol implementation | Spring Boot 3.0+ | ✅ Complete |
| **HCX FHIR Service** | FHIR R4 resource management | HAPI FHIR | ✅ Complete |
| **Frontend HCX Portal** | HCX user interface | React 18+ | ✅ Complete |
| **API Gateway** | Request routing & security | Spring Cloud Gateway | ✅ Enhanced |
| **Database** | Data persistence | PostgreSQL 15+ | ✅ Enhanced |
| **Monitoring** | Observability | Prometheus/Grafana | ✅ Complete |

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (for local development)
- **Kubernetes** (for cloud deployment)
- **Java 17+** (for backend development)
- **Node.js 18+** (for frontend development)

### 30-Second Setup

```bash
# 1. Clone the repository
git clone https://github.com/HealthFlowEgy/hcx-platform.git
cd hcx-platform

# 2. Start all services
docker-compose -f docker-compose.hcx-complete.yml up -d

# 3. Wait for services to be ready (2-3 minutes)
docker-compose logs -f hcx-gateway

# 4. Access applications
open http://localhost:3000      # HealthFlow (existing)
open http://localhost:3000/hcx  # HCX Portal (new)
open http://localhost:3002      # Monitoring Dashboard
```

### Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| **HealthFlow UI** | http://localhost:3000 | Existing prescription validation |
| **HCX Portal** | http://localhost:3000/hcx | HCX claims workflows |
| **HCX API** | http://localhost:8082/api/v1/hcx | HCX Protocol endpoints |
| **FHIR API** | http://localhost:8083/api/v1/fhir | FHIR resource management |
| **API Gateway** | http://localhost:8090 | Unified API access |
| **Monitoring** | http://localhost:3002 | Grafana dashboards |

---

## 💻 Local Development

### Development Environment Setup

```bash
# 1. Install dependencies
cd backend/hcx-gateway-service
./mvnw install

cd ../../frontend
npm install

# 2. Start development services
docker-compose up -d postgres redis

# 3. Start backend services
cd backend/hcx-gateway-service
./mvnw spring-boot:run

cd ../hcx-fhir-service
./mvnw spring-boot:run

# 4. Start frontend development server
cd ../../frontend
npm run dev
```

### Development Credentials

```bash
# Database
POSTGRES_USER=hcx_user
POSTGRES_PASSWORD=hcx_password
POSTGRES_DB=hcx

# HCX Configuration
HCX_PARTICIPANT_CODE=PROVIDER001
HCX_GATEWAY_URL=https://staging-hcx.healthcare.gov

# Test Credentials
TEST_PATIENT_ID=PAT001
TEST_PAYOR_CODE=PAYOR001
```

---

## ☁️ Cloud Deployment

### Kubernetes Deployment

```bash
# 1. Apply namespace and configurations
kubectl apply -f infrastructure/kubernetes/hcx/namespace.yaml
kubectl apply -f infrastructure/kubernetes/hcx/configmap.yaml
kubectl apply -f infrastructure/kubernetes/hcx/secrets.yaml

# 2. Deploy services
kubectl apply -f infrastructure/kubernetes/hcx/

# 3. Check deployment status
kubectl get pods -n healthcare-hcx
kubectl get services -n healthcare-hcx
```

### Docker Swarm Deployment

```bash
# 1. Initialize swarm (if not already done)
docker swarm init

# 2. Deploy stack
docker stack deploy -c docker-compose.hcx-complete.yml hcx-platform

# 3. Check services
docker service ls
```

---

## 🔒 HCX Protocol Compliance

### Supported Workflows

| Workflow | Endpoint | Status | Description |
|----------|----------|--------|-------------|
| **Coverage Eligibility** | `/coverage/eligibility/check` | ✅ | Patient coverage verification |
| **Pre-Authorization** | `/claim/pre_auth` | ✅ | Treatment approval requests |
| **Claims Submission** | `/claim/submit` | ✅ | Claims processing |
| **Status Inquiry** | `/claim/status` | ✅ | Real-time status tracking |
| **Communication** | `/communication/request` | ✅ | Additional information exchange |
| **Participant Search** | `/participant/search` | ✅ | Registry participant lookup |

### HCX Headers Implementation

```javascript
// Required HCX Headers
{
  "x-hcx-api_call_id": "uuid-v4",
  "x-hcx-correlation_id": "unique-correlation-id",
  "x-hcx-timestamp": "epoch-milliseconds",
  "x-hcx-sender_code": "PROVIDER001",
  "x-hcx-recipient_code": "PAYOR001",
  "x-hcx-status": "request",
  "x-hcx-protocol_version": "0.9"
}
```

### FHIR R4 Resources

- **Patient**: Egyptian National ID integration
- **Coverage**: Insurance coverage details
- **Claim**: Claims with Egyptian localization
- **CoverageEligibilityRequest**: Eligibility verification
- **Bundle**: FHIR resource collections

---

## 📚 API Documentation

### Coverage Eligibility Check

```http
POST /api/v1/hcx/coverage/eligibility/check
Content-Type: application/json
x-hcx-api_call_id: 550e8400-e29b-41d4-a716-446655440000
x-hcx-correlation_id: CORR-2024-001
x-hcx-sender_code: PROVIDER001
x-hcx-recipient_code: PAYOR001
x-hcx-status: request

{
  "patientId": "29501011234567",
  "payorCode": "EG-GOVT-HEALTH",
  "serviceCategory": "outpatient",
  "serviceCodes": ["99213", "80053"]
}
```

### Claims Submission

```http
POST /api/v1/hcx/claim/submit
Content-Type: application/json
[HCX Headers...]

{
  "patientId": "29501011234567",
  "payorCode": "EG-GOVT-HEALTH",
  "serviceDate": "2024-01-15",
  "diagnosis": [
    {
      "code": "J44.0",
      "description": "COPD with acute lower respiratory infection",
      "type": "primary"
    }
  ],
  "procedures": [
    {
      "code": "99214",
      "description": "Office visit - established patient",
      "quantity": 1,
      "unitPrice": 150.00
    }
  ],
  "totalAmount": 150.00
}
```

---

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
cd backend/hcx-gateway-service
./mvnw test

# Frontend tests
cd frontend
npm test
```

### Integration Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

### HCX Protocol Tests

```bash
# Test HCX compliance
npm run test:hcx-compliance

# Test FHIR validation
npm run test:fhir-validation
```

---

## 📊 Monitoring

### Prometheus Metrics

- **HCX Request Metrics**: Success/failure rates, response times
- **FHIR Validation Metrics**: Validation success rates
- **Business Metrics**: Claims processed, eligibility checks

### Grafana Dashboards

- **HCX Protocol Dashboard**: Real-time HCX metrics
- **FHIR Compliance Dashboard**: FHIR validation statistics
- **Business Intelligence Dashboard**: Healthcare analytics

### Health Checks

```bash
# Service health checks
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health

# HCX protocol health
curl http://localhost:8082/api/v1/hcx/health
```

---

## 🤝 Contributing

### Development Guidelines

1. **Follow HCX Protocol v0.9 specifications**
2. **Maintain FHIR R4 compliance**
3. **Add comprehensive tests**
4. **Update documentation**
5. **Egyptian healthcare localization**

### Code Standards

- **Java**: Spring Boot best practices
- **TypeScript**: React functional components
- **API**: RESTful design principles
- **Documentation**: OpenAPI 3.0 specifications

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

---

## 📞 Support

### Documentation

- **HCX Integration Guide**: [HCX_INTEGRATION_README.md](./HCX_INTEGRATION_README.md)
- **API Documentation**: [Swagger UI](http://localhost:8082/swagger-ui.html)
- **FHIR Documentation**: [FHIR Implementation Guide](./docs/fhir-implementation.md)

### Community

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/HealthFlowEgy/hcx-platform/issues)
- **Discussions**: [Community discussions](https://github.com/HealthFlowEgy/hcx-platform/discussions)
- **Wiki**: [Technical documentation](https://github.com/HealthFlowEgy/hcx-platform/wiki)

### Contact

- **Email**: support@healthflow.eg
- **Website**: [https://healthflow.eg](https://healthflow.eg)
- **LinkedIn**: [HealthFlow Egypt](https://linkedin.com/company/healthflow-egypt)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **HCX Protocol Team** for the comprehensive specifications
- **HL7 FHIR Community** for the FHIR R4 standard
- **Egyptian Ministry of Health** for regulatory guidance
- **Open Source Community** for the amazing tools and libraries

---

**Built with ❤️ for Egyptian Healthcare by HealthFlow Team**
