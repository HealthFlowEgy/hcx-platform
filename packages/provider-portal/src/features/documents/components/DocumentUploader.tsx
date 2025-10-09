/**
 * Document Uploader Component
 * Sprint 2 - IPD Provider Portal
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { DocumentCard } from './DocumentCard';
import type { DocumentCategory, UploadedDocument } from '../types/document.types';

interface DocumentUploaderProps {
  claimId?: string;
  category: DocumentCategory;
  onUploadComplete?: (documents: UploadedDocument[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function DocumentUploader({
  claimId,
  category,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
}: DocumentUploaderProps) {
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const { uploadDocument, isUploading } = useDocumentUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessage = errors.map((e: any) => e.message).join(', ');
        setErrors(prev => new Map(prev).set(file.name, errorMessage));
      });

      // Add accepted files to queue
      setUploadQueue(prev => [...prev, ...acceptedFiles]);

      // Upload files
      for (const file of acceptedFiles) {
        try {
          const uploaded = await uploadDocument({
            file,
            category,
            claimId,
            metadata: {
              originalName: file.name,
              size: file.size,
              mimeType: file.type,
            },
          });

          setUploadedDocs(prev => [...prev, uploaded]);
          setUploadQueue(prev => prev.filter(f => f !== file));
          toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
          setErrors(
            prev =>
              new Map(prev).set(
                file.name,
                error instanceof Error ? error.message : 'Upload failed'
              )
          );
          setUploadQueue(prev => prev.filter(f => f !== file));
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (onUploadComplete && uploadedDocs.length > 0) {
        onUploadComplete(uploadedDocs);
      }
    },
    [category, claimId, uploadDocument, onUploadComplete, uploadedDocs]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles,
    maxSize,
    multiple: true,
  });

  const removeDocument = async (docId: string) => {
    try {
      // await documentApi.delete(docId);
      setUploadedDocs(prev => prev.filter(doc => doc.id !== docId));
      toast.success('Document removed');
    } catch (error) {
      toast.error('Failed to remove document');
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} disabled={isUploading} />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

        {isDragActive ? (
          <p className="text-lg text-primary font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supported: PDF, JPEG, PNG (max {maxSize / 1024 / 1024}MB per file)
            </p>
          </>
        )}
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Uploading...</h4>
          {uploadQueue.map(file => (
            <div key={file.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Uploaded ({uploadedDocs.length})</h4>
          {uploadedDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} onRemove={() => removeDocument(doc.id)} />
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.size > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-red-600">Errors</h4>
          {Array.from(errors.entries()).map(([filename, error]) => (
            <div key={filename} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{filename}</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentUploader;
