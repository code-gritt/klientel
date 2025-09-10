'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { useLeadStore } from '@/store/lead-store';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { LoaderFour } from './ui/loader';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function PipelineBoard() {
  const { leads, isLoading, fetchLeads, updateLead, updateLeadStatus } =
    useLeadStore();
  const [editLead, setEditLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const statuses = ['New', 'Contacted', 'Qualified', 'Closed'];

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    try {
      await updateLeadStatus(draggableId, newStatus);
      toast.success('Lead status updated');
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
        editLead.status
      );
      toast.success('Lead updated');
      setEditLead(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <LoaderFour />;
  if (!leads.length)
    return <p className="text-center text-muted-foreground">No leads yet</p>;

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Pipeline</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  className="bg-background/80 border border-border/80 rounded-md p-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {status}
                  </h3>
                  <div className="space-y-2 min-h-[100px]">
                    {leads
                      .filter((lead) => lead.status === status)
                      .map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="bg-background border border-border/80 rounded-md p-3 flex justify-between items-center"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {lead.email}
                                </p>
                              </div>
                              <Dialog
                                open={editLead?.id === lead.id}
                                onOpenChange={(open) =>
                                  !open && setEditLead(null)
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditLead(lead)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-background/50 backdrop-blur-lg border border-border/80">
                                  <DialogHeader>
                                    <DialogTitle>Edit Lead</DialogTitle>
                                  </DialogHeader>
                                  <form
                                    onSubmit={handleUpdateLead}
                                    className="space-y-4 mt-2"
                                  >
                                    <Input
                                      placeholder="Name"
                                      value={editLead?.name || ''}
                                      onChange={(e) =>
                                        setEditLead((prev) =>
                                          prev
                                            ? { ...prev, name: e.target.value }
                                            : null
                                        )
                                      }
                                      className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
                                      required
                                    />
                                    <Input
                                      placeholder="Email"
                                      type="email"
                                      value={editLead?.email || ''}
                                      onChange={(e) =>
                                        setEditLead((prev) =>
                                          prev
                                            ? { ...prev, email: e.target.value }
                                            : null
                                        )
                                      }
                                      className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
                                      required
                                    />
                                    <select
                                      value={editLead?.status || 'New'}
                                      onChange={(e) =>
                                        setEditLead((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                status: e.target.value,
                                              }
                                            : null
                                        )
                                      }
                                      className="border border-border/80 bg-background/50 rounded-md px-3 py-2 text-foreground/80 focus:outline-none focus:border-primary w-full"
                                    >
                                      <option value="New">New</option>
                                      <option value="Contacted">
                                        Contacted
                                      </option>
                                      <option value="Qualified">
                                        Qualified
                                      </option>
                                      <option value="Closed">Closed</option>
                                    </select>
                                    <div className="flex justify-end gap-2 mt-2">
                                      <Button
                                        type="submit"
                                        disabled={isLoading}
                                      >
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
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
