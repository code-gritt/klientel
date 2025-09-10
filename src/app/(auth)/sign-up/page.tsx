'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { BorderBeam } from '@/components/ui/border-beam';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign up');
    }
  };

  return (
    <Container className="flex items-center justify-center py-20">
      <div className="relative max-w-md w-full bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6 shadow-3xl">
        <BorderBeam
          size={200}
          duration={12}
          delay={9}
          className="pointer-events-none"
        />

        <h2 className="text-2xl font-semibold text-center">
          Sign Up for Klientel
        </h2>
        <p className="text-muted-foreground text-center mt-2">
          Start with 50 free credits!
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader /> : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <a href="/sign-in" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </Container>
  );
}
