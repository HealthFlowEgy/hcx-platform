/**
 * Dashboard Types
 * Sprint 2 - Provider Dashboard
 */

export interface DashboardMetrics {
  totalClaims: number;
  approvalRate: number;
  averageTAT: number;
  totalRevenue: number;
  claimsChange: number;
  approvalRateChange: number;
  tatChange: number;
  revenueChange: number;
}

export interface ApprovalRateData {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}

export interface RevenueTrendData {
  month: string;
  revenue: number;
  claims: number;
}

export interface RecentClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  amount: number;
  status: 'submitted' | 'approved' | 'rejected' | 'pending';
  submittedAt: string;
}

export interface PendingAuthorization {
  id: string;
  authNumber: string;
  patientName: string;
  procedure: string;
  urgency: 'high' | 'medium' | 'low';
  requestedAt: string;
  daysWaiting: number;
}

export interface OutstandingQuery {
  id: string;
  queryId: string;
  claimNumber: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  lastUpdated: string;
  unreadCount: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  approvalRateHistory: ApprovalRateData[];
  revenueTrend: RevenueTrendData[];
  recentClaims: RecentClaim[];
  pendingAuthorizations: PendingAuthorization[];
  outstandingQueries: OutstandingQuery[];
}
