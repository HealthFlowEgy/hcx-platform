# HCX Platform - Development Makefile
# Sprint 1 - Common Commands for Zero-Disruption Workflow

.PHONY: help setup start stop restart logs clean backup restore test lint build deploy

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

##@ General

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\n$(BLUE)Usage:$(NC)\n  make $(GREEN)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

check-requirements: ## Check if required tools are installed
	@echo "$(BLUE)Checking requirements...$(NC)"
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)Docker is not installed$(NC)"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)Docker Compose is not installed$(NC)"; exit 1; }
	@command -v git >/dev/null 2>&1 || { echo "$(RED)Git is not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All requirements satisfied$(NC)"

##@ Setup & Installation

setup: check-requirements ## Run full environment setup
	@echo "$(BLUE)Setting up HCX Platform Sprint 1...$(NC)"
	@cp .env.sprint1 .env || true
	@docker-compose -f docker-compose.sprint1.yml up -d postgres redis
	@echo "$(YELLOW)Waiting for database to be ready...$(NC)"
	@sleep 10
	@echo "$(GREEN)✓ Setup completed$(NC)"

setup-full: setup ## Setup with all services including monitoring
	@echo "$(BLUE)Starting all services...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml up -d
	@echo "$(GREEN)✓ Full setup completed$(NC)"

init-db: ## Initialize database with schema and sample data
	@echo "$(BLUE)Initializing database...$(NC)"
	@sleep 5
	@docker exec -i hcx-postgres psql -U hcx_user -d hcx_gateway < docker/postgres/seed/01-sample-providers.sql || true
	@echo "$(GREEN)✓ Database initialized$(NC)"

##@ Service Management

start: ## Start all services
	@echo "$(BLUE)Starting all services...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "$(YELLOW)Waiting for services to be healthy...$(NC)"
	@sleep 10
	@make status

start-core: ## Start only core services (DB, Cache, Gateway)
	@echo "$(BLUE)Starting core services...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml up -d postgres redis kafka zookeeper hcx-gateway
	@echo "$(GREEN)✓ Core services started$(NC)"

start-monitoring: ## Start monitoring stack
	@echo "$(BLUE)Starting monitoring services...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml up -d prometheus grafana elasticsearch logstash kibana
	@echo "$(GREEN)✓ Monitoring services started$(NC)"

start-dev: ## Start with development tools
	@echo "$(BLUE)Starting services with dev tools...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml --profile dev-tools up -d
	@echo "$(GREEN)✓ Services started with dev tools$(NC)"

stop: ## Stop all services
	@echo "$(BLUE)Stopping all services...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml down
	@echo "$(GREEN)✓ Services stopped$(NC)"

stop-keep-data: ## Stop services but keep volumes
	@echo "$(BLUE)Stopping services (keeping data)...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml stop
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

restart-gateway: ## Restart HCX Gateway only
	@echo "$(BLUE)Restarting HCX Gateway...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml restart hcx-gateway
	@echo "$(GREEN)✓ Gateway restarted$(NC)"

restart-ai: ## Restart AI service
	@echo "$(BLUE)Restarting AI service...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml restart ai-policy-service
	@echo "$(GREEN)✓ AI service restarted$(NC)"

status: ## Check status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	@docker-compose -f docker-compose.sprint1.yml ps

health: ## Check health of all services
	@echo "$(BLUE)Health Checks:$(NC)"
	@echo -n "PostgreSQL: "
	@docker exec hcx-postgres pg_isready -U hcx_user > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "Redis: "
	@docker exec hcx-redis redis-cli ping > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "Kafka: "
	@docker exec hcx-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "HCX Gateway: "
	@curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "Prometheus: "
	@curl -sf http://localhost:9090/-/healthy > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "Grafana: "
	@curl -sf http://localhost:3000/api/health > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "Elasticsearch: "
	@curl -sf http://localhost:9200/_cluster/health > /dev/null 2>&1 && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"

##@ Logs & Monitoring

logs: ## Tail all service logs
	@docker-compose -f docker-compose.sprint1.yml logs -f

logs-gateway: ## Tail HCX Gateway logs
	@docker-compose -f docker-compose.sprint1.yml logs -f hcx-gateway

logs-postgres: ## Tail PostgreSQL logs
	@docker-compose -f docker-compose.sprint1.yml logs -f postgres

logs-redis: ## Tail Redis logs
	@docker-compose -f docker-compose.sprint1.yml logs -f redis

logs-kafka: ## Tail Kafka logs
	@docker-compose -f docker-compose.sprint1.yml logs -f kafka

logs-ai: ## Tail AI service logs
	@docker-compose -f docker-compose.sprint1.yml logs -f ai-policy-service

logs-errors: ## Show only error logs from all services
	@docker-compose -f docker-compose.sprint1.yml logs | grep -i error

##@ Database Operations

db-shell: ## Open PostgreSQL shell
	@docker exec -it hcx-postgres psql -U hcx_user -d hcx_gateway

db-backup: ## Backup all databases
	@echo "$(BLUE)Backing up databases...$(NC)"
	@mkdir -p backups
	@docker exec hcx-postgres pg_dumpall -U hcx_user > backups/hcx-backup-$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Database backup completed$(NC)"

db-restore: ## Restore database from backup (specify BACKUP_FILE=path)
	@echo "$(BLUE)Restoring database from $(BACKUP_FILE)...$(NC)"
	@docker exec -i hcx-postgres psql -U hcx_user < $(BACKUP_FILE)
	@echo "$(GREEN)✓ Database restored$(NC)"

db-reset: ## Reset database (WARNING: Destroys all data)
	@echo "$(RED)WARNING: This will destroy all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f docker-compose.sprint1.yml down -v; \
		docker-compose -f docker-compose.sprint1.yml up -d postgres; \
		sleep 10; \
		make init-db; \
	fi

##@ Development

build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml build
	@echo "$(GREEN)✓ Build completed$(NC)"

build-gateway: ## Build Gateway image only
	@echo "$(BLUE)Building Gateway image...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml build hcx-gateway
	@echo "$(GREEN)✓ Gateway build completed$(NC)"

test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	@cd api-gateway && mvn test
	@echo "$(GREEN)✓ Tests completed$(NC)"

test-integration: ## Run integration tests
	@echo "$(BLUE)Running integration tests...$(NC)"
	@cd api-gateway && mvn verify -DskipUnitTests=true
	@echo "$(GREEN)✓ Integration tests completed$(NC)"

lint: ## Run code linting
	@echo "$(BLUE)Running linters...$(NC)"
	@cd api-gateway && mvn checkstyle:check
	@echo "$(GREEN)✓ Linting completed$(NC)"

##@ Cleanup

clean: ## Clean up containers and images
	@echo "$(BLUE)Cleaning up...$(NC)"
	@docker-compose -f docker-compose.sprint1.yml down
	@docker system prune -f
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

clean-all: ## Clean up everything including volumes
	@echo "$(RED)WARNING: This will remove all data!$(NC)"
	@docker-compose -f docker-compose.sprint1.yml down -v
	@docker system prune -af --volumes
	@echo "$(GREEN)✓ Complete cleanup done$(NC)"

##@ Sprint 1 Specific

sprint1-setup: ## Complete Sprint 1 setup
	@echo "$(BLUE)Running Sprint 1 Complete Setup...$(NC)"
	@make setup-full
	@sleep 15
	@make init-db
	@make health
	@echo "$(GREEN)✓ Sprint 1 setup completed$(NC)"
	@echo "$(YELLOW)Access URLs:$(NC)"
	@echo "  Gateway:       http://localhost:8080"
	@echo "  Grafana:       http://localhost:3000 (admin/admin123)"
	@echo "  Prometheus:    http://localhost:9090"
	@echo "  Kibana:        http://localhost:5601"
	@echo "  PgAdmin:       http://localhost:5050 (admin@hcx.local/admin123)"

sprint1-validate: ## Validate Sprint 1 deployment
	@echo "$(BLUE)Validating Sprint 1 deployment...$(NC)"
	@make health
	@echo "$(BLUE)Checking database schema...$(NC)"
	@docker exec hcx-postgres psql -U hcx_user -d hcx_gateway -c "\\dt" | grep providers && echo "$(GREEN)✓ Provider tables exist$(NC)" || echo "$(RED)✗ Provider tables missing$(NC)"
	@echo "$(BLUE)Checking sample data...$(NC)"
	@docker exec hcx-postgres psql -U hcx_user -d hcx_gateway -c "SELECT COUNT(*) FROM providers;" | grep -E "[0-9]+" && echo "$(GREEN)✓ Sample data loaded$(NC)" || echo "$(RED)✗ No sample data$(NC)"
	@echo "$(GREEN)✓ Validation completed$(NC)"

sprint1-teardown: ## Tear down Sprint 1 environment
	@echo "$(BLUE)Tearing down Sprint 1 environment...$(NC)"
	@make stop
	@echo "$(GREEN)✓ Sprint 1 teardown completed$(NC)"
