import axios from 'axios';

const HCX_API_BASE_URL = process.env.REACT_APP_HCX_API_BASE_URL || 'http://localhost:8082/api/v1/hcx';

// Create separate axios instance for HCX
const hcxApiClient = axios.create({
  baseURL: HCX_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
hcxApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// HCX API Services
export const hcxApiService = {
  // Coverage Eligibility
  checkCoverageEligibility: async (request: CoverageEligibilityRequest) => {
    const response = await hcxApiClient.post('/coverage/eligibility/check', request);
    return response.data;
  },

  // Pre-Authorization
  submitPreAuthorization: async (request: PreAuthorizationRequest) => {
    const response = await hcxApiClient.post('/claim/pre_auth', request);
    return response.data;
  },

  // Claims Submission
  submitClaim: async (request: ClaimSubmissionRequest) => {
    const response = await hcxApiClient.post('/claim/submit', request);
    return response.data;
  },

  // Status Check
  getClaimStatus: async (correlationId: string) => {
    const response = await hcxApiClient.get(`/claim/status/${correlationId}`);
    return response.data;
  },

  // Participant Search
  searchParticipants: async (filters: ParticipantSearchFilters) => {
    const response = await hcxApiClient.get('/participants/search', { params: filters });
    return response.data;
  },

  // Health Check
  healthCheck: async () => {
    const response = await hcxApiClient.get('/health');
    return response.data;
  },
};

// Types
export interface CoverageEligibilityRequest {
  patientId: string;
  payorCode: string;
  recipientCode: string;
  serviceCategory?: string;
  serviceCodes?: string[];
}

export interface PreAuthorizationRequest {
  patientId: string;
  payorCode: string;
  recipientCode: string;
  diagnosis: DiagnosisInfo[];
  procedures: ProcedureInfo[];
  estimatedCost: number;
}

export interface ClaimSubmissionRequest {
  patientId: string;
  payorCode: string;
  recipientCode: string;
  serviceDate: string;
  diagnosis: DiagnosisInfo[];
  procedures: ProcedureInfo[];
  totalAmount: number;
  supportingDocuments?: string[];
}

export interface DiagnosisInfo {
  code: string;
  description: string;
  type: 'primary' | 'secondary';
}

export interface ProcedureInfo {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ParticipantSearchFilters {
  participantCode?: string;
  participantRole?: string;
  status?: string;
}

export interface HCXResponse {
  status: string;
  headers?: any;
  payload?: any;
  errorCode?: string;
  errorMessage?: string;
  timestamp: number;
}
