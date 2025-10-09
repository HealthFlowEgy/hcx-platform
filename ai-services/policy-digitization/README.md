# AI Policy Digitization Service

## Overview

AI-powered service for processing and digitizing insurance policy documents. This service uses OpenAI and LangChain to extract structured information from policy documents.

## Features (Sprint 1 - Foundation)

- ✅ FastAPI-based REST API
- ✅ Health check endpoint
- ✅ Prometheus metrics endpoint
- ✅ Policy document upload
- ✅ Policy processing (foundation)
- ✅ PostgreSQL integration ready
- ✅ Redis caching ready
- ✅ Docker containerization

## API Endpoints

### Health & Monitoring

- `GET /` - Service information
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation

### Policy Operations

- `POST /api/v1/policy/upload` - Upload policy document
- `POST /api/v1/policy/process` - Process policy and extract data
- `GET /api/v1/policy/{policy_id}` - Retrieve policy information

## Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here

# Database Configuration
POSTGRES_HOST=postgres
POSTGRES_DB=hcx_ai_services
POSTGRES_USER=hcx_user
POSTGRES_PASSWORD=your-password

# Redis Configuration
REDIS_HOST=redis
REDIS_PASSWORD=your-password
```

## Local Development

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis

### Setup

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=sk-your-key-here
export POSTGRES_HOST=localhost
export POSTGRES_DB=hcx_ai_services
export POSTGRES_USER=hcx_user
export POSTGRES_PASSWORD=your-password
export REDIS_HOST=localhost
export REDIS_PASSWORD=your-password

# Run the service
python src/main.py
```

### Access

- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Deployment

### Build Image

```bash
docker build -t hcx-ai-policy-service:latest .
```

### Run Container

```bash
docker run -d \
  --name ai-policy-service \
  -p 8000:8000 \
  -e OPENAI_API_KEY=sk-your-key-here \
  -e POSTGRES_HOST=postgres \
  -e POSTGRES_DB=hcx_ai_services \
  -e POSTGRES_USER=hcx_user \
  -e POSTGRES_PASSWORD=your-password \
  -e REDIS_HOST=redis \
  -e REDIS_PASSWORD=your-password \
  hcx-ai-policy-service:latest
```

## Docker Compose

The service is included in the main `docker-compose.sprint1.yml`:

```bash
# Start with all services
docker-compose -f docker-compose.sprint1.yml up -d

# Start AI service only
docker-compose -f docker-compose.sprint1.yml up -d ai-policy-service
```

## Testing

### Run Tests

```bash
pytest tests/ -v --cov=src
```

### Manual API Testing

```bash
# Health check
curl http://localhost:8000/health

# Upload policy (with file)
curl -X POST http://localhost:8000/api/v1/policy/upload \
  -F "file=@policy.pdf"

# Process policy
curl -X POST http://localhost:8000/api/v1/policy/process \
  -H "Content-Type: application/json" \
  -d '{
    "policy_type": "health",
    "document_url": "https://example.com/policy.pdf"
  }'
```

## Architecture

```
ai-policy-digitization/
├── Dockerfile              # Container definition
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── src/
│   ├── main.py            # FastAPI application
│   ├── models/            # Database models (TODO)
│   ├── services/          # Business logic (TODO)
│   └── utils/             # Utilities (TODO)
└── tests/                 # Test suite (TODO)
```

## Sprint 1 Status

### Completed ✅
- FastAPI application structure
- Health check and metrics endpoints
- Policy upload endpoint (foundation)
- Policy processing endpoint (foundation)
- Docker containerization
- Environment configuration
- Logging setup

### Planned for Sprint 2 🚧
- OpenAI integration for document analysis
- LangChain pipelines for information extraction
- PostgreSQL models and database operations
- Redis caching for processed policies
- Document OCR for scanned policies
- Comprehensive test suite
- Advanced error handling
- Rate limiting and authentication

## Dependencies

### Core
- FastAPI - Web framework
- Uvicorn - ASGI server
- Pydantic - Data validation

### Database
- SQLAlchemy - ORM
- psycopg2 - PostgreSQL driver
- Alembic - Database migrations

### AI/ML
- OpenAI - GPT models
- LangChain - LLM orchestration
- PyPDF2 - PDF processing

### Utilities
- Redis - Caching
- Prometheus - Metrics
- Python-JSON-Logger - Structured logging

## Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T12:00:00",
  "service": "ai-policy-digitization",
  "version": "1.0.0-sprint1"
}
```

### Metrics

Prometheus metrics available at `/metrics`:
- `requests_total` - Total requests
- `requests_success` - Successful requests
- `requests_failed` - Failed requests
- `processing_time_avg` - Average processing time

## Troubleshooting

### Service not starting

```bash
# Check logs
docker logs ai-policy-service

# Check environment variables
docker exec ai-policy-service env | grep -E '(POSTGRES|REDIS|OPENAI)'
```

### Database connection issues

```bash
# Test PostgreSQL connection
docker exec ai-policy-service python -c "import psycopg2; print('OK')"
```

### OpenAI API errors

- Verify API key is set correctly
- Check API key has sufficient credits
- Ensure network connectivity to OpenAI

## Contributing

1. Create feature branch
2. Implement changes
3. Write tests
4. Update documentation
5. Submit pull request

## License

Proprietary - HealthFlow Egypt

## Contact

- Team: HealthFlow Egypt Development Team
- Repository: https://github.com/HealthFlowEgy/hcx-platform
