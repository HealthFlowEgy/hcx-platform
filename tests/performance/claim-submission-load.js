/**
 * k6 Performance Test - Claim Submission Load Testing
 * Tests system performance under various load conditions
 * 
 * Usage:
 *   k6 run claim-submission-load.js
 *   k6 run --vus 100 --duration 5m claim-submission-load.js
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const claimSubmissionRate = new Rate('claim_submission_success_rate');
const claimSubmissionDuration = new Trend('claim_submission_duration');
const authFailures = new Counter('auth_failures');
const claimFailures = new Counter('claim_failures');

// Test configuration
export const options = {
  stages: [
    // Warm-up
    { duration: '2m', target: 10 },    // Ramp up to 10 users
    
    // Normal load
    { duration: '5m', target: 50 },    // Stay at 50 users
    
    // Peak load
    { duration: '3m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    
    // Stress test
    { duration: '2m', target: 200 },   // Spike to 200 users
    { duration: '3m', target: 200 },   // Maintain spike
    
    // Cool down
    { duration: '2m', target: 0 },     // Ramp down to 0
  ],
  
  thresholds: {
    // HTTP request duration should be below 500ms for 95% of requests
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    
    // Claim submission success rate should be above 95%
    'claim_submission_success_rate': ['rate>0.95'],
    
    // Less than 1% of requests should fail
    'http_req_failed': ['rate<0.01'],
    
    // Authentication failures should be minimal
    'auth_failures': ['count<10'],
    
    // Claim failures should be minimal
    'claim_failures': ['count<50'],
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';

// Test data
const PROVIDERS = ['PROVIDER001', 'PROVIDER002', 'PROVIDER003', 'PROVIDER004', 'PROVIDER005'];
const PAYORS = ['PAYOR001', 'PAYOR002', 'PAYOR003'];
const CLAIM_TYPES = ['INPATIENT', 'OUTPATIENT', 'EMERGENCY', 'DAYCARE'];
const DIAGNOSIS_CODES = ['A00.0', 'A00.1', 'A00.9', 'A01.0', 'A01.1'];

// Authentication
function authenticate() {
  const providerId = randomItem(PROVIDERS);
  
  const authPayload = JSON.stringify({
    participantCode: providerId,
    apiKey: 'test-api-key',
  });

  const authResponse = http.post(`${BASE_URL}/auth/token`, authPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'Authentication' },
  });

  const authSuccess = check(authResponse, {
    'auth status is 200': (r) => r.status === 200,
    'auth token received': (r) => r.json('accessToken') !== undefined,
  });

  if (!authSuccess) {
    authFailures.add(1);
    return null;
  }

  return {
    token: authResponse.json('accessToken'),
    providerId: providerId,
  };
}

// Generate random claim data
function generateClaimData(providerId) {
  const timestamp = Date.now();
  
  return {
    providerClaimId: `CLAIM-PERF-${timestamp}-${randomIntBetween(1000, 9999)}`,
    providerId: providerId,
    payorId: randomItem(PAYORS),
    beneficiaryId: `BENEFICIARY${randomIntBetween(1, 1000)}`,
    policyNumber: `POL-${randomIntBetween(100000, 999999)}`,
    serviceDate: '2025-10-01',
    claimAmount: randomIntBetween(1000, 50000),
    claimType: randomItem(CLAIM_TYPES),
    diagnosisCode: randomItem(DIAGNOSIS_CODES),
    procedureCode: '99213',
  };
}

// Main test scenario
export default function () {
  // Authenticate
  const auth = authenticate();
  if (!auth) {
    sleep(1);
    return;
  }

  const { token, providerId } = auth;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Claim Submission Test
  group('Claim Submission', () => {
    const claimData = generateClaimData(providerId);
    const claimPayload = JSON.stringify(claimData);

    const submitStart = Date.now();
    const submitResponse = http.post(`${BASE_URL}/claims/submit`, claimPayload, {
      headers: headers,
      tags: { name: 'Submit Claim' },
    });
    const submitDuration = Date.now() - submitStart;

    const submitSuccess = check(submitResponse, {
      'submit status is 201': (r) => r.status === 201,
      'claim ID received': (r) => r.json('claimId') !== undefined,
      'status is SUBMITTED': (r) => r.json('status') === 'SUBMITTED',
    });

    claimSubmissionRate.add(submitSuccess);
    claimSubmissionDuration.add(submitDuration);

    if (!submitSuccess) {
      claimFailures.add(1);
      console.error(`Claim submission failed: ${submitResponse.status} - ${submitResponse.body}`);
    } else {
      const claimId = submitResponse.json('claimId');

      // Check claim status
      group('Check Claim Status', () => {
        sleep(randomIntBetween(1, 3));

        const statusResponse = http.get(`${BASE_URL}/claims/${claimId}/status`, {
          headers: headers,
          tags: { name: 'Get Claim Status' },
        });

        check(statusResponse, {
          'status check is 200': (r) => r.status === 200,
          'claim ID matches': (r) => r.json('claimId') === claimId,
          'status field exists': (r) => r.json('status') !== undefined,
        });
      });
    }
  });

  // Eligibility Check Test
  group('Eligibility Check', () => {
    const eligibilityPayload = JSON.stringify({
      beneficiaryId: `BENEFICIARY${randomIntBetween(1, 1000)}`,
      policyNumber: `POL-${randomIntBetween(100000, 999999)}`,
      payorId: randomItem(PAYORS),
      serviceDate: '2025-10-01',
    });

    const eligibilityResponse = http.post(`${BASE_URL}/eligibility/check`, eligibilityPayload, {
      headers: headers,
      tags: { name: 'Check Eligibility' },
    });

    check(eligibilityResponse, {
      'eligibility status is 200': (r) => r.status === 200,
      'eligible field exists': (r) => r.json('eligible') !== undefined,
    });
  });

  // Search Claims Test
  group('Search Claims', () => {
    const searchResponse = http.get(`${BASE_URL}/claims/search?providerId=${providerId}&page=1&pageSize=10`, {
      headers: headers,
      tags: { name: 'Search Claims' },
    });

    check(searchResponse, {
      'search status is 200': (r) => r.status === 200,
      'claims array exists': (r) => Array.isArray(r.json('claims')),
      'total count exists': (r) => r.json('total') !== undefined,
    });
  });

  // Think time - simulate user reading/processing
  sleep(randomIntBetween(2, 5));
}

// Setup function - runs once before test
export function setup() {
  console.log('Starting performance test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Test stages:');
  console.log('  - Warm-up: 2m -> 10 users');
  console.log('  - Normal: 5m @ 50 users');
  console.log('  - Peak: 5m @ 100 users');
  console.log('  - Stress: 3m @ 200 users');
  console.log('  - Cool down: 2m -> 0 users');
  
  return { startTime: Date.now() };
}

// Teardown function - runs once after test
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Test completed in ${duration.toFixed(2)} seconds`);
}
