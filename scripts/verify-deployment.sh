#!/bin/bash
set -e

# Deployment Verification Script
# Usage: ./verify-deployment.sh <environment>

ENVIRONMENT=${1:-"development"}
TIMEOUT=300  # 5 minutes
CHECK_INTERVAL=10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================"
echo "HCX Platform Deployment Verification"
echo "======================================${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Set base URL based on environment
case $ENVIRONMENT in
    development|dev)
        BASE_URL="https://dev.hcx.healthflowegy.com"
        NAMESPACE="hcx-dev"
        ;;
    staging)
        BASE_URL="https://staging.hcx.healthflowegy.com"
        NAMESPACE="hcx-staging"
        ;;
    production|prod)
        BASE_URL="https://hcx.healthflowegy.com"
        NAMESPACE="hcx-prod"
        ;;
    *)
        echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
        echo "Valid options: development, staging, production"
        exit 1
        ;;
esac

echo "Base URL: $BASE_URL"
echo "Namespace: $NAMESPACE"
echo ""

# Function to check service health
check_service_health() {
    local service_name=$1
    local health_url=$2
    local max_attempts=$((TIMEOUT / CHECK_INTERVAL))
    local attempt=0
    
    echo -n "Checking $service_name health ... "
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "$health_url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Healthy${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep $CHECK_INTERVAL
    done
    
    echo -e "${RED}✗ Unhealthy (timeout)${NC}"
    return 1
}

# Function to check Kubernetes deployment status
check_k8s_deployment() {
    local deployment_name=$1
    
    echo -n "Checking Kubernetes deployment: $deployment_name ... "
    
    if command -v kubectl &> /dev/null; then
        if kubectl rollout status deployment/$deployment_name -n $NAMESPACE --timeout=5m > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Ready${NC}"
            return 0
        else
            echo -e "${RED}✗ Not Ready${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ kubectl not available, skipping${NC}"
        return 0
    fi
}

# Function to check pod status
check_pod_status() {
    local label=$1
    
    echo -n "Checking pods with label $label ... "
    
    if command -v kubectl &> /dev/null; then
        READY_PODS=$(kubectl get pods -n $NAMESPACE -l $label -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null | grep -o "True" | wc -l)
        TOTAL_PODS=$(kubectl get pods -n $NAMESPACE -l $label --no-headers 2>/dev/null | wc -l)
        
        if [ $READY_PODS -eq $TOTAL_PODS ] && [ $TOTAL_PODS -gt 0 ]; then
            echo -e "${GREEN}✓ $READY_PODS/$TOTAL_PODS ready${NC}"
            return 0
        else
            echo -e "${RED}✗ $READY_PODS/$TOTAL_PODS ready${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ kubectl not available, skipping${NC}"
        return 0
    fi
}

FAILED_CHECKS=0

echo -e "${BLUE}=== Kubernetes Deployment Status ===${NC}"
check_k8s_deployment "hcx-gateway" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_k8s_deployment "hcx-apis" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_k8s_deployment "hcx-onboard" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
echo ""

echo -e "${BLUE}=== Pod Status ===${NC}"
check_pod_status "app=hcx-gateway" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_pod_status "app=hcx-apis" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_pod_status "app=hcx-onboard" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
echo ""

echo -e "${BLUE}=== Service Health Checks ===${NC}"
check_service_health "API Gateway" "$BASE_URL/health" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_service_health "HCX APIs" "$BASE_URL/api/v1/hcx/health" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_service_health "Database" "$BASE_URL/api/v1/hcx/health/db" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_service_health "Redis" "$BASE_URL/api/v1/hcx/health/redis" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
echo ""

echo -e "${BLUE}=== Running Smoke Tests ===${NC}"
if [ -f "./scripts/smoke-tests.sh" ]; then
    ./scripts/smoke-tests.sh "$BASE_URL" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠ Smoke tests script not found${NC}"
fi
echo ""

echo "======================================"
echo "Verification Summary"
echo "======================================"
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Deployment to $ENVIRONMENT is verified and healthy."
    exit 0
else
    echo -e "${RED}✗ $FAILED_CHECKS check(s) failed!${NC}"
    echo "Deployment to $ENVIRONMENT has issues."
    exit 1
fi

