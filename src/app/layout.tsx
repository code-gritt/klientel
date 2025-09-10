import { Footer, Navbar } from '@/components';
import { CommandPalette } from '@/components/command-palette';
import { SITE_CONFIG } from '@/config';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

const font = Inter({ subsets: ['latin'] });

export const metadata = SITE_CONFIG;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased max-w-full overflow-x-hidden',
          font.className
        )}
      >
        {children}
        <CommandPalette open={open} setOpen={setOpen} />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
