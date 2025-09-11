'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface EmailState {
  isLoading: boolean;
  error: string | null;
  sendEmail: (leadId: string, subject: string, body: string) => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useEmailStore = create<EmailState>((set) => ({
  isLoading: false,
  error: null,

  sendEmail: async (leadId: string, subject: string, body: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to send an email', isLoading: false });
      toast.error('Please log in to send an email');
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
            mutation SendEmail($input: EmailInput!) {
              sendEmail(input: $input) {
                success
              }
            }
          `,
          variables: { input: { leadId, subject, body } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0]?.message || 'Failed to send email');
      set({ isLoading: false });
      toast.success('Email sent');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
    }
  },
}));
