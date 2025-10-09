/**
 * Communication Panel Component
 * Sprint 2 - Communication Interface
 */

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { communicationApi } from '../api/communicationApi';
import { QueryList } from './QueryList';
import { QueryThread } from './QueryThread';
import { QueryForm } from './QueryForm';

interface CommunicationPanelProps {
  claimId: string;
  participantRole: 'provider' | 'payor';
}

export function CommunicationPanel({
  claimId,
  participantRole,
}: CommunicationPanelProps) {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [showNewQuery, setShowNewQuery] = useState(false);

  const { data: queries, isLoading, refetch } = useQuery({
    queryKey: ['queries', claimId, filterStatus],
    queryFn: () =>
      communicationApi.getQueries(
        claimId,
        filterStatus === 'all' ? undefined : filterStatus
      ),
  });

  const unresolvedCount = queries?.filter(q => q.status === 'open').length || 0;

  return (
    <div className="h-[600px] flex flex-col border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-lg">Communication</h3>
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {unresolvedCount} unresolved
              </span>
            )}
          </div>

          <Button
            onClick={() => {
              setSelectedQuery(null);
              setShowNewQuery(true);
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            New Query
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <FilterButton
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            count={queries?.length}
          >
            All
          </FilterButton>
          <FilterButton
            active={filterStatus === 'open'}
            onClick={() => setFilterStatus('open')}
            count={queries?.filter(q => q.status === 'open').length}
          >
            Open
          </FilterButton>
          <FilterButton
            active={filterStatus === 'resolved'}
            onClick={() => setFilterStatus('resolved')}
            count={queries?.filter(q => q.status === 'resolved').length}
          >
            Resolved
          </FilterButton>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Query List */}
        <div className="w-80 border-r overflow-y-auto">
          <QueryList
            queries={queries || []}
            isLoading={isLoading}
            selectedQueryId={selectedQuery}
            onSelectQuery={setSelectedQuery}
          />
        </div>

        {/* Query Thread or New Query Form */}
        <div className="flex-1 overflow-y-auto">
          {showNewQuery ? (
            <QueryForm
              claimId={claimId}
              onSuccess={() => {
                setShowNewQuery(false);
                refetch();
              }}
              onCancel={() => setShowNewQuery(false)}
            />
          ) : selectedQuery ? (
            <QueryThread
              queryId={selectedQuery}
              participantRole={participantRole}
              onQueryResolved={refetch}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100 border'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-1.5 ${active ? 'text-blue-100' : 'text-gray-500'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-1">No query selected</p>
        <p className="text-sm">Select a query from the list or create a new one</p>
      </div>
    </div>
  );
}

export default CommunicationPanel;
