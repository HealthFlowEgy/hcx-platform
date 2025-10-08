# HCX Platform Sprint 1 - Troubleshooting Guide

## Common Issues and Solutions

This guide provides solutions to common problems encountered during Sprint 1 deployment and operation.

---

## Docker and Container Issues

### Issue: Docker Daemon Not Running

**Symptoms:**
- Error: "Cannot connect to the Docker daemon"
- Commands fail with connection errors

**Solution:**
```bash
# Check Docker status
sudo systemctl status docker

# Start Docker
sudo systemctl start docker

# Enable Docker on boot
sudo systemctl enable docker
```

### Issue: Port Already in Use

**Symptoms:**
- Error: "bind: address already in use"
- Container fails to start

**Solution:**
```bash
# Find process using the port
sudo lsof -i :8080
sudo netstat -tuln | grep 8080

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.sprint1.yml
```

### Issue: Out of Disk Space

**Symptoms:**
- Error: "no space left on device"
- Containers fail to start or stop unexpectedly

**Solution:**
```bash
# Check disk usage
df -h

# Clean up Docker resources
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune
```

### Issue: Out of Memory

**Symptoms:**
- Containers being killed (OOMKilled)
- System becomes unresponsive

**Solution:**
```bash
# Check memory usage
free -h
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → 8GB+

# Reduce service memory limits in docker-compose.sprint1.yml
```

---

## Database Issues

### Issue: PostgreSQL Connection Refused

**Symptoms:**
- Error: "Connection refused" or "could not connect to server"
- Gateway cannot connect to database

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs hcx-postgres

# Verify PostgreSQL is ready
docker exec hcx-postgres pg_isready -U hcx_user

# Test connection
docker exec -it hcx-postgres psql -U hcx_user -d hcx_gateway

# Check network connectivity
docker exec hcx-gateway ping postgres
```

### Issue: Authentication Failed

**Symptoms:**
- Error: "password authentication failed"
- Cannot connect to PostgreSQL

**Solution:**
```bash
# Verify password in .env file
cat .env | grep POSTGRES_PASSWORD

# Reset PostgreSQL password
docker exec -it hcx-postgres psql -U postgres
ALTER USER hcx_user WITH PASSWORD 'new_password';

# Update .env file with new password
# Restart services
make restart
```

### Issue: Database Does Not Exist

**Symptoms:**
- Error: "database does not exist"
- Connection attempts fail

**Solution:**
```bash
# Check existing databases
docker exec hcx-postgres psql -U hcx_user -l

# Create database manually
docker exec hcx-postgres psql -U hcx_user -c "CREATE DATABASE hcx_gateway;"

# Or re-run initialization script
docker exec -i hcx-postgres bash < docker/postgres/init/01-create-databases.sh
```

### Issue: Tables Not Created

**Symptoms:**
- Error: "relation does not exist"
- Queries fail with missing table errors

**Solution:**
```bash
# Check if tables exist
docker exec hcx-postgres psql -U hcx_user -d hcx_gateway -c "\dt"

# Run schema creation script
docker exec -i hcx-postgres psql -U hcx_user -d hcx_gateway < docker/postgres/init/02-provider-network-schema.sql

# Load sample data
docker exec -i hcx-postgres psql -U hcx_user -d hcx_gateway < docker/postgres/seed/01-sample-providers.sql
```

---

## Redis Issues

### Issue: Redis Connection Refused

**Symptoms:**
- Error: "Connection refused" when connecting to Redis
- Cache operations fail

**Solution:**
```bash
# Check if Redis is running
docker ps | grep redis

# Check Redis logs
docker logs hcx-redis

# Test Redis connection
docker exec hcx-redis redis-cli ping

# Test with password
docker exec hcx-redis redis-cli -a <password> ping

# Check network connectivity
docker exec hcx-gateway ping redis
```

### Issue: Redis Authentication Error

**Symptoms:**
- Error: "NOAUTH Authentication required"

**Solution:**
```bash
# Verify Redis password in .env
cat .env | grep REDIS_PASSWORD

# Connect with password
docker exec hcx-redis redis-cli -a <password>

# Update password in Redis config
# Edit docker-compose.sprint1.yml
# Restart Redis
docker-compose -f docker-compose.sprint1.yml restart redis
```

---

## Gateway Issues

### Issue: Gateway Not Starting

**Symptoms:**
- Gateway container exits immediately
- Health check fails

**Solution:**
```bash
# Check gateway logs
docker logs hcx-gateway --tail 100

