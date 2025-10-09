/**
 * Communication Types
 * Sprint 2 - Communication Interface
 */

export interface Query {
  id: string;
  claimId: string;
  subject: string;
  status: 'open' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  senderName: string;
  senderRole: 'provider' | 'payor';
  lastMessage: string;
  lastUpdated: string;
  unreadCount: number;
  attachmentCount: number;
}

export interface QueryMessage {
  id: string;
  queryId: string;
  content: string;
  senderName: string;
  senderRole: 'provider' | 'payor';
  timestamp: string;
  attachments?: Attachment[];
  readBy?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface QueryThread {
  id: string;
  claimId: string;
  subject: string;
  status: 'open' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  messages: QueryMessage[];
}

export interface SendQueryRequest {
  claimId: string;
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: File[];
}

export interface SendResponseRequest {
  queryId: string;
  message: string;
  attachments?: File[];
}
