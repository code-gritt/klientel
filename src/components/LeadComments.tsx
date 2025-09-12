'use client';

import { useEffect, useState } from 'react';
import { useCommentStore } from '@/store/comment-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { LoaderFour } from './ui/loader';
import { useSocket } from '../hooks/use-socket';

interface LeadCommentsProps {
  leadId: string;
}

export default function LeadComments({ leadId }: LeadCommentsProps) {
  const { comments, isLoading, fetchComments, addComment } = useCommentStore();
  const [content, setContent] = useState('');
  const socket = useSocket();

  useEffect(() => {
    fetchComments(leadId);

    if (!socket) return;

    socket.emit('join_lead', { lead_id: leadId });
    socket.on('new_comment', (data: { lead_id: string; content: string }) => {
      addComment(data.lead_id, data.content);
      toast.success('New comment added in real-time');
    });

    return () => {
      socket.emit('leave_lead', { lead_id: leadId });
      socket.off('new_comment');
    };
  }, [fetchComments, addComment, socket, leadId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addComment(leadId, content);
      setContent('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return <LoaderFour />;
  }

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-4">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      <form onSubmit={handleAddComment} className="space-y-4 mb-6">
        <Input
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoaderFour /> : <Send className="w-4 h-4" />}
        </Button>
      </form>

      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground">No comments yet</p>
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
    </div>
  );
}
