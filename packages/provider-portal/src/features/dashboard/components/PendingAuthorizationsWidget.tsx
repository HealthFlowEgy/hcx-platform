/**
 * Pending Authorizations Widget Component
 * Sprint 2 - Provider Dashboard
 */

import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PendingAuthorization } from '../types/dashboard.types';

interface PendingAuthorizationsWidgetProps {
  authorizations: PendingAuthorization[];
  isLoading?: boolean;
}

export function PendingAuthorizationsWidget({ authorizations, isLoading }: PendingAuthorizationsWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const highUrgencyCount = authorizations.filter(a => a.urgency === 'high').length;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Pending Authorizations</h3>
          {highUrgencyCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
              {highUrgencyCount} urgent
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {authorizations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No pending authorizations</p>
        ) : (
          authorizations.map(auth => (
            <AuthorizationItem key={auth.id} authorization={auth} />
          ))
        )}
      </div>
    </div>
  );
}

interface AuthorizationItemProps {
  authorization: PendingAuthorization;
}

function AuthorizationItem({ authorization }: AuthorizationItemProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'high') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className={cn(
      'p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors',
      authorization.urgency === 'high' && 'border-red-200 bg-red-50/50'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{authorization.authNumber}</h4>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1',
              getUrgencyColor(authorization.urgency)
            )}>
              {getUrgencyIcon(authorization.urgency)}
              {authorization.urgency}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{authorization.patientName}</p>
          <p className="text-xs text-gray-500">{authorization.procedure}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span className="text-xs text-gray-500">
          Waiting {authorization.daysWaiting} days
        </span>
        <Button variant="outline" size="sm" className="h-7">
          Review
        </Button>
      </div>
    </div>
  );
}

export default PendingAuthorizationsWidget;