# Common causes:
# 1. Database not ready - wait longer
# 2. Configuration error - check .env
# 3. Port conflict - check port 8080

# Restart gateway
make restart-gateway

# Check dependencies are running
docker ps | grep -E '(postgres|redis|kafka)'
```

### Issue: Gateway Health Check Failing

**Symptoms:**
- curl http://localhost:8080/actuator/health returns error
- Gateway appears running but not responding

**Solution:**
```bash
# Check if gateway is actually running
docker ps | grep hcx-gateway

# Check gateway logs for errors
docker logs hcx-gateway --tail 50

# Check if port is accessible
curl -v http://localhost:8080/actuator/health

# Enter gateway container
docker exec -it hcx-gateway bash
curl localhost:8080/actuator/health

# Restart gateway
make restart-gateway
```

### Issue: Gateway Cannot Connect to Database

**Symptoms:**
- Error: "Unable to acquire JDBC Connection"
- Database connection pool errors

**Solution:**
```bash
# Verify database is running
docker exec hcx-postgres pg_isready -U hcx_user

# Check connection from gateway
docker exec hcx-gateway ping postgres

# Verify connection string
docker exec hcx-gateway env | grep POSTGRES

# Check database logs
docker logs hcx-postgres --tail 50

# Restart both services
docker-compose -f docker-compose.sprint1.yml restart postgres hcx-gateway
```

---

## Kafka Issues

### Issue: Kafka Not Starting

**Symptoms:**
- Kafka container exits or restarts repeatedly
- Connection to Kafka fails

**Solution:**
```bash
# Check Zookeeper is running first
docker ps | grep zookeeper
docker logs hcx-zookeeper

# Check Kafka logs
docker logs hcx-kafka --tail 100

# Verify Kafka can connect to Zookeeper
docker exec hcx-kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Restart in order
docker-compose -f docker-compose.sprint1.yml restart zookeeper
sleep 10
docker-compose -f docker-compose.sprint1.yml restart kafka
```

---

## Monitoring Issues

### Issue: Prometheus Not Scraping Targets

**Symptoms:**
- Targets show as "DOWN" in Prometheus UI
- No metrics available

**Solution:**
```bash
# Check Prometheus logs
docker logs hcx-prometheus

# Verify Prometheus configuration
docker exec hcx-prometheus cat /etc/prometheus/prometheus.yml

# Check if targets are reachable
docker exec hcx-prometheus wget -O- http://hcx-gateway:8080/actuator/prometheus

# Restart Prometheus
docker-compose -f docker-compose.sprint1.yml restart prometheus
```

### Issue: Grafana Cannot Connect to Prometheus

**Symptoms:**
- Datasource test fails
- Dashboards show no data

**Solution:**
```bash
# Check Grafana logs
docker logs hcx-grafana

# Verify Prometheus is running
curl http://localhost:9090/-/healthy

# Check datasource configuration
# Login to Grafana → Configuration → Data Sources

# Test connection manually
docker exec hcx-grafana wget -O- http://prometheus:9090/api/v1/query?query=up

# Re-provision datasources
docker-compose -f docker-compose.sprint1.yml restart grafana
```

---

## Logging Stack Issues

### Issue: Elasticsearch Cluster Unhealthy

**Symptoms:**
- Cluster status is yellow or red
- Kibana cannot connect

**Solution:**
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# Check Elasticsearch logs
docker logs hcx-elasticsearch

# Common causes:
# 1. Insufficient memory - increase heap size
# 2. Disk space low - clean up
# 3. Unassigned shards - reallocate

# Restart Elasticsearch
docker-compose -f docker-compose.sprint1.yml restart elasticsearch
```

### Issue: Logstash Not Processing Logs

**Symptoms:**
- No logs appearing in Elasticsearch
- Logstash pipeline not active

**Solution:**
```bash
# Check Logstash logs
docker logs hcx-logstash

# Verify pipeline configuration
docker exec hcx-logstash cat /usr/share/logstash/pipeline/logstash.conf

# Test pipeline
docker exec hcx-logstash logstash -t -f /usr/share/logstash/pipeline/logstash.conf

# Check Logstash can reach Elasticsearch
docker exec hcx-logstash curl http://elasticsearch:9200

# Restart Logstash
docker-compose -f docker-compose.sprint1.yml restart logstash
```

