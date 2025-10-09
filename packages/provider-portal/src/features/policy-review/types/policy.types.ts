/**
 * Policy Review Types
 * Sprint 2 - Policy Digitization Review Interface
 */

export interface PolicyDocument {
  id: string;
  policyNumber: string;
  insurerName: string;
  policyHolderName: string;
  uploadedAt: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  pdfUrl: string;
  pageCount: number;
}

export interface ExtractedField {
  id: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'array';
  value: any;
  confidence: number;
  pageNumber: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isEdited: boolean;
  isValidated: boolean;
  validationErrors: string[];
}

export interface ExtractedData {
  policyId: string;
  fields: ExtractedField[];
  extractedAt: string;
  model: string;
  overallConfidence: number;
}

export interface PolicyReviewComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
  fieldId?: string;
}

export interface PolicyReview {
  policy: PolicyDocument;
  extractedData: ExtractedData;
  comments: PolicyReviewComment[];
}

export interface ApprovalRequest {
  policyId: string;
  approved: boolean;
  reason?: string;
  comments?: string;
}
