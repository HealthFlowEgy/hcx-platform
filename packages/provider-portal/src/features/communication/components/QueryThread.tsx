/**
 * Query Thread Component
 * Sprint 2 - Communication Interface
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle, Paperclip, Download, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { communicationApi } from '../api/communicationApi';
import type { QueryMessage } from '../types/communication.types';

interface QueryThreadProps {
  queryId: string;
  participantRole: 'provider' | 'payor';
  onQueryResolved?: () => void;
}

export function QueryThread({
  queryId,
  participantRole,
  onQueryResolved,
}: QueryThreadProps) {
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const { data: thread, isLoading } = useQuery({
    queryKey: ['query-thread', queryId],
    queryFn: () => communicationApi.getQueryThread(queryId),
  });

  const sendReplyMutation = useMutation({
    mutationFn: (message: string) =>
      communicationApi.sendResponse({
        queryId,
        message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['query-thread', queryId] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      setReplyText('');
      toast.success('Reply sent successfully');
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  const resolveQueryMutation = useMutation({
    mutationFn: () => communicationApi.markResolved(queryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['query-thread', queryId] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      toast.success('Query marked as resolved');
      onQueryResolved?.();
    },
    onError: () => {
      toast.error('Failed to resolve query');
    },
  });

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    sendReplyMutation.mutate(replyText);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Query not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1">{thread.subject}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                thread.status === 'resolved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              )}>
                {thread.status}
              </span>
              <span>•</span>
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                thread.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : thread.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              )}>
                {thread.priority} priority
              </span>
            </div>
          </div>

          {thread.status === 'open' && (
            <Button
              onClick={() => resolveQueryMutation.mutate()}
              disabled={resolveQueryMutation.isPending}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {thread.messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderRole === participantRole}
          />
        ))}
      </div>

      {/* Reply Form */}
      {thread.status === 'open' && (
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 min-h-[80px] resize-none"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sendReplyMutation.isPending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: QueryMessage;
  isOwnMessage: boolean;
}

function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[70%] space-y-2')}>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {!isOwnMessage && (
            <>
              <span className="font-medium">{message.senderName}</span>
              <span>•</span>
            </>
          )}
          <span>{format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}</span>
        </div>

        <div
          className={cn(
            'px-4 py-3 rounded-lg',
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2">
            {message.attachments.map(attachment => (
              <a
                key={attachment.id}
                href={attachment.url}
                download
                className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="flex-1 truncate">{attachment.name}</span>
                <Download className="w-4 h-4 text-gray-500" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] space-y-2 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="px-4 py-3 bg-gray-200 rounded-lg">
          <div className="h-4 w-64 bg-gray-300 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}

export default QueryThread;
