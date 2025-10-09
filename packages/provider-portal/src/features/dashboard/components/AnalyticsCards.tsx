/**
 * Analytics Cards Component
 * Sprint 2 - Provider Dashboard
 */

import { TrendingUp, TrendingDown, FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardMetrics } from '../types/dashboard.types';

interface AnalyticsCardsProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
}

export function AnalyticsCards({ metrics, isLoading }: AnalyticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Claims',
      value: metrics.totalClaims.toLocaleString(),
      change: metrics.claimsChange,
      icon: <FileText className="w-6 h-6" />,
      color: 'blue',
    },
    {
      title: 'Approval Rate',
      value: `${metrics.approvalRate.toFixed(1)}%`,
      change: metrics.approvalRateChange,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
    },
    {
      title: 'Avg TAT',
      value: `${metrics.averageTAT.toFixed(1)} days`,
      change: metrics.tatChange,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      invertChange: true, // Lower TAT is better
    },
    {
      title: 'Total Revenue',
      value: `₹${(metrics.totalRevenue / 1000000).toFixed(2)}M`,
      change: metrics.revenueChange,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(card => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  invertChange?: boolean;
}

function MetricCard({ title, value, change, icon, color, invertChange }: MetricCardProps) {
  const isPositive = invertChange ? change < 0 : change > 0;
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={cn(
            'text-sm font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="w-16 h-5 bg-gray-200 rounded" />
      </div>
      <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-32 bg-gray-200 rounded" />
    </div>
  );
}

export default AnalyticsCards;
