/**
 * Document Card Component
 * Sprint 2 - IPD Provider Portal
 */

import { useState } from 'react';
import { FileText, Image, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UploadedDocument } from '../types/document.types';

interface DocumentCardProps {
  document: UploadedDocument;
  onRemove: () => void;
  onPreview?: () => void;
}

export function DocumentCard({ document, onRemove, onPreview }: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    if (document.mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <Image className="w-5 h-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div
      className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getIcon()}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.originalName}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>{formatFileSize(document.size)}</span>
          <span>•</span>
          <span>{document.category.replace(/_/g, ' ')}</span>
          <span>•</span>
          <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />

        {isHovered && (
          <>
            {onPreview && (
              <Button variant="ghost" size="sm" onClick={onPreview}>
                Preview
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default DocumentCard;