### Issue: Kibana Not Loading

**Symptoms:**
- Kibana UI shows loading screen indefinitely
- Cannot access Kibana

**Solution:**
```bash
# Check Kibana logs
docker logs hcx-kibana

# Verify Elasticsearch is healthy
curl http://localhost:9200/_cluster/health

# Check Kibana can reach Elasticsearch
docker exec hcx-kibana curl http://elasticsearch:9200

# Clear browser cache and cookies
# Restart Kibana
docker-compose -f docker-compose.sprint1.yml restart kibana
```

---

## AI Service Issues

### Issue: AI Service Not Starting

**Symptoms:**
- AI service container exits
- Health check fails

**Solution:**
```bash
# Check AI service logs
docker logs ai-policy-service

# Common causes:
# 1. Missing OPENAI_API_KEY
# 2. Python dependencies not installed
# 3. Port 8081 conflict

# Verify environment variables
docker exec ai-policy-service env | grep OPENAI

# Rebuild image
docker-compose -f docker-compose.sprint1.yml build ai-policy-service
docker-compose -f docker-compose.sprint1.yml up -d ai-policy-service
```

### Issue: AI Service Cannot Connect to Database

**Symptoms:**
- Error: "could not connect to server"
- Database operations fail

**Solution:**
```bash
# Check if PostgreSQL is running
docker exec hcx-postgres pg_isready -U hcx_user

# Test connection from AI service
docker exec ai-policy-service python -c "import psycopg2; print('OK')"

# Verify connection string
docker exec ai-policy-service env | grep POSTGRES

# Restart AI service
make restart-ai
```

---

## Network Issues

### Issue: Containers Cannot Communicate

**Symptoms:**
- Services cannot reach each other
- Connection refused errors between services

**Solution:**
```bash
# Check Docker network
docker network ls
docker network inspect hcx-network

# Verify containers are on the same network
docker inspect hcx-gateway | grep NetworkMode
docker inspect hcx-postgres | grep NetworkMode

# Test connectivity
docker exec hcx-gateway ping postgres
docker exec hcx-gateway ping redis

# Recreate network
docker-compose -f docker-compose.sprint1.yml down
docker network rm hcx-network
docker-compose -f docker-compose.sprint1.yml up -d
```

---

## Performance Issues

### Issue: Slow Response Times

**Symptoms:**
- API requests take several seconds
- Database queries are slow

**Solution:**
```bash
# Check resource usage
docker stats

# Check database performance
docker exec hcx-postgres psql -U hcx_user -d hcx_gateway -c "SELECT * FROM pg_stat_activity;"

# Check for slow queries
docker exec hcx-postgres psql -U hcx_user -d hcx_gateway -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Optimize database
docker exec hcx-postgres psql -U hcx_user -d hcx_gateway -c "VACUUM ANALYZE;"

# Check Redis performance
docker exec hcx-redis redis-cli --latency

# Increase resources in docker-compose.sprint1.yml
```

---

## General Debugging Commands

### View All Container Status
```bash
docker ps -a
make status
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.sprint1.yml logs -f

# Specific service
docker logs <container-name> -f --tail 100

# Using Makefile
make logs
make logs-gateway
make logs-postgres
```

### Check Resource Usage
```bash
docker stats
df -h
free -h
```

### Restart Services
```bash
# All services
make restart

# Specific service
make restart-gateway
make restart-ai

# Using docker-compose
docker-compose -f docker-compose.sprint1.yml restart <service-name>
```

### Complete Reset
```bash
# Stop all services
make stop

# Remove all containers and volumes (WARNING: destroys data)
docker-compose -f docker-compose.sprint1.yml down -v

# Clean up Docker system
docker system prune -a --volumes

# Start fresh
make sprint1-setup
```

---

## Getting Help

If you cannot resolve an issue using this guide:

1. **Check logs thoroughly** - Most issues have clues in the logs
2. **Review documentation** - Refer to SPRINT1_IMPLEMENTATION.md
3. **Search GitHub issues** - Someone may have encountered the same problem
4. **Create a GitHub issue** - Include logs, environment details, and steps to reproduce
5. **Contact the team** - HealthFlow Egypt Development Team

---

**Last Updated**: October 8, 2025  
**Version**: Sprint 1.0
