/**
 * Document Upload Hook
 * Sprint 2 - IPD Provider Portal
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';
import type { UploadDocumentRequest, UploadedDocument } from '../types/document.types';

export function useDocumentUpload() {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: UploadDocumentRequest) => documentApi.upload(data),
    onSuccess: (data, variables) => {
      // Invalidate documents query to refetch
      if (variables.claimId) {
        queryClient.invalidateQueries({ queryKey: ['documents', variables.claimId] });
      }
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const uploadDocument = async (data: UploadDocumentRequest): Promise<UploadedDocument> => {
    const fileName = data.file.name;
    
    try {
      setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
      
      const result = await uploadMutation.mutateAsync(data);
      
      setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
      
      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileName];
          return newProgress;
        });
      }, 2000);
      
      return result;
    } catch (error) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
      throw error;
    }
  };

  return {
    uploadDocument,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error: uploadMutation.error,
  };
}

export default useDocumentUpload;
