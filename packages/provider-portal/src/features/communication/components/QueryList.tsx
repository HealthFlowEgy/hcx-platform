/**
 * Query List Component
 * Sprint 2 - Communication Interface
 */

import { formatDistanceToNow } from 'date-fns';
import { Paperclip, Clock, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Query } from '../types/communication.types';

interface QueryListProps {
  queries: Query[];
  isLoading: boolean;
  selectedQueryId: string | null;
  onSelectQuery: (id: string) => void;
}

export function QueryList({
  queries,
  isLoading,
  selectedQueryId,
  onSelectQuery,
}: QueryListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <QueryItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No queries yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {queries.map(query => (
        <QueryItem
          key={query.id}
          query={query}
          isSelected={selectedQueryId === query.id}
          onClick={() => onSelectQuery(query.id)}
        />
      ))}
    </div>
  );
}

interface QueryItemProps {
  query: Query;
  isSelected: boolean;
  onClick: () => void;
}

function QueryItem({ query, isSelected, onClick }: QueryItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-3 h-3" />;
      case 'medium':
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left hover:bg-gray-50 transition-colors',
        isSelected && 'bg-blue-50 border-l-4 border-blue-600'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1',
              getPriorityColor(query.priority)
            )}
          >
            {getPriorityIcon(query.priority)}
            {query.priority}
          </span>
          {query.status === 'resolved' && (
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
        </div>
        {query.unreadCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
            {query.unreadCount}
          </span>
        )}
      </div>

      <h4 className="font-medium text-sm mb-1 truncate">{query.subject}</h4>

      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{query.lastMessage}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="font-medium">{query.senderName}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(query.lastUpdated), { addSuffix: true })}</span>
        </span>
        {query.attachmentCount > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip className="w-3 h-3" />
            {query.attachmentCount}
          </span>
        )}
      </div>
    </button>
  );
}

function QueryItemSkeleton() {
  return (
    <div className="p-4 space-y-2 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-4 w-4 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export default QueryList;
