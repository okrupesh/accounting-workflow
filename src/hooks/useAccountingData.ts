'use client';

import { useState, useEffect, useCallback } from 'react';
import { AccountingEntry, DashboardStats } from '@/types';

interface DashboardData {
  entries: AccountingEntry[];
  stats: DashboardStats;
  lastUpdated: string;
}

export function useAccountingData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/data', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up SSE connection for real-time updates
    const eventSource = new EventSource('/api/watch');
    
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'update') {
        console.log('CSV file updated, refreshing data...');
        fetchData();
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error, will retry...');
      // The browser will automatically try to reconnect
    };

    // Also poll every 30 seconds as a fallback
    const pollInterval = setInterval(fetchData, 30000);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
