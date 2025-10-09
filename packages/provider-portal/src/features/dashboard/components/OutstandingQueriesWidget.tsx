/**
 * Outstanding Queries Widget Component
 * Sprint 2 - Provider Dashboard
 */

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { OutstandingQuery } from '../types/dashboard.types';

interface OutstandingQueriesWidgetProps {
  queries: OutstandingQuery[];
  isLoading?: boolean;
}

export function OutstandingQueriesWidget({ queries, isLoading }: OutstandingQueriesWidgetProps) {
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

  const totalUnread = queries.reduce((sum, q) => sum + q.unreadCount, 0);

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Outstanding Queries</h3>
          {totalUnread > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
              {totalUnread} unread
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {queries.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No outstanding queries</p>
          </div>
        ) : (
          queries.map(query => (
            <QueryItem key={query.id} query={query} />
          ))
        )}
      </div>
    </div>
  );
}

interface QueryItemProps {
  query: OutstandingQuery;
}

function QueryItem({ query }: QueryItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{query.claimNumber}</span>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              getPriorityColor(query.priority)
            )}>
              {query.priority}
            </span>
            {query.unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                {query.unreadCount}
              </span>
            )}
          </div>
          <h4 className="font-medium text-sm mb-1 line-clamp-1">{query.subject}</h4>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Updated {formatDistanceToNow(new Date(query.lastUpdated), { addSuffix: true })}
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-blue-600">
          Reply
        </Button>
      </div>
    </div>
  );
}

export default OutstandingQueriesWidget;
