# HCX Platform API Documentation

## Overview

This directory contains the OpenAPI 3.0 specification for the HCX Platform API.

## Files

- `openapi.yaml` - Complete OpenAPI 3.0 specification
- `README.md` - This file

## Viewing the Documentation

### Option 1: Swagger UI (Recommended)

```bash
# Install Swagger UI
npm install -g swagger-ui-watcher

# Serve the documentation
swagger-ui-watcher docs/api/openapi.yaml
```

Then open http://localhost:8000 in your browser.

### Option 2: Redoc

```bash
# Install Redoc CLI
npm install -g redoc-cli

# Generate static HTML
redoc-cli bundle docs/api/openapi.yaml -o docs/api/index.html

# Serve the documentation
npx serve docs/api
```

### Option 3: Online Viewers

Upload `openapi.yaml` to:
- https://editor.swagger.io/
- https://redocly.github.io/redoc/

## Generating Client SDKs

### JavaScript/TypeScript

```bash
npx @openapitools/openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o packages/api-client
```

### Python

```bash
openapi-generator generate \
  -i docs/api/openapi.yaml \
  -g python \
  -o python-client
```

### Java

```bash
openapi-generator generate \
  -i docs/api/openapi.yaml \
  -g java \
  -o java-client
```

## Generating Postman Collection

```bash
# Install openapi-to-postmanv2
npm install -g openapi-to-postmanv2

# Convert to Postman collection
openapi2postmanv2 \
  -s docs/api/openapi.yaml \
  -o docs/api/HCX-Platform.postman_collection.json \
  -p
```

## API Endpoints Summary

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Claims
- `GET /claims` - List claims
- `POST /claims` - Submit new claim
- `GET /claims/{claimId}` - Get claim details
- `GET /claims/{claimId}/status` - Get claim status history

### Documents
- `POST /documents/upload` - Upload document
- `GET /documents/{documentId}` - Get document
- `DELETE /documents/{documentId}` - Delete document

### Communication
- `POST /communication/request` - Send query
- `GET /communication/queries` - List queries
- `GET /communication/queries/{queryId}` - Get query thread
- `POST /communication/response` - Send response
- `POST /communication/queries/{queryId}/resolve` - Mark query as resolved

### Dashboard
- `GET /dashboard/provider` - Get provider dashboard data
- `GET /dashboard/provider/metrics` - Get dashboard metrics

### Policy Review
- `GET /policies/{policyId}/review` - Get policy review data
- `PATCH /policies/{policyId}/fields/{fieldId}` - Update extracted field
- `POST /policies/{policyId}/approval` - Submit policy approval

## Authentication

All endpoints (except `/auth/login`) require JWT bearer token authentication.

### Getting a Token

```bash
curl -X POST https://api.hcx.healthflow.tech/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "SecurePassword123!"
  }'
```

### Using the Token

```bash
curl -X GET https://api.hcx.healthflow.tech/v1/claims \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Rate Limiting

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

## Error Handling

All errors follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Webhooks

The HCX Platform can send webhooks for real-time updates:

- Claim status changes
- New query messages
- Document processing completion
- Policy approval/rejection

Configure webhooks in your provider dashboard.

## Support

For API support, contact:
- Email: support@healthflow.tech
- Documentation: https://docs.healthflow.tech
- GitHub Issues: https://github.com/HealthFlowEgy/hcx-platform/issues

## Changelog

### Version 1.0.0 (2025-10-09)
- Initial API release
- Claims management endpoints
- Document upload and management
- Communication/query system
- Provider dashboard
- Policy digitization review

## License

Apache 2.0 - See LICENSE file for details
