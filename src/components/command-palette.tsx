'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/store/lead-store';
import { useNoteStore } from '@/store/note-store';
import { Search, Home, BarChart2, FolderKanban } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter();
  const { leads, fetchLeads, isLoading: leadsLoading } = useLeadStore();
  const { notes, fetchNotes, isLoading: notesLoading } = useNoteStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Debounce search for notes to avoid excessive API calls
  const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const loadNotes = useCallback(
    debounce((leadId: string) => {
      fetchNotes(leadId);
    }, 300),
    [fetchNotes]
  );

  useEffect(() => {
    if (search && leads.length > 0) {
      const lead = leads.find(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.email.toLowerCase().includes(search.toLowerCase())
      );
      if (lead) {
        loadNotes(lead.id);
      }
    }
  }, [search, leads, loadNotes]);

  const handleSelect = (action: () => void) => {
    action();
    setOpen(false);
    setSearch('');
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-lg border border-border/80 rounded-lg max-w-lg w-full mx-4"
    >
      <Command.Input
        placeholder="Search leads, notes, or navigate..."
        value={search}
        onValueChange={setSearch}
        className="w-full bg-transparent border-b border-border/80 px-4 py-3 text-foreground/80 focus:outline-none"
      />
      <Command.List className="max-h-[300px] overflow-y-auto w-full">
        {leadsLoading || notesLoading ? (
          <Command.Empty>Loading...</Command.Empty>
        ) : (
          <>
            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => handleSelect(() => router.push('/dashboard'))}
                className="flex items-center gap-2 p-2 hover:bg-accent/50 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  handleSelect(() => router.push('/dashboard/pipelines'))
                }
                className="flex items-center gap-2 p-2 hover:bg-accent/50 cursor-pointer"
              >
                <FolderKanban className="w-4 h-4" />
                Pipelines
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  handleSelect(() => router.push('/dashboard/analytics'))
                }
                className="flex items-center gap-2 p-2 hover:bg-accent/50 cursor-pointer"
              >
                <BarChart2 className="w-4 h-4" />
                Analytics
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Leads">
              {leads
                .filter(
                  (lead) =>
                    lead.name.toLowerCase().includes(search.toLowerCase()) ||
                    lead.email.toLowerCase().includes(search.toLowerCase())
                )
                .map((lead) => (
                  <Command.Item
                    key={lead.id}
                    onSelect={() =>
                      handleSelect(() =>
                        router.push(`/dashboard/leads/${lead.id}`)
                      )
                    }
                    className="flex items-center gap-2 p-2 hover:bg-accent/50 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    {lead.name} ({lead.email})
                  </Command.Item>
                ))}
            </Command.Group>
            <Command.Group heading="Notes">
              {notes
                .filter((note) =>
                  note.content.toLowerCase().includes(search.toLowerCase())
                )
                .map((note) => (
                  <Command.Item
                    key={note.id}
                    onSelect={() =>
                      handleSelect(() =>
                        router.push(`/dashboard/leads/${note.lead_id}`)
                      )
                    }
                    className="flex items-center gap-2 p-2 hover:bg-accent/50 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    {note.content} (Lead ID: {note.lead_id})
                  </Command.Item>
                ))}
            </Command.Group>
            {search &&
              !leads.some(
                (lead) =>
                  lead.name.toLowerCase().includes(search.toLowerCase()) ||
                  lead.email.toLowerCase().includes(search.toLowerCase())
              ) &&
              !notes.some((note) =>
                note.content.toLowerCase().includes(search.toLowerCase())
              ) && <Command.Empty>No results found</Command.Empty>}
          </>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
