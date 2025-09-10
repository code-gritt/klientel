'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLeadStore } from '@/store/lead-store';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoaderFour } from './ui/loader';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function LeadTable() {
  const { leads, isLoading, fetchLeads, createLead, updateLead, deleteLead } =
    useLeadStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('New');
  const [editLead, setEditLead] = useState<Lead | null>(null);

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Add new lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(name, email, status);
      toast.success('Lead created');
      setName('');
      setEmail('');
      setStatus('New');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Update existing lead
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLead) return;
    try {
      await updateLead(
        editLead.id,
        editLead.name,
        editLead.email,
        editLead.status
      );
      toast.success('Lead updated');
      setEditLead(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Table columns
  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'status', header: 'Status' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {/* Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditLead(row.original)}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await deleteLead(row.original.id);
                  toast.success('Lead deleted');
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteLead]
  );

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-4 sm:p-6 mt-6 w-full">
      {/* Add Lead Form */}
      <form
        onSubmit={handleCreateLead}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
          required
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border/80 bg-background/50 rounded-md px-3 py-2 text-foreground/80 focus:outline-none focus:border-primary"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Closed">Closed</option>
        </select>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoaderFour /> : 'Add Lead'}
        </Button>
      </form>

      {/* Leads Table */}
      {isLoading ? (
        <LoaderFour />
      ) : !leads.length ? (
        <p className="text-center text-muted-foreground">No leads yet</p>
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

      {/* Edit Lead Dialog */}
      {editLead && (
        <Dialog
          open={!!editLead}
          onOpenChange={(open) => !open && setEditLead(null)}
        >
          <DialogContent className="bg-background/50 backdrop-blur-lg border border-border/80">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateLead} className="space-y-4 mt-2">
              <Input
                placeholder="Name"
                value={editLead.name}
                onChange={(e) =>
                  setEditLead((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={editLead.email}
                onChange={(e) =>
                  setEditLead((prev) =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
                className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
                required
              />
              <select
                value={editLead.status}
                onChange={(e) =>
                  setEditLead((prev) =>
                    prev ? { ...prev, status: e.target.value } : null
                  )
                }
                className="border border-border/80 bg-background/50 rounded-md px-3 py-2 text-foreground/80 focus:outline-none focus:border-primary w-full"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <LoaderFour /> : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditLead(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
