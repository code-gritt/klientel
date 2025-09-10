'use client';

import { useState, useEffect } from 'react';
import { CommandPalette } from '@/components/command-palette';
import { Toaster } from 'react-hot-toast';
import { Chatbot } from './chatbot';

export default function ClientFeatures() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <CommandPalette open={open} setOpen={setOpen} />
      <Toaster position="top-right" />
      <Chatbot />
    </>
  );
}
