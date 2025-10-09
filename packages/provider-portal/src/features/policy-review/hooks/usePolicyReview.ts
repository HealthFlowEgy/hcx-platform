/**
 * usePolicyReview Hook
 * Sprint 2 - Policy Digitization Review Interface
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { policyApi } from '../api/policyApi';
import type { ApprovalRequest } from '../types/policy.types';

export function usePolicyReview(policyId: string) {
  return useQuery({
    queryKey: ['policy-review', policyId],
    queryFn: () => policyApi.getPolicyReview(policyId),
    enabled: !!policyId,
  });
}

export function useUpdateField(policyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, value }: { fieldId: string; value: any }) =>
      policyApi.updateField(policyId, fieldId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-review', policyId] });
      toast.success('Field updated successfully');
    },
    onError: () => {
      toast.error('Failed to update field');
    },
  });
}

export function useRequestReExtraction(policyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => policyApi.requestReExtraction(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-review', policyId] });
      toast.success('Re-extraction requested. This may take a few minutes.');
    },
    onError: () => {
      toast.error('Failed to request re-extraction');
    },
  });
}

export function useAddComment(policyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comment, fieldId }: { comment: string; fieldId?: string }) =>
      policyApi.addComment(policyId, comment, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-review', policyId] });
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });
}

export function useSubmitApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ApprovalRequest) => policyApi.submitApproval(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policy-review', variables.policyId] });
      toast.success(
        variables.approved
          ? 'Policy approved successfully'
          : 'Policy rejected'
      );
    },
    onError: () => {
      toast.error('Failed to submit approval');
    },
  });
}

export default usePolicyReview;
