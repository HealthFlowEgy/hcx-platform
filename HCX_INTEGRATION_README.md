# HCX Protocol Integration

This document describes the HCX (Health Claims Exchange) protocol integration implemented in this platform.

## Overview

The HCX integration follows a **zero-disruption implementation strategy** where new HCX-compliant components are added alongside existing ones without affecting current functionality.

## Architecture

### Backend Services

#### HCX Gateway Service
- **Port**: 8082
- **Purpose**: Primary gateway for all HCX protocol communication
- **Features**:
  - HCX header validation and creation
  - FHIR resource validation
  - Coverage eligibility checks
  - Pre-authorization requests
  - Claims submission
  - Status tracking

#### HCX FHIR Service
- **Port**: 8083
- **Purpose**: FHIR resource management and validation
- **Features**:
  - FHIR R4 compliance validation
  - Bundle creation for HCX operations
  - Resource transformation

### Frontend Components

#### HCX Dashboard
- Real-time metrics and monitoring
- Quick access to HCX operations
- Claims processing statistics

#### Coverage Eligibility Check
- Patient coverage verification
- Service-specific eligibility checks
- Real-time validation results

#### Claims Submission
- Comprehensive claims form
- Diagnosis and procedure management
- Supporting document upload
- Real-time submission tracking

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Java 11+
- Node.js 18+
- PostgreSQL 15+

### Local Development

1. **Start the complete HCX platform**:
   ```bash
   docker-compose -f docker-compose.hcx-complete.yml up -d
   ```

2. **Access the services**:
   - HCX Gateway: http://localhost:8082
   - HCX FHIR Service: http://localhost:8083
   - Demo App: http://localhost:3000
   - Onboarding App: http://localhost:3001
   - Grafana: http://localhost:3002

3. **Health checks**:
   ```bash
   curl http://localhost:8082/api/v1/hcx/health
   curl http://localhost:8083/health
   ```

### Configuration

#### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HCX_PARTICIPANT_CODE` | Your HCX participant identifier | `PROVIDER001` |
| `HCX_GATEWAY_URL` | HCX gateway endpoint | `https://hcx-gateway.healthcare.gov` |
| `HCX_PROTOCOL_VERSION` | HCX protocol version | `0.9` |
| `DATABASE_URL` | PostgreSQL connection string | `jdbc:postgresql://localhost:5432/hcx` |
| `FHIR_SERVICE_URL` | FHIR service endpoint | `http://localhost:8083` |

## API Endpoints

### Coverage Eligibility
```http
POST /api/v1/hcx/coverage/eligibility/check
Content-Type: application/json

{
  "patientId": "PAT001",
  "payorCode": "PAYOR001",
  "recipientCode": "PAYOR001",
  "serviceCategory": "outpatient",
  "serviceCodes": ["99213", "80053"]
}
```

### Pre-Authorization
```http
POST /api/v1/hcx/claim/pre_auth
Content-Type: application/json

{
  "patientId": "PAT001",
  "payorCode": "PAYOR001",
  "recipientCode": "PAYOR001",
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
      "description": "Office visit",
      "quantity": 1,
      "unitPrice": 150.00
    }
  ],
  "estimatedCost": 150.00
}
```

### Claims Submission
```http
POST /api/v1/hcx/claim/submit
Content-Type: application/json

{
  "patientId": "PAT001",
  "payorCode": "PAYOR001",
  "recipientCode": "PAYOR001",
  "serviceDate": "2024-01-15",
  "diagnosis": [...],
  "procedures": [...],
  "totalAmount": 850.00,
  "supportingDocuments": ["doc1.pdf", "doc2.jpg"]
}
```

### Status Check
```http
GET /api/v1/hcx/claim/status/{correlationId}
```

## Deployment

### Docker Compose
```bash
# Development environment
docker-compose up -d

# Complete HCX environment
docker-compose -f docker-compose.hcx-complete.yml up -d
```

### Kubernetes
```bash
# Apply HCX-specific configurations
kubectl apply -f infrastructure/kubernetes/hcx/

# Check deployment status
kubectl get pods -n healthcare-hcx
```

## Monitoring

### Prometheus Metrics
- Available at: http://localhost:9090
- Metrics include:
  - Request rates and latencies
  - FHIR validation success rates
  - HCX protocol compliance metrics

### Grafana Dashboards
- Available at: http://localhost:3002
- Default credentials: admin/admin
- Pre-configured dashboards for HCX monitoring

## Testing

### Unit Tests
```bash
# Backend tests
cd backend/hcx-gateway-service
mvn test

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

## Security

### Authentication
- JWT-based authentication
- HCX participant verification
- Role-based access control

### Data Protection
- End-to-end encryption
- FHIR data validation
- Audit trail logging

## Compliance

### HCX Protocol v0.9
- Full compliance with HCX specifications
- FHIR R4 resource validation
- Proper header management
- Error handling as per protocol

### Standards
- HL7 FHIR R4
- OAuth 2.0 / JWT
- REST API best practices

## Troubleshooting

### Common Issues

1. **Service not starting**:
   - Check database connectivity
   - Verify environment variables
   - Check port conflicts

2. **FHIR validation errors**:
   - Ensure FHIR R4 compliance
   - Check resource structure
   - Validate against FHIR schemas

3. **HCX communication failures**:
   - Verify participant code
   - Check HCX gateway connectivity
   - Validate headers format

### Logs
```bash
# View service logs
docker-compose logs -f hcx-gateway
docker-compose logs -f hcx-fhir-service

# Application logs location
tail -f /var/log/hcx-gateway/application.log
```

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure HCX protocol compliance

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/HealthFlowEgy/hcx-platform/issues)
- Documentation: [Wiki](https://github.com/HealthFlowEgy/hcx-platform/wiki)
