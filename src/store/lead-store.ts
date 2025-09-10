import { create } from 'zustand';
import { useAuthStore } from './auth-store';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string; // ✅ camelCase
}

interface LeadState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  createLead: (name: string, email: string, status?: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  isLoading: false,
  error: null,

  // ✅ Fetch all leads
  fetchLeads: async () => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('No token');
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_URL!, {
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

      if (errors && errors.length > 0) {
        console.error('GraphQL errors:', errors);
        throw new Error(errors[0]?.message || 'Unknown GraphQL error');
      }

      set({ leads: data?.leads || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // ✅ Create a new lead
  createLead: async (name: string, email: string, status?: string) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('No token');
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_URL!, {
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

      if (errors && errors.length > 0) {
        console.error('GraphQL errors:', errors);
        throw new Error(errors[0]?.message || 'Unknown GraphQL error');
      }

      set((state) => ({
        leads: [...state.leads, data?.createLead?.lead],
        isLoading: false,
      }));

      // Decrease credits for the logged-in user
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

  // ✅ Delete a lead
  deleteLead: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('No token');
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_URL!, {
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

      if (errors && errors.length > 0) {
        console.error('GraphQL errors:', errors);
        throw new Error(errors[0]?.message || 'Unknown GraphQL error');
      }

      set((state) => ({
        leads: state.leads.filter((lead) => lead.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
