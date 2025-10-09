/**
 * Document Management API
 * Sprint 2 - IPD Provider Portal
 */

import type { UploadDocumentRequest, UploadedDocument } from '../types/document.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const getToken = (): string => {
  return localStorage.getItem('access_token') || '';
};

export const documentApi = {
  /**
   * Upload a document
   */
  upload: async (data: UploadDocumentRequest): Promise<UploadedDocument> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('category', data.category);
    if (data.claimId) formData.append('claimId', data.claimId);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  /**
   * List documents for a claim
   */
  list: async (claimId: string): Promise<UploadedDocument[]> => {
    const response = await fetch(`${API_BASE_URL}/documents?claimId=${claimId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  },

  /**
   * Get document by ID
   */
  getById: async (documentId: string): Promise<UploadedDocument> => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    return response.json();
  },

  /**
   * Delete a document
   */
  delete: async (documentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  },

  /**
   * Get presigned URL for document access
   */
  getPresignedUrl: async (documentId: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/url`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get document URL');
    }

    const data = await response.json();
    return data.url;
  },

  /**
   * Get document categories
   */
  getCategories: async (): Promise<{ value: string; label: string }[]> => {
    return [
      { value: 'medical_records', label: 'Medical Records' },
      { value: 'prescriptions', label: 'Prescriptions' },
      { value: 'lab_reports', label: 'Lab Reports' },
      { value: 'discharge_summary', label: 'Discharge Summary' },
      { value: 'consent_forms', label: 'Consent Forms' },
      { value: 'invoices', label: 'Invoices' },
      { value: 'other', label: 'Other' },
    ];
  },
};

export default documentApi;
