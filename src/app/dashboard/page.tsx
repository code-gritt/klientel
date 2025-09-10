'use client';

import { Container, Navbar } from '@/components';
import Sidebar from '@/components/sidebar';
import { useAuthStore } from '@/store/auth-store';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <Container className="flex-1 py-6 md:pl-64">
          <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
          <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {user?.email || 'User'}
            </h2>
            <p className="text-muted-foreground">
              You have {user?.credits || 0} credits remaining. Start managing
              your leads or check your analytics.
            </p>
          </div>
        </Container>
      </div>
    </>
  );
}
