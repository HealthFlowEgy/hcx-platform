/**
 * Query Form Component
 * Sprint 2 - Communication Interface
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { communicationApi } from '../api/communicationApi';

interface QueryFormProps {
  claimId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function QueryForm({ claimId, onSuccess, onCancel }: QueryFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const queryClient = useQueryClient();

  const sendQueryMutation = useMutation({
    mutationFn: () =>
      communicationApi.sendQuery({
        claimId,
        subject,
        message,
        priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      toast.success('Query sent successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to send query');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    sendQueryMutation.mutate();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">New Query</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Enter query subject"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <Select value={priority} onValueChange={value => setPriority(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your query..."
            className="min-h-[200px] resize-none"
            required
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={sendQueryMutation.isPending}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Query
          </Button>
        </div>
      </form>
    </div>
  );
}

export default QueryForm;
