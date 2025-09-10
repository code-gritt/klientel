import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  credits: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

const API_URL = 'https://klientel-backend.onrender.com/graphql';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(API_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    user { id email credits }
                    access_token
                  }
                }
              `,
              variables: { input: { email, password } },
            }),
          });
          const { data, errors } = await response.json();
          if (errors) throw new Error(errors[0].message);
          set({
            user: data.login.user,
            token: data.login.access_token,
            isLoading: false,
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },
      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(API_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                mutation Register($input: RegisterInput!) {
                  register(input: $input) {
                    user { id email credits }
                    access_token
                  }
                }
              `,
              variables: { input: { email, password } },
            }),
          });
          const { data, errors } = await response.json();
          if (errors) throw new Error(errors[0].message);
          set({
            user: data.register.user,
            token: data.register.access_token,
            isLoading: false,
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },
      logout: () => set({ user: null, token: null, error: null }),
      fetchMe: async () => {
        const token = useAuthStore.getState().token;
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
                  me { id email credits }
                }
              `,
            }),
          });
          const { data, errors } = await response.json();
          if (errors) throw new Error(errors[0].message);
          set({ user: data.me, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
