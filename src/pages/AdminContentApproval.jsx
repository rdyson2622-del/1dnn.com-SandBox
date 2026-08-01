import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  edited: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  approved: <CheckCircle2 className="w-4 h-4" />,
  edited: <AlertCircle className="w-4 h-4" />,
  rejected: <AlertCircle className="w-4 h-4" />
};

export default function AdminContentApproval() {
  const [selectedId, setSelectedId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [filter, setFilter] = useState('pending');
  const queryClient = useQueryClient();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['contentApprovals'],
    queryFn: () => appClient.entities.ContentApproval.list('-created_date', 100),
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const approval = approvals.find(a => a.id === id);
      await appClient.entities.ContentApproval.update(id, {
        status: 'approved',
        reviewed_by: (await appClient.auth.me()).email,
        approved_content: approval.content,
        delivered_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentApprovals'] });
      toast.success('Content approved');
      setSelectedId(null);
    }
  });

  const editMutation = useMutation({
    mutationFn: async (id) => {
      const approval = approvals.find(a => a.id === id);
      await appClient.entities.ContentApproval.update(id, {
        status: 'edited',
        reviewed_by: (await appClient.auth.me()).email,
        expert_notes: editNotes,
        approved_content: editNotes,
        delivered_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentApprovals'] });
      toast.success('Content edited and marked for delivery');
      setSelectedId(null);
      setEditNotes('');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      await appClient.entities.ContentApproval.update(id, {
        status: 'rejected',
        reviewed_by: (await appClient.auth.me()).email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentApprovals'] });
      toast.success('Content rejected');
      setSelectedId(null);
    }
  });

  const filtered = approvals.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const selectedApproval = approvals.find(a => a.id === selectedId);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Daily Content Review</h1>
          <p className="text-muted-foreground">Expert-verify Charlie suggestions before client delivery</p>
        </div>

        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'edited', 'rejected', 'all'].map(status => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All' : status}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Queue list */}
          <div className="col-span-2 border rounded-lg overflow-hidden bg-card">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No items in this status
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map(approval => (
                  <div
                    key={approval.id}
                    onClick={() => {
                      setSelectedId(approval.id);
                      setEditNotes(approval.content);
                    }}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                      selectedId === approval.id ? 'bg-muted' : ''
                    }`}
                    style={{ borderLeftColor: statusColors[approval.status]?.split(' ')[0] || '#ccc' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{approval.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Client: <span className="font-mono">{approval.client_id?.substring(0, 8)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusIcons[approval.status]}
                        <Badge className={statusColors[approval.status]}>
                          {approval.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {approval.content_type?.replace('_', ' ')} • {approval.source?.replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedApproval && (
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="font-bold mb-4">{selectedApproval.title}</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Original Content</label>
                  <div className="mt-2 p-3 bg-muted rounded text-sm whitespace-pre-wrap">
                    {selectedApproval.content}
                  </div>
                </div>

                {selectedApproval.status === 'pending' && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Expert Edit</label>
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Approve as-is or edit for accuracy, tone, substance..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              {selectedApproval.status === 'pending' ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => approveMutation.mutate(selectedApproval.id)}
                    disabled={approveMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? 'Approving...' : 'Approve As-Is'}
                  </Button>
                  <Button
                    onClick={() => editMutation.mutate(selectedApproval.id)}
                    disabled={editMutation.isPending || !editNotes.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {editMutation.isPending ? 'Saving...' : 'Edit & Approve'}
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(selectedApproval.id)}
                    disabled={rejectMutation.isPending}
                    variant="destructive"
                    className="w-full"
                  >
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  <p>Status: <strong>{selectedApproval.status}</strong></p>
                  {selectedApproval.reviewed_by && (
                    <p>Reviewed by: <strong>{selectedApproval.reviewed_by}</strong></p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}