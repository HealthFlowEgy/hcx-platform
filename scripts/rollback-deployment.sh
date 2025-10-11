#!/bin/bash
set -e

# Rollback Deployment Script
# Usage: ./rollback-deployment.sh <environment> [version]

ENVIRONMENT=${1:-"development"}
ROLLBACK_VERSION=${2:-""}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================"
echo "HCX Platform Deployment Rollback"
echo "======================================${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Set namespace based on environment
case $ENVIRONMENT in
    development|dev)
        NAMESPACE="hcx-dev"
        ;;
    staging)
        NAMESPACE="hcx-staging"
        ;;
    production|prod)
        NAMESPACE="hcx-prod"
        ;;
    *)
        echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
        echo "Valid options: development, staging, production"
        exit 1
        ;;
esac

echo "Namespace: $NAMESPACE"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Function to rollback a deployment
rollback_deployment() {
    local deployment_name=$1
    
    echo -e "${YELLOW}Rolling back deployment: $deployment_name${NC}"
    
    if [ -n "$ROLLBACK_VERSION" ]; then
        # Rollback to specific version
        echo "Rolling back to version: $ROLLBACK_VERSION"
        kubectl set image deployment/$deployment_name \
            -n $NAMESPACE \
            $deployment_name=ghcr.io/healthflowegy/hcx-platform/$deployment_name:$ROLLBACK_VERSION
    else
        # Rollback to previous revision
        echo "Rolling back to previous revision"
        kubectl rollout undo deployment/$deployment_name -n $NAMESPACE
    fi
    
    # Wait for rollout to complete
    echo "Waiting for rollout to complete..."
    if kubectl rollout status deployment/$deployment_name -n $NAMESPACE --timeout=5m; then
        echo -e "${GREEN}✓ Rollback successful for $deployment_name${NC}"
        return 0
    else
        echo -e "${RED}✗ Rollback failed for $deployment_name${NC}"
        return 1
    fi
}

# Function to check rollback history
show_rollback_history() {
    local deployment_name=$1
    
    echo -e "${BLUE}Rollback history for $deployment_name:${NC}"
    kubectl rollout history deployment/$deployment_name -n $NAMESPACE
    echo ""
}

# Confirm rollback
echo -e "${YELLOW}⚠️  WARNING: This will rollback the deployment in $ENVIRONMENT${NC}"
echo ""
echo "Deployments to rollback:"
echo "  - hcx-gateway"
echo "  - hcx-apis"
echo "  - hcx-onboard"
echo ""

if [ -z "$ROLLBACK_VERSION" ]; then
    echo "Rollback target: Previous revision"
else
    echo "Rollback target: Version $ROLLBACK_VERSION"
fi
echo ""

read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}=== Starting Rollback ===${NC}"
echo ""

FAILED_ROLLBACKS=0

# Show current deployment history
echo -e "${BLUE}=== Deployment History ===${NC}"
show_rollback_history "hcx-gateway"
show_rollback_history "hcx-apis"
show_rollback_history "hcx-onboard"

# Perform rollbacks
rollback_deployment "hcx-gateway" || FAILED_ROLLBACKS=$((FAILED_ROLLBACKS + 1))
rollback_deployment "hcx-apis" || FAILED_ROLLBACKS=$((FAILED_ROLLBACKS + 1))
rollback_deployment "hcx-onboard" || FAILED_ROLLBACKS=$((FAILED_ROLLBACKS + 1))

echo ""
echo -e "${BLUE}=== Verifying Rollback ===${NC}"

# Run verification script if available
if [ -f "./scripts/verify-deployment.sh" ]; then
    ./scripts/verify-deployment.sh "$ENVIRONMENT"
else
    echo -e "${YELLOW}⚠ Verification script not found${NC}"
fi

echo ""
echo "======================================"
echo "Rollback Summary"
echo "======================================"

if [ $FAILED_ROLLBACKS -eq 0 ]; then
    echo -e "${GREEN}✓ Rollback completed successfully!${NC}"
    echo "All services have been rolled back in $ENVIRONMENT."
    exit 0
else
    echo -e "${RED}✗ $FAILED_ROLLBACKS rollback(s) failed!${NC}"
    echo "Some services failed to rollback. Please check manually."
    exit 1
fi

