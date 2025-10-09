/**
 * Provider Dashboard Component
 * Sprint 2 - Provider Dashboard
 */

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from './hooks/useDashboard';
import { AnalyticsCards } from './components/AnalyticsCards';
import { ApprovalRateChart } from './components/ApprovalRateChart';
import { RevenueTrendChart } from './components/RevenueTrendChart';
import { RecentClaimsWidget } from './components/RecentClaimsWidget';
import { PendingAuthorizationsWidget } from './components/PendingAuthorizationsWidget';
import { OutstandingQueriesWidget } from './components/OutstandingQueriesWidget';

export function ProviderDashboard() {
  const { data: dashboardData, isLoading, refetch, isRefetching } = useDashboard();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your claims overview
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards
        metrics={dashboardData?.metrics || {
          totalClaims: 0,
          approvalRate: 0,
          averageTAT: 0,
          totalRevenue: 0,
          claimsChange: 0,
          approvalRateChange: 0,
          tatChange: 0,
          revenueChange: 0,
        }}
        isLoading={isLoading}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApprovalRateChart
          data={dashboardData?.approvalRateHistory || []}
          isLoading={isLoading}
        />
        <RevenueTrendChart
          data={dashboardData?.revenueTrend || []}
          isLoading={isLoading}
        />
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentClaimsWidget
          claims={dashboardData?.recentClaims || []}
          isLoading={isLoading}
        />
        <PendingAuthorizationsWidget
          authorizations={dashboardData?.pendingAuthorizations || []}
          isLoading={isLoading}
        />
        <OutstandingQueriesWidget
          queries={dashboardData?.outstandingQueries || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default ProviderDashboard;
