/**
 * k6 Stress Test - System Breaking Point Analysis
 * Gradually increases load to find system limits
 * 
 * Usage:
 *   k6 run stress-test.js
 * 
 * @author HCX Platform Team
 * @version 1.0.0
 * @since Sprint 2
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 50 },     // Ramp up to 50 users
    { duration: '5m', target: 50 },     // Stay at 50
    { duration: '2m', target: 100 },    // Ramp to 100
    { duration: '5m', target: 100 },    // Stay at 100
    { duration: '2m', target: 200 },    // Ramp to 200
    { duration: '5m', target: 200 },    // Stay at 200
    { duration: '2m', target: 300 },    // Ramp to 300
    { duration: '5m', target: 300 },    // Stay at 300
    { duration: '2m', target: 400 },    // Ramp to 400
    { duration: '5m', target: 400 },    // Stay at 400
    { duration: '5m', target: 0 },      // Ramp down
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests should be below 2s
    'errors': ['rate<0.1'],               // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';

export default function () {
  const payload = JSON.stringify({
    participantCode: 'PROVIDER001',
    apiKey: 'test-api-key',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const start = Date.now();
  const response = http.post(`${BASE_URL}/auth/token`, payload, params);
  const duration = Date.now() - start;

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
  responseTime.add(duration);

  sleep(1);
}
