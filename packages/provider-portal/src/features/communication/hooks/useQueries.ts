/**
 * useQueries Hook
 * Sprint 2 - Communication Interface
 */

import { useQuery } from '@tanstack/react-query';
import { communicationApi } from '../api/communicationApi';

interface UseQueriesOptions {
  claimId: string;
  status?: 'open' | 'resolved';
}

export function useQueries({ claimId, status }: UseQueriesOptions) {
  return useQuery({
    queryKey: ['queries', claimId, status],
    queryFn: () => communicationApi.getQueries(claimId, status),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export default useQueries;
