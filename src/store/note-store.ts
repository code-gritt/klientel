'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  createdAt: string;
}

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: (leadId: string) => Promise<void>;
  createNote: (leadId: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async (leadId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to view notes', isLoading: false });
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
            query Notes($leadId: ID!) {
              notes(leadId: $leadId) {
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
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to fetch notes');
      set({ notes: data?.notes || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createNote: async (leadId: string, content: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to create a note', isLoading: false });
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
            mutation CreateNote($leadId: ID!, $input: NoteInput!) {
              createNote(leadId: $leadId, input: $input) {
                note {
                  id
                  leadId
                  userId
                  content
                  createdAt
                }
              }
            }
          `,
          variables: { leadId, input: { content } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to create note');
      set((state) => ({
        notes: [...state.notes, data.createNote.note],
        isLoading: false,
      }));
      toast.success('Note created');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteNote: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to delete a note', isLoading: false });
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
            mutation DeleteNote($id: ID!) {
              deleteNote(id: $id) {
                success
              }
            }
          `,
          variables: { id },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to delete note');
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        isLoading: false,
      }));
      toast.success('Note deleted');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
