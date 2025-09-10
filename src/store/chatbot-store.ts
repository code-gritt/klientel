'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatbotState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (content: string) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to use the chatbot', isLoading: false });
      toast.error('Please log in to use the chatbot');
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
            mutation Chatbot($input: ChatbotInput!) {
              chatbot(input: $input) {
                response
              }
            }
          `,
          variables: { input: { query: content } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(errors[0]?.message || 'Failed to get response');

      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: new Date().toLocaleString(),
      };
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.chatbot.response,
        isUser: false,
        timestamp: new Date().toLocaleString(),
      };

      set((state) => ({
        messages: [...state.messages, newMessage, aiMessage],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}));
