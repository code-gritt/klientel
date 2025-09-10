'use client';

import { useEffect, useMemo } from 'react';
import { Container, Navbar } from '@/components';
import Sidebar from '@/components/sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useActivityStore, Activity } from '@/store/activity-store';
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
import { LoaderFour } from '@/components/ui/loader';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activities, isLoading, fetchActivities } = useActivityStore();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const columns = useMemo<ColumnDef<Activity>[]>(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <span>{row.original.action}</span>,
      },
      {
        accessorKey: 'userId',
        header: 'User ID',
        cell: ({ row }) => <span>{row.original.userId}</span>,
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString('en-US', {
            hour12: true,
          }),
      },
    ],
    []
  );

  const table = useReactTable({
    data: activities,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <Container className="flex-1 p-4 md:p-6">
          {/* Welcome Section */}
          <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6 mb-6">
            <h1 className="text-3xl font-semibold mb-2">
              Welcome, {user?.email || 'User'}
            </h1>
            <p className="text-muted-foreground">
              You have {user?.credits || 0} credits remaining. Start managing
              your leads or check your analytics.
            </p>
          </div>

          {/* Activities Table */}
          <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>

            {isLoading ? (
              <LoaderFour />
            ) : activities.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No activities yet
              </p>
            ) : (
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
            )}
          </div>
        </Container>
      </div>
    </>
  );
}
