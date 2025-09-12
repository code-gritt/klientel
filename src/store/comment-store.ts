'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;
  leadId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchComments: (leadId: string) => Promise<void>;
  addComment: (leadId: string, content: string) => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,
  error: null,

  fetchComments: async (leadId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    set({ isLoading: true });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query Comments($leadId: ID!) {
              comments(leadId: $leadId) {
                id
                leadId
                userId
                content
                createdAt
              }
            }
          `,
          variables: { leadId },
        }),
      });
      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);
      set({ comments: data.comments });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (leadId: string, content: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    set({ isLoading: true });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation AddComment($input: CommentInput!) {
              addComment(input: $input) {
                comment {
                  id
                  leadId
                  userId
                  content
                  createdAt
                }
              }
            }
          `,
          variables: { input: { leadId, content } },
        }),
      });
      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);
      set((state) => ({
        comments: [...state.comments, data.addComment.comment],
      }));
      toast.success('Comment added');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
