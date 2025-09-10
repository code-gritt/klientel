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

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  sendMessage: async (content, token) => {
    // add user message immediately
    set((state) => ({
      messages: [...state.messages, { role: 'user', content }],
    }));

    try {
      const response = await fetch('http://localhost:5000/graphql', {
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

      if (errors) {
        console.error(errors);
        set((state) => ({
          messages: [
            ...state.messages,
            { role: 'assistant', content: '⚠️ Error: ' + errors[0].message },
          ],
        }));
        return;
      }

      const aiResponse = data?.chatbot?.response || '⚠️ No response';
      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'assistant', content: aiResponse },
        ],
      }));
    } catch (err) {
      console.error(err);
      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'assistant', content: '⚠️ Failed to fetch AI response.' },
        ],
      }));
    }
  },
}));
