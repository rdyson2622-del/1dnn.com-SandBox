import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Calendar, AlertCircle, CheckCircle2, Clock, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const GOLD = '#D4AF37';

const MILESTONE_COLORS = {
  inspection: '#3b82f6',
  loan_approval: '#10b981',
  closing_date: '#f59e0b',
  moving_date: '#8b5cf6',
  release_of_contingencies: '#06b6d4',
  utility_activation: '#ec4899',
  other: '#6b7280'
};

const MILESTONE_LABELS = {
  initial_deposit: 'Initial Deposit',
  inspection: 'Home Inspection',
  inspection_contingency_release: 'Inspection Contingency Release',
  appraisal: 'Appraisal',
  loan_approval: 'Loan Approval',
  homeowners_insurance: 'Homeowners Insurance',
  final_walkthrough: 'Final Walkthrough',
  release_of_contingencies: 'Release of Contingencies',
  clear_to_close: 'Clear to Close',
  closing_date: 'Closing Date',
  funding: 'Funding',
  moving_date: 'Moving Date',
  utility_activation: 'Utility Activation',
  other: 'Other'
};

function daysUntil(dateStr) {
  const due = new Date(dateStr);
  const today = new Date();
  const diff = due - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

export default function EscrowTimeline({ clientId }) {
  const [uploading, setUploading] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: milestones = [] } = useQuery({
    queryKey: ['escrow-milestones', clientId],
    queryFn: () => appClient.asServiceRole.entities.EscrowMilestone.filter({ client_id: clientId }, '-due_date', 50),
    enabled: !!clientId
  });

  const handleUploadEscrow = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const result = await appClient.functions.invoke('parseEscrowInstructions', {
        client_id: clientId,
        escrow_text: text
      });
      
      if (result.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['escrow-milestones', clientId] });
        toast({ title: `✓ Extracted ${result.data.milestones_created} milestones from escrow` });
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  if (!milestones.length) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid rgba(212,175,55,0.25)` }}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5" style={{ color: GOLD }} />
          <h3 className="font-bold text-white">Escrow Timeline</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">No escrow milestones loaded yet.</p>
        <label className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold cursor-pointer"
          style={{ background: GOLD, color: '#000' }}>
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Escrow Instructions'}
          <input type="file" accept=".txt,.pdf" onChange={handleUploadEscrow} className="hidden" disabled={uploading} />
        </label>
      </div>
    );
  }

  const sorted = [...milestones].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const completed = sorted.filter(m => m.status === 'completed');
  const pending = sorted.filter(m => m.status !== 'completed');

  return (
    <div className="rounded-xl p-6" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid rgba(212,175,55,0.25)` }}>
      {/* Header + Upload */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" style={{ color: GOLD }} />
          <h3 className="font-bold text-white">Escrow Timeline</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: `rgba(${212},${175},${55},0.2)`, color: GOLD }}>
            {pending.length} pending · {completed.length} done
          </span>
        </div>
        <label className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
          style={{ background: `rgba(${212},${175},${55},0.15)`, border: `1px solid rgba(212,175,55,0.3)`, color: GOLD }}>
          <Upload className="w-3 h-3" />
          Update
          <input type="file" accept=".txt,.pdf" onChange={handleUploadEscrow} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {sorted.map(m => {
          const days = daysUntil(m.due_date);
          const isAtRisk = days <= 7 && days > 0;
          const isOverdue = days < 0;
          const isDone = m.status === 'completed';
          return (
            <div key={m.id} className="flex items-start gap-4 rounded-lg p-3" style={{ background: isDone ? 'rgba(16,185,129,0.1)' : isAtRisk ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)' }}>
              {/* Icon */}
              <div className="shrink-0 mt-1">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isOverdue ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : isAtRisk ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Clock className="w-5 h-5" style={{ color: MILESTONE_COLORS[m.milestone_type] || '#999' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-white">{m.milestone_name || MILESTONE_LABELS[m.milestone_type]}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-bold"
                    style={{
                      background: isDone ? 'rgba(16,185,129,0.2)' : isOverdue ? 'rgba(239,68,68,0.2)' : isAtRisk ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.1)',
                      color: isDone ? '#10b981' : isOverdue ? '#ef4444' : isAtRisk ? '#f59e0b' : '#fff'
                    }}>
                    {isDone ? '✓ Done' : isOverdue ? '⚠ Overdue' : isAtRisk ? `⚡ ${days}d left` : `${days}d`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(m.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {m.description && (
                  <p className="text-xs text-gray-300">{m.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}