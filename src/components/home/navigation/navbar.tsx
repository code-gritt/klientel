'use client';

import { useEffect } from 'react';
import { Container, Icons } from '@/components';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { LogOut, User } from 'lucide-react';
import { LoaderFour } from '@/components/ui/loader';

export default function Navbar() {
  const { user, token, logout, fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="px-4 h-14 sticky top-0 inset-x-0 w-full bg-background/40 backdrop-blur-lg border-b border-border z-50">
      <Container reverse>
        <div className="flex items-center justify-between h-full mx-auto md:max-w-screen-xl">
          <div className="flex items-start">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="w-8 h-8" />
              <span className="text-lg font-medium">Klientel</span>
            </Link>
          </div>
          <nav className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center justify-center gap-8">
              <Link href="#" className="hover:text-foreground/80 text-sm">
                Pricing
              </Link>
              <Link href="#" className="hover:text-foreground/80 text-sm">
                About
              </Link>
              <Link href="#" className="hover:text-foreground/80 text-sm">
                Features
              </Link>
              <Link href="#" className="hover:text-foreground/80 text-sm">
                Blog
              </Link>
            </ul>
          </nav>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <LoaderFour />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({ size: 'sm', variant: 'ghost' })}
                >
                  Dashboard
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user.credits} Credits
                </span>
                <button
                  onClick={logout}
                  className={buttonVariants({ size: 'sm', variant: 'ghost' })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                  {getInitials(user.email)}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={buttonVariants({ size: 'sm', variant: 'ghost' })}
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className={buttonVariants({
                    size: 'sm',
                    className: 'hidden md:flex',
                  })}
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
