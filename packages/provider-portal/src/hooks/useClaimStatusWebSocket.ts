/**
 * Claim Status WebSocket Hook
 * Sprint 2 - Real-time Status Tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ClaimStatusUpdate {
  claimId: string;
  status: string;
  timestamp: string;
  message?: string;
  metadata?: Record<string, any>;
}

interface UseClaimStatusWebSocketOptions {
  claimIds: string[];
  onStatusUpdate?: (update: ClaimStatusUpdate) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useClaimStatusWebSocket({
  claimIds,
  onStatusUpdate,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
}: UseClaimStatusWebSocketOptions) {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');
  const [updates, setUpdates] = useState<ClaimStatusUpdate[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  const fetchClaimStatusUpdates = async (claimIds: string[]): Promise<ClaimStatusUpdate[]> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `/api/v1/claims/status-updates?${claimIds.map(id => `claimIds=${id}`).join('&')}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch status updates');
      }

      return response.json();
    } catch (error) {
      console.error('Polling failed:', error);
      return [];
    }
  };

  const startPolling = useCallback(() => {
    console.log('Starting polling fallback...');

    pollingIntervalRef.current = setInterval(async () => {
      const newUpdates = await fetchClaimStatusUpdates(claimIds);
      newUpdates.forEach(update => {
        setUpdates(prev => [update, ...prev]);
        onStatusUpdate?.(update);
      });
    }, 30000); // Poll every 30 seconds
  }, [claimIds, onStatusUpdate]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('access_token');
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'}/claims/status?token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Subscribe to claim updates
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            claimIds,
          })
        );

        toast.success('Connected to real-time updates');
      };

      ws.onmessage = event => {
        try {
          const update: ClaimStatusUpdate = JSON.parse(event.data);

          setUpdates(prev => [update, ...prev]);
          onStatusUpdate?.(update);

          // Show toast notification
          toast.info(`Claim ${update.claimId} status: ${update.status}`, {
            description: update.message,
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = error => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        wsRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
            connect();
          }, reconnectInterval);
        } else {
          toast.error('Failed to connect to real-time updates. Using polling instead.');
          // Fallback to polling
          startPolling();
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
      startPolling();
    }
  }, [claimIds, onStatusUpdate, reconnectInterval, maxReconnectAttempts, startPolling]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    connectionStatus,
    updates,
    reconnect: connect,
    disconnect,
  };
}

export default useClaimStatusWebSocket;
