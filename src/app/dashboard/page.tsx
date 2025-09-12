'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, Navbar } from '@/components';
import Sidebar from '@/components/sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useActivityStore, Activity } from '@/store/activity-store';
import { useTeamStore } from '@/store/team-store';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Users } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activities, isLoading, fetchActivities } = useActivityStore();
  const {
    teams,
    members,
    fetchTeams,
    fetchMembers,
    inviteMember,
    isLoading: isTeamLoading,
  } = useTeamStore();

  const [teamId, setTeamId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

  // Fetch activities
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Fetch teams
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (teams.length > 0) {
      setTeamId(teams[0].id);
      fetchMembers(teams[0].id);
    }
  }, [teams, fetchMembers]);

  const handleInvite = async () => {
    try {
      await inviteMember(teamId, email, role);
      setEmail('');
      toast.success('Invitation sent');
      fetchMembers(teamId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Activities table setup
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
        <Container className="flex-1 p-4 md:p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6">
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

          {/* Team Members */}
          <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-4">
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            {teams.length === 0 ? (
              <p className="text-center text-muted-foreground">No teams yet</p>
            ) : isTeamLoading ? (
              <LoaderFour />
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Invite email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-border/80 bg-background/50 rounded-md px-3 py-2 text-foreground/80 focus:outline-none focus:border-primary"
                  >
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button onClick={handleInvite}>
                    <Users className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          {member.acceptedAt ? 'Accepted' : 'Pending'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}
