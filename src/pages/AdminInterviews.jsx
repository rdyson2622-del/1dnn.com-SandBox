import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const approvalColors = {
  pending_review: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function AdminInterviews() {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [notes, setNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => appClient.entities.Interview.list('-scheduled_date', 100),
  });

  const completeInterviewMutation = useMutation({
    mutationFn: async (id) => {
      const interview = interviews.find(i => i.id === id);
      await appClient.entities.Interview.update(id, {
        status: 'completed',
        interview_notes: notes,
        approval_status: 'pending_review'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview completed & marked for approval');
      setSelectedId(null);
      setNotes('');
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const user = await appClient.auth.me();
      await appClient.entities.Interview.update(id, {
        approval_status: 'approved',
        approved_by: user.email,
        approval_notes: approvalNotes,
        approval_date: new Date().toISOString(),
        gemini_session_scheduled: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Client approved! Gemini session unlocked.');
      setSelectedId(null);
      setApprovalNotes('');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const user = await appClient.auth.me();
      await appClient.entities.Interview.update(id, {
        approval_status: 'rejected',
        approved_by: user.email,
        approval_notes: approvalNotes,
        approval_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Client rejected. They will receive a notification.');
      setSelectedId(null);
      setApprovalNotes('');
    }
  });

  const filtered = interviews.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'pending_approval') return i.approval_status === 'pending_review';
    return i.status === filter;
  });

  const selectedInterview = interviews.find(i => i.id === selectedId);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Management</h1>
          <p className="text-muted-foreground">Schedule, conduct, and approve client interviews</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['pending', 'completed', 'pending_approval', 'approved', 'rejected', 'all'].map(status => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="whitespace-nowrap capitalize"
            >
              {status === 'pending_approval' ? 'Pending Approval' : status}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Interview list */}
          <div className="col-span-2 border rounded-lg overflow-hidden bg-card">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No interviews in this status
              </div>
            ) : (
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filtered.map(interview => (
                  <div
                    key={interview.id}
                    onClick={() => {
                      setSelectedId(interview.id);
                      setNotes(interview.interview_notes || '');
                      setApprovalNotes(interview.approval_notes || '');
                    }}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                      selectedId === interview.id ? 'bg-muted' : ''
                    }`}
                    style={{ borderLeftColor: '#D4AF37' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{interview.client_name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(interview.scheduled_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[interview.status]}>
                          {interview.status}
                        </Badge>
                        <Badge className={approvalColors[interview.approval_status]}>
                          {interview.approval_status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{interview.client_email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedInterview && (
            <div className="border rounded-lg p-6 bg-card h-fit">
              <h3 className="font-bold mb-1 text-lg">{selectedInterview.client_name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{selectedInterview.client_email}</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Scheduled
                  </label>
                  <p className="text-sm">{formatDate(selectedInterview.scheduled_date)}</p>
                </div>

                {selectedInterview.status === 'pending' && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-2">
                      Add Interview Notes
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Family dynamics, intent, engagement level, commitment signals..."
                      className="text-xs"
                      rows={3}
                    />
                    <Button
                      onClick={() => completeInterviewMutation.mutate(selectedInterview.id)}
                      disabled={completeInterviewMutation.isPending || !notes.trim()}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {completeInterviewMutation.isPending ? 'Saving...' : 'Mark Completed'}
                    </Button>
                  </div>
                )}

                {selectedInterview.status === 'completed' && selectedInterview.approval_status === 'pending_review' && (
                  <div>
                    <div className="bg-muted p-3 rounded mb-3">
                      <p className="text-xs font-semibold text-muted-foreground block mb-1">Interview Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedInterview.interview_notes}</p>
                    </div>

                    <label className="text-xs font-semibold text-muted-foreground block mb-2">
                      Approval Decision
                    </label>
                    <Textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Why approved or rejected..."
                      className="text-xs mb-2"
                      rows={2}
                    />

                    <div className="space-y-2">
                      <Button
                        onClick={() => approveMutation.mutate(selectedInterview.id)}
                        disabled={approveMutation.isPending || !approvalNotes.trim()}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => rejectMutation.mutate(selectedInterview.id)}
                        disabled={rejectMutation.isPending || !approvalNotes.trim()}
                        variant="destructive"
                        className="w-full"
                      >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedInterview.approval_status !== 'pending_review' && (
                  <div className="bg-muted p-3 rounded text-xs">
                    <p className="font-semibold mb-1">Decision: <span className="capitalize">{selectedInterview.approval_status}</span></p>
                    {selectedInterview.approved_by && (
                      <p className="text-muted-foreground">By: {selectedInterview.approved_by}</p>
                    )}
                    {selectedInterview.approval_notes && (
                      <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{selectedInterview.approval_notes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}