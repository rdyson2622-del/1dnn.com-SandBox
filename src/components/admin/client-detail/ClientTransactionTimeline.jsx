import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Plus, Download, Flag, CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';

const CATEGORIES = [
  { id: 'intake',       label: 'Initial Intake',      color: '#6366f1' },
  { id: 'consultation', label: 'Consultation',         color: '#8b5cf6' },
  { id: 'agent',        label: 'Agent Selection',      color: '#D4AF37' },
  { id: 'search',       label: 'Property Search',      color: '#0ea5e9' },
  { id: 'offer',        label: 'Offer / Negotiation',  color: '#f59e0b' },
  { id: 'escrow',       label: 'Escrow Opened',        color: '#10b981' },
  { id: 'title',        label: 'Title',                color: '#14b8a6' },
  { id: 'inspection',   label: 'Inspection',           color: '#f97316' },
  { id: 'financing',    label: 'Financing / Loan',     color: '#ec4899' },
  { id: 'closing',      label: 'Closing',              color: '#22c55e' },
  { id: 'post_close',   label: 'Post-Close',           color: '#84cc16' },
];

const STATUS_ICON = {
  completed:   <CheckCircle2 className="w-4 h-4 text-green-500" />,
  in_progress: <Clock className="w-4 h-4 text-blue-400" />,
  pending:     <Circle className="w-4 h-4 text-gray-400" />,
  overdue:     <AlertTriangle className="w-4 h-4 text-red-500" />,
  flagged:     <Flag className="w-4 h-4 text-amber-500" />,
};

const BLANK = {
  category: 'intake', title: '', notes: '',
  parties_involved: '', is_critical: false,
  deadline_date: '', completed_date: new Date().toISOString().slice(0, 10),
  status: 'completed', logged_by: '',
};

export default function ClientTransactionTimeline({ client }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [exporting, setExporting] = useState(false);

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones', client.id],
    queryFn: () => appClient.entities.TransactionMilestone.filter({ client_id: client.id }, 'created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.TransactionMilestone.create(data),
    onSuccess: () => { qc.invalidateQueries(['milestones', client.id]); setShowForm(false); setForm(BLANK); },
  });

  const handleSave = () => {
    createMutation.mutate({
      ...form,
      client_id: client.id,
      parties_involved: form.parties_involved ? form.parties_involved.split(',').map(s => s.trim()) : [],
    });
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await appClient.functions.invoke('generateTransactionPDF', {
        client_id: client.id,
        client_name: client.full_name,
        destination_city: client.destination_city,
        milestones,
      });
      if (res.data?.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
      }
    } finally {
      setExporting(false);
    }
  };

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: milestones.filter(m => m.category === cat.id),
  })).filter(cat => cat.items.length > 0 || showForm);

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-4 border-slate-200 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border p-4 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div>
          <h2 className="font-bold text-base" style={{ color: '#000' }}>Transaction Timeline</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>
            Complete audit trail from first contact through closing · {milestones.length} events logged
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} disabled={exporting || milestones.length === 0}
            size="sm" variant="outline" className="gap-1.5">
            <Download className="w-4 h-4" />
            {exporting ? 'Generating...' : 'Export PDF'}
          </Button>
          <Button onClick={() => setShowForm(v => !v)} size="sm"
            className="gap-1.5 font-bold" style={{ background: GOLD, color: '#000' }}>
            <Plus className="w-4 h-4" /> Log Event
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-5 space-y-3"
          style={{ background: '#fff', borderColor: `${GOLD}44` }}>
          <h3 className="font-bold text-sm" style={{ color: '#000' }}>Log New Event</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(0,0,0,0.55)' }}>Phase</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(0,0,0,0.55)' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(0,0,0,0.55)' }}>Event Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Referral agreement signed by agent" className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(0,0,0,0.55)' }}>Notes / Detail</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Outcome, what was agreed, who was present, any issues..." rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
              style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(0,0,0,0.55)' }}>Parties Involved (comma separated)</label>
              <input value={form.parties_involved} onChange={e => setForm(f => ({ ...f, parties_involved: e.target.value }))}
                placeholder="e.g. John Smith (agent), First American Title" className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(0,0,0,0.55)' }}>Date</label>
              <input type="date" value={form.completed_date} onChange={e => setForm(f => ({ ...f, completed_date: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'rgba(0,0,0,0.15)' }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_critical} onChange={e => setForm(f => ({ ...f, is_critical: e.target.checked }))} />
              <span style={{ color: 'rgba(0,0,0,0.7)' }}>Mark as critical/time-sensitive</span>
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={!form.title || createMutation.isPending}
              size="sm" className="font-bold" style={{ background: GOLD, color: '#000' }}>
              {createMutation.isPending ? 'Saving...' : 'Save Event'}
            </Button>
            <Button onClick={() => setShowForm(false)} size="sm" variant="outline">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {milestones.length === 0 && !showForm ? (
        <div className="rounded-2xl border p-10 text-center" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
          <p className="font-medium" style={{ color: 'rgba(0,0,0,0.4)' }}>No events logged yet</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.3)' }}>Start logging milestones to build the complete transaction audit trail.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: 'rgba(0,0,0,0.07)' }} />

            {milestones.map((m, i) => {
              const cat = CATEGORIES.find(c => c.id === m.category) || CATEGORIES[0];
              return (
                <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex gap-4 px-5 py-4 border-b last:border-b-0"
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  {/* Timeline dot */}
                  <div className="relative shrink-0 flex flex-col items-center" style={{ width: 24 }}>
                    <div className="w-4 h-4 rounded-full border-2 mt-1 z-10" style={{
                      background: '#fff',
                      borderColor: cat.color,
                    }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${cat.color}18`, color: cat.color }}>
                          {cat.label}
                        </span>
                        {m.is_critical && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">⚠ Critical</span>
                        )}
                        {STATUS_ICON[m.status]}
                      </div>
                      <span className="text-xs shrink-0" style={{ color: 'rgba(0,0,0,0.4)' }}>
                        {m.completed_date || new Date(m.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="font-semibold text-sm mt-1" style={{ color: '#111' }}>{m.title}</p>
                    {m.notes && <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(0,0,0,0.55)' }}>{m.notes}</p>}
                    {m.parties_involved?.length > 0 && (
                      <p className="text-xs mt-1.5" style={{ color: 'rgba(0,0,0,0.4)' }}>
                        👥 {m.parties_involved.join(' · ')}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}