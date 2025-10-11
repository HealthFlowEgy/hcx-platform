#!/bin/bash
set -e

# Smoke Tests for HCX Platform
# Usage: ./smoke-tests.sh <base_url>

BASE_URL=${1:-"http://localhost:8080"}
TIMEOUT=10
FAILED_TESTS=0
TOTAL_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "HCX Platform Smoke Tests"
echo "======================================"
echo "Base URL: $BASE_URL"
echo "Timeout: ${TIMEOUT}s"
echo ""

# Function to run a test
run_test() {
    local test_name=$1
    local url=$2
    local expected_status=${3:-200}
    local method=${4:-GET}
    local data=${5:-""}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Test $TOTAL_TESTS: $test_name ... "
    
    if [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" \
            --max-time $TIMEOUT 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" --max-time $TIMEOUT 2>&1)
    fi
    
    status_code=$(echo "$response" | tail -n 1)
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Test 1: Health Check Endpoint
run_test "Health Check" "$BASE_URL/health" 200

# Test 2: HCX API Health
run_test "HCX API Health" "$BASE_URL/api/v1/hcx/health" 200

# Test 3: API Gateway Health
run_test "API Gateway Health" "$BASE_URL/actuator/health" 200

# Test 4: Coverage Eligibility Endpoint (should accept POST)
test_data='{"patientId":"TEST001","payorCode":"TEST","recipientCode":"TEST","serviceCategory":"outpatient"}'
run_test "Coverage Eligibility Check" "$BASE_URL/api/v1/hcx/coverage/eligibility/check" 200 POST "$test_data"

# Test 5: Database Connectivity Check
run_test "Database Connectivity" "$BASE_URL/api/v1/hcx/health/db" 200

# Test 6: Redis Connectivity Check
run_test "Redis Connectivity" "$BASE_URL/api/v1/hcx/health/redis" 200

# Test 7: Metrics Endpoint
run_test "Metrics Endpoint" "$BASE_URL/actuator/metrics" 200

# Test 8: Participant Registry Health
run_test "Participant Registry" "$BASE_URL/api/v1/participant/health" 200

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $((TOTAL_TESTS - FAILED_TESTS))"
echo "Failed: $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}All smoke tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some smoke tests failed! ✗${NC}"
    exit 1
fi

