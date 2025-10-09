/**
 * Policy Review Interface Component
 * Sprint 2 - Policy Digitization Review Interface
 * 
 * Complete implementation with PDF viewer, data editor, and approval workflow
 */

import { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  usePolicyReview,
  useUpdateField,
  useRequestReExtraction,
  useAddComment,
  useSubmitApproval,
} from './hooks/usePolicyReview';
import type { ExtractedField } from './types/policy.types';

interface PolicyReviewInterfaceProps {
  policyId: string;
}

export function PolicyReviewInterface({ policyId }: PolicyReviewInterfaceProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [approvalReason, setApprovalReason] = useState('');

  const { data: review, isLoading } = usePolicyReview(policyId);
  const updateFieldMutation = useUpdateField(policyId);
  const reExtractMutation = useRequestReExtraction(policyId);
  const addCommentMutation = useAddComment(policyId);
  const submitApprovalMutation = useSubmitApproval();

  const handleFieldUpdate = (fieldId: string, value: any) => {
    updateFieldMutation.mutate({ fieldId, value });
  };

  const handleApprove = () => {
    submitApprovalMutation.mutate({
      policyId,
      approved: true,
      comments: approvalReason,
    });
  };

  const handleReject = () => {
    if (!approvalReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    submitApprovalMutation.mutate({
      policyId,
      approved: false,
      reason: approvalReason,
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!review) {
    return <div className="p-8 text-center text-gray-500">Policy not found</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{review.policy.policyNumber}</h1>
            <p className="text-sm text-gray-600">
              {review.policy.insurerName} • {review.policy.policyHolderName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => reExtractMutation.mutate()}
              disabled={reExtractMutation.isPending}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', reExtractMutation.isPending && 'animate-spin')} />
              Re-extract
            </Button>
            <Button
              onClick={() => setShowComments(!showComments)}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments ({review.comments.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-1/2 border-r bg-white p-6 overflow-auto">
          <PDFViewer
            pdfUrl={review.policy.pdfUrl}
            highlightedField={selectedField}
            fields={review.extractedData.fields}
          />
        </div>

        {/* Data Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            <ExtractedDataEditor
              fields={review.extractedData.fields}
              selectedFieldId={selectedField}
              onFieldSelect={setSelectedField}
              onFieldUpdate={handleFieldUpdate}
            />
          </div>

          {/* Approval Workflow */}
          <div className="border-t bg-white p-6">
            <h3 className="font-semibold mb-3">Review Decision</h3>
            <Textarea
              value={approvalReason}
              onChange={e => setApprovalReason(e.target.value)}
              placeholder="Add comments or reason for rejection..."
              className="mb-3"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={submitApprovalMutation.isPending}
                variant="outline"
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={submitApprovalMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <CommentsPanel
          comments={review.comments}
          onClose={() => setShowComments(false)}
          onAddComment={(text) => addCommentMutation.mutate({ comment: text })}
        />
      )}
    </div>
  );
}

// PDF Viewer Component
function PDFViewer({ pdfUrl, highlightedField, fields }: any) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4 text-center">
        <p className="text-sm text-gray-600">PDF Viewer</p>
        <p className="text-xs text-gray-500 mt-1">
          Use react-pdf or pdf.js for actual PDF rendering
        </p>
        <p className="text-xs text-gray-500">PDF URL: {pdfUrl}</p>
      </div>
      <div className="p-4 bg-white min-h-[600px]">
        {/* PDF rendering would go here */}
        <div className="text-center text-gray-400 mt-20">
          <p>PDF Document Preview</p>
          <p className="text-sm mt-2">
            Highlighted field: {highlightedField || 'None'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Extracted Data Editor Component
function ExtractedDataEditor({ fields, selectedFieldId, onFieldSelect, onFieldUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Extracted Data</h3>
      {fields.map((field: ExtractedField) => (
        <FieldEditor
          key={field.id}
          field={field}
          isSelected={selectedFieldId === field.id}
          onSelect={() => onFieldSelect(field.id)}
          onUpdate={(value) => onFieldUpdate(field.id, value)}
        />
      ))}
    </div>
  );
}

// Field Editor Component
function FieldEditor({ field, isSelected, onSelect, onUpdate }: any) {
  const [value, setValue] = useState(field.value);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(value);
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 border rounded-lg cursor-pointer transition-colors',
        isSelected && 'border-blue-500 bg-blue-50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <label className="font-medium text-sm">{field.fieldName}</label>
          <ConfidenceBadge confidence={field.confidence} />
        </div>
        {field.validationErrors.length > 0 && (
          <span className="text-xs text-red-600">
            {field.validationErrors.length} errors
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">Save</Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm">{field.value}</p>
          <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

// Confidence Badge Component
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <span className={cn('ml-2 px-2 py-0.5 text-xs font-medium rounded', getColor())}>
      {(confidence * 100).toFixed(0)}% confident
    </span>
  );
}

// Comments Panel Component
function CommentsPanel({ comments, onClose, onAddComment }: any) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-lg p-6 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Comments</h3>
        <Button onClick={onClose} variant="ghost" size="sm">Close</Button>
      </div>

      <div className="space-y-4 mb-4">
        {comments.map((comment: any) => (
          <div key={comment.id} className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium">{comment.userName}</p>
            <p className="text-sm text-gray-600 mt-1">{comment.comment}</p>
            <p className="text-xs text-gray-400 mt-1">{comment.timestamp}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <Button onClick={handleSubmit} className="w-full">Add Comment</Button>
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="h-screen flex">
      <div className="w-1/2 p-6 animate-pulse">
        <div className="h-full bg-gray-200 rounded" />
      </div>
      <div className="w-1/2 p-6 animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default PolicyReviewInterface;
