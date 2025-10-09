/**
 * Dashboard API
 * Sprint 2 - Provider Dashboard
 */

import type { DashboardData } from '../types/dashboard.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const dashboardApi = {
  /**
   * Get complete dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await fetch(`${API_BASE_URL}/dashboard/provider`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return response.json();
  },

  /**
   * Get dashboard metrics only
   */
  async getMetrics() {
    const response = await fetch(`${API_BASE_URL}/dashboard/provider/metrics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    return response.json();
  },

  /**
   * Get approval rate history
   */
  async getApprovalRateHistory(months: number = 6) {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/provider/approval-rate?months=${months}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch approval rate history');
    }

    return response.json();
  },

  /**
   * Get revenue trend
   */
  async getRevenueTrend(months: number = 6) {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/provider/revenue-trend?months=${months}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch revenue trend');
    }

    return response.json();
  },

  /**
   * Get recent claims
   */
  async getRecentClaims(limit: number = 5) {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/provider/recent-claims?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recent claims');
    }

    return response.json();
  },

  /**
   * Get pending authorizations
   */
  async getPendingAuthorizations(limit: number = 5) {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/provider/pending-authorizations?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch pending authorizations');
    }

    return response.json();
  },

  /**
   * Get outstanding queries
   */
  async getOutstandingQueries(limit: number = 5) {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/provider/outstanding-queries?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch outstanding queries');
    }

    return response.json();
  },
};

export default dashboardApi;
