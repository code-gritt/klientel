'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  tags: { id: string; name: string }[];
}

interface LeadState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  fetchLeads: (tagIds?: string[]) => Promise<void>;
  createLead: (
    name: string,
    email: string,
    status: string,
    tagIds?: string[]
  ) => Promise<void>;
  updateLead: (
    id: string,
    name: string,
    email: string,
    status: string,
    tagIds?: string[]
  ) => Promise<void>;
  updateLeadStatus: (id: string, status: string) => Promise<void>; // ✅ added back
  deleteLead: (id: string) => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  isLoading: false,
  error: null,

  fetchLeads: async (tagIds = []) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to view leads', isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });

    try {
      // Build query conditionally
      const query = tagIds.length
        ? `
        query Leads($tagIds: [ID!]) {
          leadsByTags(tagIds: $tagIds) {
            id
            name
            email
            status
            createdAt
            tags {
              id
              name
            }
          }
        }
      `
        : `
        query Leads {
          leads {
            id
            name
            email
            status
            createdAt
            tags {
              id
              name
            }
          }
        }
      `;

      const variables = tagIds.length ? { tagIds } : {};

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to fetch leads');

      set({
        leads: tagIds.length ? data?.leadsByTags || [] : data?.leads || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createLead: async (
    name: string,
    email: string,
    status: string,
    tagIds: string[] = []
  ) => {
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
                  tags {
                    id
                    name
                  }
                }
              }
            }
          `,
          variables: { input: { name, email, status, tagIds } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to create lead');
      set((state) => ({
        leads: [...state.leads, data.createLead.lead],
        isLoading: false,
      }));
      toast.success('Lead created');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateLead: async (
    id: string,
    name: string,
    email: string,
    status: string,
    tagIds: string[] = []
  ) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to update a lead', isLoading: false });
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
            mutation UpdateLead($id: ID!, $input: LeadInput!) {
              updateLead(id: $id, input: $input) {
                lead {
                  id
                  name
                  email
                  status
                  createdAt
                  tags {
                    id
                    name
                  }
                }
              }
            }
          `,
          variables: { id, input: { name, email, status, tagIds } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to update lead');
      set((state) => ({
        leads: state.leads.map((lead) =>
          lead.id === id ? data.updateLead.lead : lead
        ),
        isLoading: false,
      }));
      toast.success('Lead updated');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // ✅ added back for PipelineBoard compatibility
  updateLeadStatus: async (id: string, status: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to update a lead', isLoading: false });
      return;
    }

    try {
      const lead = useLeadStore.getState().leads.find((l) => l.id === id);
      if (!lead) throw new Error('Lead not found');

      // Reuse updateLead, preserve name/email/tags
      await useLeadStore.getState().updateLead(
        id,
        lead.name,
        lead.email,
        status,
        lead.tags.map((t) => t.id)
      );
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
        leads: state.leads.filter((lead) => lead.id !== id),
        isLoading: false,
      }));
      toast.success('Lead deleted');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
