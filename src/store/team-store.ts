'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';
import { ReactNode } from 'react';

interface Team {
  id: string;
  name: string;
  createdAt: string;
}

interface TeamMember {
  [x: string]: ReactNode;
  id: string;
  teamId: string;
  userId: string;
  role: string;
  invitedAt: string;
  acceptedAt: string | null;
}

interface TeamState {
  teams: Team[];
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  inviteMember: (teamId: string, email: string, role: string) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  fetchMembers: (teamId: string) => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  members: [],
  isLoading: false,
  error: null,

  fetchTeams: async () => {
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
            query {
              teams {
                id
                name
                createdAt
              }
            }
          `,
        }),
      });
      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);
      set({ teams: data.teams });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  createTeam: async (name: string) => {
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
            mutation CreateTeam($input: TeamInput!) {
              createTeam(input: $input) {
                team {
                  id
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
      if (errors) throw new Error(errors[0].message);
      set((state) => ({ teams: [...state.teams, data.createTeam.team] }));
      toast.success('Team created');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  inviteMember: async (teamId: string, email: string, role: string) => {
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
            mutation InviteMember($input: InviteMemberInput!) {
              inviteMember(input: $input) {
                member {
                  id
                  teamId
                  userId
                  role
                  invitedAt
                  acceptedAt
                }
              }
            }
          `,
          variables: { input: { team_id: teamId, email, role } },
        }),
      });
      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);
      toast.success('Invitation sent');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  acceptInvite: async (inviteId: string) => {
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
            mutation AcceptInvite($input: AcceptInviteInput!) {
              acceptInvite(input: $input) {
                success
              }
            }
          `,
          variables: { input: { invite_id: inviteId } },
        }),
      });
      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);
      toast.success('Invitation accepted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMembers: async (teamId: string) => {
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
            query TeamMembers($teamId: ID!) {
              teamMembers(teamId: $teamId) {
                id
                teamId
                userId
                role
                invitedAt
                acceptedAt
              }
            }
          `,
          variables: { teamId },
        }),
      });
      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);
      set({ members: data.teamMembers });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
