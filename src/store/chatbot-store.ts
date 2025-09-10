import toast from 'react-hot-toast';
import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  sendMessage: (content: string, token: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  sendMessage: async (content: string, token: string) => {
    if (!token) {
      toast.error('Please log in to use the chatbot');
      return;
    }

    try {
      const response = await fetch(
        'https://klientel-backend.onrender.com/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              mutation Chatbot($input: ChatbotInput!) {
                chatbot(input: $input) {
                  response   # ✅ string only
                }
              }
            `,
            variables: { input: { query: content } },
          }),
        }
      );

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0]?.message);

      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'user', content },
          { role: 'assistant', content: data.chatbot.response }, // ✅ now correct
        ],
      }));
    } catch (err: any) {
      toast.error(err.message);
    }
  },
}));
