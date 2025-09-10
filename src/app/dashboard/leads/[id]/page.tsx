'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Navbar } from '@/components';
import Sidebar from '@/components/sidebar';
import { useLeadStore } from '@/store/lead-store';
import { useNoteStore } from '@/store/note-store';
import { toast } from 'react-hot-toast';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoaderFour } from '@/components/ui/loader';

interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

interface LeadDetailsProps {
  params: { id: string };
}

export default function LeadDetails({ params }: LeadDetailsProps) {
  const { id } = params;
  const router = useRouter();
  const { leads, isLoading: leadsLoading, fetchLeads } = useLeadStore();
  const {
    notes,
    isLoading: notesLoading,
    fetchNotes,
    createNote,
    deleteNote,
  } = useNoteStore();
  const [noteContent, setNoteContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchNotes(id);
  }, [fetchLeads, fetchNotes, id]);

  const lead = leads.find((l) => l.id === id);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    try {
      await createNote(id, noteContent);
      setNoteContent('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return;
    try {
      await deleteNote(deleteNoteId);
      setDeleteNoteId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns = useMemo<ColumnDef<Note>[]>(
    () => [
      {
        accessorKey: 'content',
        header: 'Note',
        cell: ({ row }) => <span>{row.original.content}</span>,
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteNoteId(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: notes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (leadsLoading || notesLoading) return <LoaderFour />;
  if (!lead) {
    router.push('/dashboard/leads');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <Container className="flex-1 p-6 md:pl-64">
          <h1 className="text-3xl font-semibold mb-6">Lead Details</h1>
          <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{lead.name}</h2>
            <p className="text-muted-foreground">Email: {lead.email}</p>
            <p className="text-muted-foreground">Status: {lead.status}</p>
            <p className="text-muted-foreground">
              Created: {new Date(lead.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <form
              onSubmit={handleCreateNote}
              className="mb-6 flex flex-col sm:flex-row gap-4"
            >
              <Input
                placeholder="Add a note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="flex-1 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
                required
              />
              <Button type="submit" disabled={notesLoading}>
                {notesLoading ? <LoaderFour /> : 'Add Note'}
              </Button>
            </form>
            {notes.length === 0 ? (
              <p className="text-center text-muted-foreground">No notes yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <Dialog
            open={!!deleteNoteId}
            onOpenChange={() => setDeleteNoteId(null)}
          >
            <DialogContent className="bg-background/50 backdrop-blur-lg border border-border/80">
              <DialogHeader>
                <DialogTitle>Delete Note</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this note? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDeleteNoteId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteNote}
                  disabled={notesLoading}
                >
                  {notesLoading ? <LoaderFour /> : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Container>
      </div>
    </>
  );
}
