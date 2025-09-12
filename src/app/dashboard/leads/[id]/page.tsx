'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/store/lead-store';
import { useNoteStore } from '@/store/note-store';
import { useEmailStore } from '@/store/email-store';
import { useTagStore } from '@/store/tag-store';
import { useCommentStore } from '@/store/comment-store';
import { useActivityStore } from '@/store/activity-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { LoaderFour } from '@/components/ui/loader';
import { useSocket } from '../../../../hooks/use-socket';

export default function LeadDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { leads, isLoading: leadsLoading, fetchLeads } = useLeadStore();
  const {
    notes,
    isLoading: notesLoading,
    fetchNotes,
    createNote,
    deleteNote,
  } = useNoteStore();
  const { tags, isLoading: tagsLoading, fetchTags } = useTagStore();
  const { sendEmail, isLoading: emailLoading } = useEmailStore();
  const {
    activities,
    isLoading: activitiesLoading,
    fetchActivities,
  } = useActivityStore();
  const {
    comments,
    isLoading: commentsLoading,
    fetchComments,
    addComment,
  } = useCommentStore();

  const socket = useSocket();

  const [noteContent, setNoteContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [openEmailDialog, setOpenEmailDialog] = useState(false);

  const lead = leads.find((lead) => lead.id === params.id);

  useEffect(() => {
    fetchLeads();
    fetchNotes(params.id);
    fetchTags();
    fetchActivities();
    fetchComments(params.id);

    if (!socket) return;

    socket.emit('join_lead', { lead_id: params.id });
    socket.on('new_comment', (data: { lead_id: string; content: string }) => {
      addComment(data.lead_id, data.content);
      toast.success('New comment added in real-time');
    });

    return () => {
      socket.emit('leave_lead', { lead_id: params.id });
      socket.off('new_comment');
    };
  }, [
    fetchLeads,
    fetchNotes,
    fetchTags,
    fetchActivities,
    fetchComments,
    addComment,
    socket,
    params.id,
  ]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNote(params.id, noteContent);
      setNoteContent('');
      toast.success('Note added');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendEmail(params.id, subject, body);
      setSubject('');
      setBody('');
      setOpenEmailDialog(false);
      fetchActivities();
      toast.success('Email sent');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addComment(params.id, commentContent);
      setCommentContent('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (
    leadsLoading ||
    notesLoading ||
    tagsLoading ||
    activitiesLoading ||
    commentsLoading
  ) {
    return <LoaderFour />;
  }

  if (!lead) {
    return <p className="text-center text-muted-foreground">Lead not found</p>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/leads')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Leads
      </Button>

      <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6">
        <h2 className="text-2xl font-semibold mb-4">{lead.name}</h2>
        <p className="text-muted-foreground mb-2">Email: {lead.email}</p>
        <p className="text-muted-foreground mb-2">Status: {lead.status}</p>

        <div className="mb-4">
          <span className="text-muted-foreground">Tags: </span>
          {lead.tags.length ? (
            lead.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-primary/80 text-foreground/80 text-xs px-2 py-1 rounded-full mr-1"
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">No tags</span>
          )}
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="bg-background/50 border-border/80">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <form onSubmit={handleCreateNote} className="space-y-4 mb-6">
              <Textarea
                placeholder="Add a note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Button type="submit" disabled={notesLoading}>
                {notesLoading ? <LoaderFour /> : 'Add Note'}
              </Button>
            </form>

            {notes.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>{note.content}</TableCell>
                      <TableCell>
                        {new Date(note.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteNote(note.id);
                              toast.success('Note deleted');
                            } catch (err: any) {
                              toast.error(err.message);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">No notes yet</p>
            )}
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails">
            <Dialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
              <DialogTrigger asChild>
                <Button className="mb-4">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Email to {lead.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSendEmail} className="space-y-4 mt-2">
                  <Input
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                  <Textarea
                    placeholder="Email body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button type="submit" disabled={emailLoading}>
                      {emailLoading ? <LoaderFour /> : 'Send'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpenEmailDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {activities.filter((a) => a.action.includes('Sent email'))
              .length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities
                    .filter((a) => a.action.includes('Sent email'))
                    .map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          {a.action.split(': ')[1] || 'No subject'}
                        </TableCell>
                        <TableCell>
                          {new Date(a.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">
                No emails sent yet
              </p>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <form onSubmit={handleAddComment} className="space-y-4 mb-6">
              <Input
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <Button type="submit" disabled={commentsLoading}>
                {commentsLoading ? (
                  <LoaderFour />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No comments yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>{comment.content}</TableCell>
                      <TableCell>
                        {new Date(comment.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
