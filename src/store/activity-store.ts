'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';

export interface Activity {
  id: string;
  userId: string; // camelCase
  action: string;
  createdAt: string;
}

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  isLoading: false,
  error: null,

  fetchActivities: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to view activities', isLoading: false });
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
              activities(limit: 10) {
                id
                userId
                action
                createdAt
              }
            }
          `,
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to fetch activities');

      set({ activities: data.activities || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
