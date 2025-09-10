'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

interface LeadState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  createLead: (name: string, email: string, status?: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  isLoading: false,
  error: null,

  fetchLeads: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to view leads', isLoading: false });
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
              leads {
                id
                name
                email
                status
                createdAt
              }
            }
          `,
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to fetch leads');
      set({ leads: data?.leads || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createLead: async (name: string, email: string, status?: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to create a lead', isLoading: false });
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
            mutation CreateLead($input: LeadInput!) {
              createLead(input: $input) {
                lead {
                  id
                  name
                  email
                  status
                  createdAt
                }
              }
            }
          `,
          variables: { input: { name, email, status } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to create lead');
      set((state) => ({
        leads: [...state.leads, data.createLead.lead],
        isLoading: false,
      }));
      useAuthStore.setState((state) => ({
        user: state.user
          ? { ...state.user, credits: state.user.credits - 1 }
          : null,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteLead: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to delete a lead', isLoading: false });
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
            mutation DeleteLead($id: ID!) {
              deleteLead(id: $id) {
                success
              }
            }
          `,
          variables: { id },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to delete lead');
      set((state) => ({
        leads: state.leads.filter((lead) => lead.id !== id), // ✅ Fixed typo
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
