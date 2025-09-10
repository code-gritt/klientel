'use client';

import { useState } from 'react';
import { Container } from '@/components';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Users, BarChart2, Workflow } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Pipelines', href: '/dashboard/pipelines', icon: Workflow },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  ];

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-16 left-4 z-50 p-2 rounded-full bg-primary/20 text-primary"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <div
        className={cn(
          'fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-background/50 backdrop-blur-lg border-r border-border/80 transition-transform duration-300 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:static md:w-64'
        )}
      >
        <Container className="py-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-foreground/80 hover:bg-primary/10 hover:text-primary rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </Container>
      </div>
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
