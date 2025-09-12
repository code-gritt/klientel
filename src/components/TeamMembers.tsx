'use client';

import { useEffect } from 'react';
import { useTeamStore } from '@/store/team-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Users } from 'lucide-react';
import { LoaderFour } from './ui/loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export default function TeamMembers() {
  const { teams, members, fetchTeams, fetchMembers, inviteMember, isLoading } =
    useTeamStore();
  const [teamId, setTeamId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

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

  if (isLoading) {
    return <LoaderFour />;
  }

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-4">
      <h3 className="text-lg font-semibold mb-4">Team Members</h3>
      {teams.length === 0 ? (
        <p className="text-center text-muted-foreground">No teams yet</p>
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
  );
}
