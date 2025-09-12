// src/hooks/use-socket.ts
'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';
import { DefaultEventsMap } from '@socket.io/component-emitter';

export function useSocket() {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const s = io('https://klientel-backend.onrender.com', {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('Socket connected', s.id);
    });

    s.on('disconnect', (reason) => {
      console.log('Socket disconnected', reason);
    });

    return () => {
      try {
        s.disconnect();
      } catch (err) {
        console.warn('Error while disconnecting socket', err);
      }
      setSocket(null);
    };
  }, [token]);

  return socket;
}
