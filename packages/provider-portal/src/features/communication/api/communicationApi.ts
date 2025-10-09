/**
 * Communication API
 * Sprint 2 - Communication Interface
 */

import type {
  Query,
  QueryThread,
  SendQueryRequest,
  SendResponseRequest,
} from '../types/communication.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const getToken = (): string => {
  return localStorage.getItem('access_token') || '';
};

export const communicationApi = {
  /**
   * Send query
   */
  sendQuery: async (data: SendQueryRequest): Promise<Query> => {
    const formData = new FormData();
    formData.append('claimId', data.claimId);
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    if (data.priority) formData.append('priority', data.priority);
    if (data.attachments) {
      data.attachments.forEach(file => formData.append('attachments', file));
    }

    const response = await fetch(`${API_BASE_URL}/communication/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send query');
    }

    return response.json();
  },

  /**
   * Get queries for a claim
   */
  getQueries: async (claimId: string, status?: string): Promise<Query[]> => {
    const params = new URLSearchParams({ claimId });
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/communication/queries?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch queries');
    }

    return response.json();
  },

  /**
   * Get query thread
   */
  getQueryThread: async (queryId: string): Promise<QueryThread> => {
    const response = await fetch(`${API_BASE_URL}/communication/queries/${queryId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch query thread');
    }

    return response.json();
  },

  /**
   * Send response
   */
  sendResponse: async (data: SendResponseRequest): Promise<void> => {
    const formData = new FormData();
    formData.append('queryId', data.queryId);
    formData.append('message', data.message);
    if (data.attachments) {
      data.attachments.forEach(file => formData.append('attachments', file));
    }

    const response = await fetch(`${API_BASE_URL}/communication/response`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send response');
    }
  },

  /**
   * Mark as resolved
   */
  markResolved: async (queryId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/communication/queries/${queryId}/resolve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error('Failed to resolve query');
    }
  },
};

export default communicationApi;
