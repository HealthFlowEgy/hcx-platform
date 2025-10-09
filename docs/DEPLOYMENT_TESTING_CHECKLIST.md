# HCX Platform Sprint 1 - Deployment Testing Checklist

## Pre-Deployment Checklist

### Environment Preparation
- [ ] Docker installed (version 20.10+)
- [ ] Docker Compose installed (version 2.0+)
- [ ] Git installed and configured
- [ ] Minimum 8GB RAM available
- [ ] Minimum 20GB disk space free
- [ ] Required ports available (5432, 6379, 8080, 9090, 3000, 9200, 5601)

### Repository Setup
- [ ] Repository cloned successfully
- [ ] Checked out `feature/sprint-01-infrastructure` branch
- [ ] `.env` file created from `.env.sprint1` template
- [ ] Environment variables configured (passwords, API keys)
- [ ] File permissions set correctly (setup script executable)

## Deployment Steps

### Phase 1: Core Services

#### PostgreSQL Database
- [ ] PostgreSQL container starts successfully
- [ ] Health check passes: `docker exec hcx-postgres pg_isready -U hcx_user`
- [ ] Multiple databases created (hcx_gateway, hcx_registry, hcx_claims, hcx_analytics, hcx_ai_services)
- [ ] Extensions installed (uuid-ossp, pg_trgm)
- [ ] Can connect via psql: `docker exec -it hcx-postgres psql -U hcx_user -d hcx_gateway`

#### Redis Cache
- [ ] Redis container starts successfully
- [ ] Health check passes: `docker exec hcx-redis redis-cli ping`
- [ ] Password authentication works
- [ ] Can connect and set/get keys

#### Kafka & Zookeeper
- [ ] Zookeeper container starts successfully
- [ ] Kafka container starts successfully
- [ ] Kafka broker is reachable on ports 9092/9093
- [ ] Can create and list topics

#### HCX Gateway
- [ ] Gateway container builds successfully
- [ ] Gateway starts without errors
- [ ] Health endpoint responds: `curl http://localhost:8080/actuator/health`
- [ ] Swagger UI accessible: http://localhost:8080/swagger-ui.html
- [ ] Can connect to PostgreSQL
- [ ] Can connect to Redis
- [ ] Can connect to Kafka

### Phase 2: Database Schema

#### Provider Network Tables
- [ ] `providers` table created
- [ ] `network_relationships` table created
- [ ] `provider_performance` table created
- [ ] `provider_services` table created
- [ ] All indexes created successfully
- [ ] Triggers created for auto-update timestamps
- [ ] Foreign key constraints working

#### Sample Data
- [ ] Sample data script runs without errors
- [ ] 30 providers loaded: `SELECT COUNT(*) FROM providers;`
- [ ] Network relationships created
- [ ] Provider performance data inserted
- [ ] Provider services data inserted
- [ ] Can query providers by city
- [ ] Can query providers by type
- [ ] Full-text search on provider names works

### Phase 3: Monitoring Stack

#### Prometheus
- [ ] Prometheus container starts successfully
- [ ] Web UI accessible: http://localhost:9090
- [ ] Configuration loaded successfully
- [ ] Targets are being scraped
- [ ] HCX Gateway metrics visible
- [ ] Can query metrics: `up{job="hcx-gateway"}`

#### Grafana
- [ ] Grafana container starts successfully
- [ ] Web UI accessible: http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Prometheus datasource configured
- [ ] Elasticsearch datasource configured
- [ ] Can create test dashboard
- [ ] Can query Prometheus data

### Phase 4: Logging Stack (ELK)

#### Elasticsearch
- [ ] Elasticsearch container starts successfully
- [ ] Cluster health is green: `curl http://localhost:9200/_cluster/health`
- [ ] Can create and query indices
- [ ] Memory settings appropriate

#### Logstash
- [ ] Logstash container starts successfully
- [ ] Pipeline configuration loaded
- [ ] Can receive logs on port 5000
- [ ] Logs forwarded to Elasticsearch
- [ ] Log parsing working correctly

#### Kibana
- [ ] Kibana container starts successfully
- [ ] Web UI accessible: http://localhost:5601
- [ ] Connected to Elasticsearch
- [ ] Can create index pattern: `hcx-logs-*`
- [ ] Can view logs in Discover
- [ ] Can create visualizations

### Phase 5: AI Services

#### AI Policy Service
- [ ] AI service container builds successfully
- [ ] Service starts without errors
- [ ] Health endpoint responds: `curl http://localhost:8081/health`
- [ ] API documentation accessible: http://localhost:8081/docs
- [ ] Can upload policy document
- [ ] Can process policy (mock data)
- [ ] Can retrieve policy by ID
- [ ] Metrics endpoint working

### Phase 6: Development Tools (Optional)

