/**
 * Recent Claims Widget Component
 * Sprint 2 - Provider Dashboard
 */

import { formatDistanceToNow } from 'date-fns';
import { Eye, Edit, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RecentClaim } from '../types/dashboard.types';

interface RecentClaimsWidgetProps {
  claims: RecentClaim[];
  isLoading?: boolean;
}

export function RecentClaimsWidget({ claims, isLoading }: RecentClaimsWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Claims</h3>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {claims.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No recent claims</p>
        ) : (
          claims.map(claim => (
            <ClaimItem key={claim.id} claim={claim} />
          ))
        )}
      </div>
    </div>
  );
}

interface ClaimItemProps {
  claim: RecentClaim;
}

function ClaimItem({ claim }: ClaimItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{claim.claimNumber}</h4>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              getStatusColor(claim.status)
            )}>
              {claim.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{claim.patientName}</p>
        </div>
        <p className="font-semibold text-sm">
          ₹{claim.amount.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(claim.submittedAt), { addSuffix: true })}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecentClaimsWidget;
