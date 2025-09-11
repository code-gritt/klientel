'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface Tag {
  id: string;
  user_id: string;
  name: string;
  createdAt: string;
}

interface TagState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  assignTagToLead: (leadId: string, tagId: string) => Promise<void>;
  removeTagFromLead: (leadId: string, tagId: string) => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to view tags', isLoading: false });
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
              tags {
                id
                userId
                name
                createdAt
              }
            }
          `,
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0]?.message || 'Failed to fetch tags');
      set({ tags: data?.tags || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createTag: async (name: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to create a tag', isLoading: false });
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
            mutation CreateTag($input: TagInput!) {
              createTag(input: $input) {
                tag {
                  id
                  userId
                  name
                  createdAt
                }
              }
            }
          `,
          variables: { input: { name } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0]?.message || 'Failed to create tag');
      set((state) => ({
        tags: [...state.tags, data.createTag.tag],
        isLoading: false,
      }));
      toast.success('Tag created');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
    }
  },

  deleteTag: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to delete a tag', isLoading: false });
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
            mutation DeleteTag($id: ID!) {
              deleteTag(id: $id) {
                success
              }
            }
          `,
          variables: { id },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0]?.message || 'Failed to delete tag');
      set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== id),
        isLoading: false,
      }));
      toast.success('Tag deleted');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
    }
  },

  assignTagToLead: async (leadId: string, tagId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to assign a tag', isLoading: false });
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
            mutation AssignTagToLead($leadId: ID!, $tagId: ID!) {
              assignTagToLead(leadId: $leadId, tagId: $tagId) {
                lead {
                  id
                  tags {
                    id
                    name
                  }
                }
              }
            }
          `,
          variables: { leadId, tagId },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0]?.message || 'Failed to assign tag');
      set({ isLoading: false });
      toast.success('Tag assigned');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
    }
  },

  removeTagFromLead: async (leadId: string, tagId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to remove a tag', isLoading: false });
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
            mutation RemoveTagFromLead($leadId: ID!, $tagId: ID!) {
              removeTagFromLead(leadId: $leadId, tagId: $tagId) {
                lead {
                  id
                  tags {
                    id
                    name
                  }
                }
              }
            }
          `,
          variables: { leadId, tagId },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0]?.message || 'Failed to remove tag');
      set({ isLoading: false });
      toast.success('Tag removed');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
    }
  },
}));
