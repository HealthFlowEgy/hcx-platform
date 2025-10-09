/**
 * Document Management Types
 * Sprint 2 - IPD Provider Portal
 */

export type DocumentCategory =
  | 'medical_records'
  | 'prescriptions'
  | 'lab_reports'
  | 'discharge_summary'
  | 'consent_forms'
  | 'invoices'
  | 'other';

export interface UploadedDocument {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  claimId?: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
  version?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface UploadDocumentRequest {
  file: File;
  category: DocumentCategory;
  claimId?: string;
  metadata?: Record<string, any>;
}

export interface DocumentUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface DocumentPreviewProps {
  document: UploadedDocument;
  onClose: () => void;
}

export interface DocumentCardProps {
  document: UploadedDocument;
  onRemove: () => void;
  onPreview?: () => void;
}

export interface DocumentUploaderProps {
  claimId?: string;
  category: DocumentCategory;
  onUploadComplete?: (documents: UploadedDocument[]) => void;
  maxFiles?: number;
  maxSize?: number;
}