#### PgAdmin
- [ ] PgAdmin container starts successfully
- [ ] Web UI accessible: http://localhost:5050
- [ ] Can login with credentials
- [ ] Can connect to PostgreSQL
- [ ] Can browse databases and tables

#### Redis Commander
- [ ] Redis Commander container starts successfully
- [ ] Web UI accessible: http://localhost:8082
- [ ] Can connect to Redis
- [ ] Can view keys and values

#### Kafka UI
- [ ] Kafka UI container starts successfully
- [ ] Web UI accessible: http://localhost:8083
- [ ] Can view brokers
- [ ] Can view topics
- [ ] Can view consumer groups

## Integration Testing

### Service Communication
- [ ] Gateway can connect to PostgreSQL
- [ ] Gateway can connect to Redis
- [ ] Gateway can connect to Kafka
- [ ] AI service can connect to PostgreSQL
- [ ] AI service can connect to Redis
- [ ] Prometheus can scrape Gateway metrics
- [ ] Logstash can receive Gateway logs
- [ ] Grafana can query Prometheus
- [ ] Kibana can query Elasticsearch

### API Testing
- [ ] Gateway health endpoint: `GET /actuator/health`
- [ ] Gateway metrics endpoint: `GET /actuator/prometheus`
- [ ] AI service health endpoint: `GET /health`
- [ ] AI service metrics endpoint: `GET /metrics`
- [ ] AI service upload endpoint: `POST /api/v1/policy/upload`
- [ ] AI service process endpoint: `POST /api/v1/policy/process`

### Database Operations
- [ ] Can insert new provider
- [ ] Can update provider information
- [ ] Can delete provider (cascade works)
- [ ] Can query providers with filters
- [ ] Can create network relationship
- [ ] Can track provider performance
- [ ] Can add provider services

### Performance Testing
- [ ] Gateway responds within 200ms for health check
- [ ] Database queries execute within acceptable time
- [ ] Redis cache hit/miss ratio is reasonable
- [ ] Kafka message throughput is adequate
- [ ] No memory leaks observed
- [ ] CPU usage is reasonable

## Validation Commands

### Quick Health Check
```bash
make health
```

### Validate Deployment
```bash
make sprint1-validate
```

### Check Service Status
```bash
make status
```

### View Logs
```bash
# All services
make logs

# Specific service
make logs-gateway
make logs-postgres
make logs-ai
```

### Database Verification
```bash
# Open PostgreSQL shell
make db-shell

# Run queries
SELECT COUNT(*) FROM providers;
SELECT COUNT(*) FROM network_relationships;
SELECT COUNT(*) FROM provider_performance;
SELECT COUNT(*) FROM provider_services;

# Check indexes
\di

# Check triggers
SELECT tgname FROM pg_trigger WHERE tgrelid = 'providers'::regclass;
```

## Troubleshooting

### Services Not Starting
- [ ] Check Docker daemon is running
- [ ] Check port conflicts: `netstat -tuln | grep -E '(5432|6379|8080)'`
- [ ] Check Docker logs: `docker logs <container-name>`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`

### Database Connection Issues
- [ ] Verify PostgreSQL is running
- [ ] Check connection string in .env
- [ ] Verify password is correct
- [ ] Check network connectivity between containers
- [ ] Review PostgreSQL logs

### Gateway Not Responding
- [ ] Check if container is running
- [ ] Review gateway logs
- [ ] Verify database connection
- [ ] Check Redis connection
- [ ] Ensure Kafka is available
- [ ] Verify port 8080 is not blocked

### Monitoring Not Working
- [ ] Verify Prometheus is scraping targets
- [ ] Check Prometheus configuration
- [ ] Verify Grafana datasource connection
- [ ] Check Elasticsearch cluster health
- [ ] Verify Logstash pipeline is active

## Rollback Procedure

If deployment fails:

1. **Stop all services**
   ```bash
   make stop
   ```

2. **Restore database backup** (if needed)
   ```bash
   make db-restore BACKUP_FILE=backups/hcx-backup-YYYYMMDD_HHMMSS.sql
   ```

3. **Checkout previous version**
   ```bash
   git checkout sprint-0-baseline
   ```

4. **Restart original services**
   ```bash
   docker-compose up -d
   ```

## Sign-Off

### Deployment Team
- [ ] All services deployed successfully
- [ ] All health checks passing
- [ ] Database schema verified
- [ ] Sample data loaded
- [ ] Monitoring operational
- [ ] Logging operational
- [ ] Documentation reviewed

### Development Team
- [ ] Can access all services
- [ ] Can run tests successfully
- [ ] Can view logs and metrics
- [ ] Can connect to databases
- [ ] Development tools working

### DevOps Team
- [ ] Infrastructure stable
- [ ] No resource constraints
- [ ] Backups configured
- [ ] Monitoring alerts set up
- [ ] Documentation complete

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Reviewed By**: _______________  
**Status**: [ ] Success [ ] Failed [ ] Partial  
**Notes**: _______________
