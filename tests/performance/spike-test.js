/**
 * k6 Spike Test - Sudden Traffic Surge Analysis
 * Tests system behavior under sudden load spikes
 * 
 * Usage:
 *   k6 run spike-test.js
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const successRate = new Rate('success_rate');

export const options = {
  stages: [
    { duration: '2m', target: 50 },      // Normal load
    { duration: '30s', target: 500 },    // Sudden spike!
    { duration: '3m', target: 500 },     // Maintain spike
    { duration: '2m', target: 50 },      // Return to normal
    { duration: '1m', target: 0 },       // Ramp down
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<3000'],
    'success_rate': ['rate>0.90'],
    'http_req_failed': ['rate<0.15'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';

export default function () {
  // Authenticate
  const authResponse = http.post(`${BASE_URL}/auth/token`, JSON.stringify({
    participantCode: 'PROVIDER001',
    apiKey: 'test-api-key',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const authSuccess = check(authResponse, {
    'auth successful': (r) => r.status === 200,
  });

  if (!authSuccess) {
    successRate.add(false);
    return;
  }

  const token = authResponse.json('accessToken');

  // Submit claim
  const claimResponse = http.post(`${BASE_URL}/claims/submit`, JSON.stringify({
    providerClaimId: `SPIKE-${Date.now()}-${randomIntBetween(1000, 9999)}`,
    providerId: 'PROVIDER001',
    payorId: 'PAYOR001',
    beneficiaryId: `BEN${randomIntBetween(1, 1000)}`,
    policyNumber: `POL-${randomIntBetween(100000, 999999)}`,
    serviceDate: '2025-10-01',
    claimAmount: randomIntBetween(1000, 10000),
    claimType: 'OUTPATIENT',
    diagnosisCode: 'A00.0',
    procedureCode: '99213',
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const claimSuccess = check(claimResponse, {
    'claim submitted': (r) => r.status === 201,
  });

  successRate.add(claimSuccess);

  sleep(randomIntBetween(1, 3));
}
