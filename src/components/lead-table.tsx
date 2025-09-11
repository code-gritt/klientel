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
import { useTagStore } from '@/store/tag-store';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Tag as TagIcon } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { LoaderFour } from './ui/loader';
import { MultiSelect } from './ui/multi-select';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  tags: { id: string; name: string }[];
}

export default function LeadTable() {
  const {
    leads,
    isLoading: leadsLoading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  } = useLeadStore();
  const { tags, isLoading: tagsLoading, fetchTags, createTag } = useTagStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('New');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);

  useEffect(() => {
    fetchLeads(filterTagIds);
    fetchTags();
  }, [fetchLeads, fetchTags, filterTagIds]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(name, email, status, selectedTagIds);
      setName('');
      setEmail('');
      setStatus('New');
      setSelectedTagIds([]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLead) return;
    try {
      await updateLead(
        editLead.id,
        editLead.name,
        editLead.email,
        editLead.status,
        selectedTagIds
      );
      setEditLead(null);
      setSelectedTagIds([]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      await createTag(newTag);
      setNewTag('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/dashboard/leads/${row.original.id}`}
            className="text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'status', header: 'Status' },
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-primary/80 text-foreground/80 text-xs px-2 py-1 rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {/* Edit Lead */}
            <Dialog
              open={editLead?.id === row.original.id}
              onOpenChange={(open) => {
                if (!open) {
                  setEditLead(null);
                  setSelectedTagIds([]);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditLead(row.original);
                    setSelectedTagIds(row.original.tags.map((tag) => tag.id));
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/70 backdrop-blur-lg border border-border/80 rounded-xl">
                <DialogHeader>
                  <DialogTitle>Edit Lead</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateLead} className="space-y-4 mt-2">
                  <Input
                    placeholder="Name"
                    value={editLead?.name || ''}
                    onChange={(e) =>
                      setEditLead((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    required
                    className="rounded-md border px-3 py-2 w-full"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={editLead?.email || ''}
                    onChange={(e) =>
                      setEditLead((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                    required
                    className="rounded-md border px-3 py-2 w-full"
                  />
                  <select
                    value={editLead?.status || 'New'}
                    onChange={(e) =>
                      setEditLead((prev) =>
                        prev ? { ...prev, status: e.target.value } : null
                      )
                    }
                    className="border border-border/80 bg-background/50 rounded-md px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary w-full"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <MultiSelect
                    value={selectedTagIds}
                    onChange={setSelectedTagIds}
                    options={tags}
                    placeholder="Select tags"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      type="submit"
                      disabled={leadsLoading || tagsLoading}
                    >
                      {leadsLoading || tagsLoading ? <LoaderFour /> : 'Save'}
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

            {/* Delete Lead */}
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
    [deleteLead, leadsLoading, tags, tagsLoading, editLead]
  );

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-xl border border-border/80 p-4 sm:p-6 mt-6 w-full">
      {/* Create Tag */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create Tag</h3>
        <form onSubmit={handleCreateTag} className="flex gap-2">
          <Input
            placeholder="New tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="rounded-md border px-3 py-2"
          />
          <Button type="submit" disabled={tagsLoading}>
            <TagIcon className="w-4 h-4 mr-2" />
            Create Tag
          </Button>
        </form>
      </div>

      {/* Filter by Tags */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Filter by Tags</h3>
        <MultiSelect
          value={filterTagIds}
          onChange={setFilterTagIds}
          options={tags}
          placeholder="Select tags to filter"
        />
      </div>

      {/* Create Lead */}
      <form
        onSubmit={handleCreateLead}
        className="mb-6 grid grid-cols-1 sm:grid-cols-5 gap-4"
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-md border px-3 py-2 w-full col-span-1 sm:col-span-1"
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-md border px-3 py-2 w-full col-span-1 sm:col-span-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border/80 bg-background/50 rounded-md px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary w-full col-span-1"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Closed">Closed</option>
        </select>
        <MultiSelect
          value={selectedTagIds}
          onChange={setSelectedTagIds}
          options={tags}
          placeholder="Select tags"
        />
        <Button type="submit" disabled={leadsLoading || tagsLoading}>
          {leadsLoading || tagsLoading ? <LoaderFour /> : 'Add Lead'}
        </Button>
      </form>

      {/* Lead Table */}
      {leadsLoading || tagsLoading ? (
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
    </div>
  );
}
