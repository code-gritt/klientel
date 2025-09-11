'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface PipelineMetrics {
  status: string;
  leadCount: number;
  conversionRate: number;
  avgTimeInStage: number;
}

interface PipelineState {
  metrics: PipelineMetrics[];
  isLoading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const usePipelineStore = create<PipelineState>((set) => ({
  metrics: [],
  isLoading: false,
  error: null,

  fetchMetrics: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to fetch metrics', isLoading: false });
      toast.error('Please log in to fetch metrics');
      return;
    }
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_URL, {
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
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to fetch metrics');

      set({
        metrics: data.pipelineMetrics,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
    }
  },
}));
