/**
 * Connection Status Badge Component
 * Sprint 2 - Real-time Status Tracking
 */

import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConnectionStatusBadgeProps {
  status: 'connecting' | 'connected' | 'disconnected';
  className?: string;
}

export function ConnectionStatusBadge({ status, className }: ConnectionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-3 h-3" />,
          label: 'Connected',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          label: 'Disconnected',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={cn('flex items-center gap-1.5', config.className, className)}>
      {config.icon}
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  );
}

export default ConnectionStatusBadge;
