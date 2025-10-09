/**
 * Policy Review API
 * Sprint 2 - Policy Digitization Review Interface
 */

import type { PolicyReview, ApprovalRequest, ExtractedField } from '../types/policy.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const policyApi = {
  /**
   * Get policy review data
   */
  async getPolicyReview(policyId: string): Promise<PolicyReview> {
    const response = await fetch(`${API_BASE_URL}/policies/${policyId}/review`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch policy review');
    }

    return response.json();
  },

  /**
   * Update extracted field
   */
  async updateField(policyId: string, fieldId: string, value: any): Promise<ExtractedField> {
    const response = await fetch(
      `${API_BASE_URL}/policies/${policyId}/fields/${fieldId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update field');
    }

    return response.json();
  },

  /**
   * Request AI re-extraction
   */
  async requestReExtraction(policyId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/policies/${policyId}/re-extract`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to request re-extraction');
    }
  },

  /**
   * Add comment
   */
  async addComment(policyId: string, comment: string, fieldId?: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/policies/${policyId}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment, fieldId }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
  },

  /**
   * Approve or reject policy
   */
  async submitApproval(request: ApprovalRequest): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/policies/${request.policyId}/approval`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit approval');
    }
  },
};

export default policyApi;
