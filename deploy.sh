#!/bin/bash

# HCX Platform Deployment Script
# This script automates the deployment of HCX Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please review and update the .env file with your specific configuration"
    else
        print_status ".env file already exists"
    fi
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/kafka
    mkdir -p data/redis
    
    print_success "Environment setup completed"
}

# Function to build the application
build_application() {
    print_status "Building HCX Platform..."
    
    if command_exists mvn; then
        print_status "Building with Maven..."
        mvn clean install -DskipTests
        print_success "Maven build completed"
    else
        print_warning "Maven not found, skipping build step"
        print_status "Make sure to build the application before running Docker containers"
    fi
}

# Function to start services
start_services() {
    print_status "Starting HCX Platform services..."
    
    # Pull latest images
    docker-compose pull
    
    # Build and start services
    docker-compose up -d --build
    
    print_success "Services started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8080/health >/dev/null 2>&1; then
            print_success "HCX APIs service is ready"
            break
        fi
        
        print_status "Attempt $attempt/$max_attempts: Waiting for HCX APIs service..."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "HCX APIs service failed to start within expected time"
        print_status "Check logs with: docker-compose logs hcx-apis"
        exit 1
    fi
    
    # Check API Gateway
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8090/health >/dev/null 2>&1; then
            print_success "API Gateway service is ready"
            break
        fi
        
        print_status "Attempt $attempt/$max_attempts: Waiting for API Gateway service..."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "API Gateway service failed to start within expected time"
        print_status "Check logs with: docker-compose logs api-gateway"
        exit 1
    fi
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    local services=("hcx-apis:8080" "api-gateway:8090")
    
    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        if curl -f "http://localhost:$port/health" >/dev/null 2>&1; then
            print_success "$name health check passed"
        else
            print_error "$name health check failed"
        fi
    done
}

# Function to display service information
display_service_info() {
    print_success "HCX Platform deployment completed!"
    echo
    echo "Service URLs:"
    echo "  HCX APIs:        http://localhost:8080"
    echo "  API Gateway:     http://localhost:8090"
    echo "  Demo App:        http://localhost:3000"
    echo "  Onboarding App:  http://localhost:3001"
    echo
    echo "Health Check URLs:"
    echo "  HCX APIs Health: http://localhost:8080/health"
    echo "  Gateway Health:  http://localhost:8090/health"
    echo
    echo "Database Access:"
    echo "  PostgreSQL:      localhost:5432 (database: hcx, user: hcx_user)"
    echo "  Redis:           localhost:6379"
    echo "  Kafka:           localhost:9092"
    echo
    echo "Useful Commands:"
    echo "  View logs:       docker-compose logs -f [service-name]"
    echo "  Stop services:   docker-compose down"
    echo "  Restart:         docker-compose restart [service-name]"
    echo "  Scale service:   docker-compose up -d --scale hcx-apis=2"
    echo
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  start     Start the HCX Platform (default)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show service status"
    echo "  logs      Show service logs"
    echo "  clean     Stop and remove all containers and volumes"
    echo "  build     Build the application only"
    echo "  help      Show this help message"
    echo
}

# Main deployment function
deploy() {
    print_status "Starting HCX Platform deployment..."
    
    check_prerequisites
    setup_environment
    build_application
    start_services
    wait_for_services
    run_health_checks
    display_service_info
}

# Handle command line arguments
case "${1:-start}" in
    start)
        deploy
        ;;
    stop)
        print_status "Stopping HCX Platform services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    restart)
        print_status "Restarting HCX Platform services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    status)
        print_status "Service status:"
        docker-compose ps
        ;;
    logs)
        docker-compose logs -f
        ;;
    clean)
        print_warning "This will remove all containers, networks, and volumes!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Cleaning up..."
            docker-compose down -v --remove-orphans
            docker system prune -f
            print_success "Cleanup completed"
        else
            print_status "Cleanup cancelled"
        fi
        ;;
    build)
        build_application
        ;;
    help)
        show_usage
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac

