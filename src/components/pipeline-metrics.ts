'use client';

import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';

interface PipelineMetric {
  status: string;
  leadCount: number;
  conversionRate: number;
  avgTimeInStage: number;
}

export function usePipelineMetrics() {
  const { token } = useAuthStore();
  const [metrics, setMetrics] = useState<PipelineMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!token) {
      setError('Please log in to view metrics');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL ||
          'https://klientel-backend.onrender.com/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
            query {
              pipelineMetrics {
                status
                leadCount
                conversionRate
                avgTimeInStage
              }
            }
          `,
          }),
        }
      );

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(
          errors[0]?.message || 'Failed to fetch pipeline metrics'
        );
      setMetrics(data?.pipelineMetrics || []);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  return { metrics, isLoading, error };
}
