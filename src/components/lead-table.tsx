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
import { LoaderFour } from './ui/loader';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function LeadTable() {
  const { leads, isLoading, deleteLead, createLead, fetchLeads } =
    useLeadStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('New');

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alert('Edit feature coming soon!')}
            >
              <Pencil className="w-4 h-4" />
            </Button>
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
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Your Leads</h2>
      <form
        onSubmit={handleCreateLead}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
          required
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
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
      {isLoading ? (
        <LoaderFour />
      ) : !leads.length ? (
        <p className="text-center text-muted-foreground">No leads yet</p>
      ) : (
        <Table>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
