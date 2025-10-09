/**
 * useDashboard Hook
 * Sprint 2 - Provider Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboardData(),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardApi.getMetrics(),
    refetchInterval: 60000,
  });
}

export function useApprovalRateHistory(months: number = 6) {
  return useQuery({
    queryKey: ['dashboard', 'approval-rate', months],
    queryFn: () => dashboardApi.getApprovalRateHistory(months),
  });
}

export function useRevenueTrend(months: number = 6) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend', months],
    queryFn: () => dashboardApi.getRevenueTrend(months),
  });
}

export default useDashboard;
