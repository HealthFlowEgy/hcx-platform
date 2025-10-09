/**
 * Claim Status Timeline Component
 * Sprint 2 - Real-time Status Tracking
 */

import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ClaimStatusUpdate } from '@/hooks/useClaimStatusWebSocket';

interface ClaimStatusTimelineProps {
  updates: ClaimStatusUpdate[];
  isLoading?: boolean;
}

export function ClaimStatusTimeline({ updates, isLoading }: ClaimStatusTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No status updates yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((update, index) => (
        <div key={`${update.claimId}-${update.timestamp}`} className="flex gap-4">
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div className="p-2 bg-white rounded-full border-2 border-gray-200">
              {getStatusIcon(update.status)}
            </div>
            {index < updates.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
          </div>

          {/* Content */}
          <div className="flex-1 pb-8">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-xs font-medium', getStatusColor(update.status))}>
                {update.status}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
              </span>
            </div>

            {update.message && <p className="text-sm text-gray-700 mt-2">{update.message}</p>}

            {update.metadata && Object.keys(update.metadata).length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Additional Details</p>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(update.metadata).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-gray-900 font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ClaimStatusTimeline;
