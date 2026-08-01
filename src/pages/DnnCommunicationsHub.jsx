import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Send, Plus, Edit2, Trash2, Archive, Globe } from 'lucide-react';

const STATUS_STYLES = {
  draft:    { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' },
  ready:    { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Ready to Blast' },
  blasted:  { bg: 'bg-green-100', text: 'text-green-700', label: 'Blasted' },
  archived: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'Archived' },
};

const TIER_LABELS = { all: 'All Subscribers', tier1: 'Tier 1 (Free)', tier2: 'Tier 2 (Paid)', tier3: 'Tier 3 (VIP/Agent)' };

const BLANK = { title: '', subject: '', body: '', status: 'draft', target_tier: 'all', notes: '', tags: [] };

function CommForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || BLANK);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (form.id) {
      await appClient.entities.DnnCommunication.update(form.id, form);
    } else {
      await appClient.entities.DnnCommunication.create(form);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit Communication' : 'New Communication'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Internal Title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Founding Manifesto — Welcome to DNN" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Subject *</label>
            <Input value={form.subject} onChange={e => set('subject', e.target.value)} required placeholder="Subject line subscribers will see" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full h-9 border border-slate-200 rounded-md px-2 text-sm bg-white">
                <option value="draft">Draft</option>
                <option value="ready">Ready to Blast</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Target Tier</label>
              <select value={form.target_tier} onChange={e => set('target_tier', e.target.value)}
                className="w-full h-9 border border-slate-200 rounded-md px-2 text-sm bg-white">
                {Object.entries(TIER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Message Body *</label>
            <textarea
              value={form.body}
              onChange={e => set('body', e.target.value)}
              required
              rows={16}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
              placeholder="Full email body..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Internal Notes</label>
            <Input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes for the team" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.title || !form.subject || !form.body}>
              {saving ? 'Saving...' : form.id ? 'Update' : 'Save Communication'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BlastModal({ comm, onClose, onDone }) {
  const [blasting, setBlasting] = useState(false);
  const [result, setResult] = useState(null);

  const handleBlast = async () => {
    if (!confirm(`Send "${comm.subject}" to ${TIER_LABELS[comm.target_tier]}? This will send real emails.`)) return;
    setBlasting(true);
    try {
      const res = await appClient.functions.invoke('dnnBlastCommunication', {
        communication_id: comm.id,
        target_tier: comm.target_tier,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, error: err.message });
    }
    setBlasting(false);
  };

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Blast Communication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subject:</span><span className="font-medium text-slate-800 text-right max-w-[240px]">{comm.subject}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Target:</span><span className="font-semibold text-slate-800">{TIER_LABELS[comm.target_tier]}</span></div>
          </div>
          {!result && (
            <Button onClick={handleBlast} disabled={blasting} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {blasting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Now</>}
            </Button>
          )}
          {result && (
            <div className={`rounded-lg px-4 py-3 text-sm font-medium ${result.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {result.success ? `✓ Sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}.` : `✗ Error: ${result.error}`}
            </div>
          )}
          {result?.success && <Button variant="outline" onClick={onDone} className="w-full">Done</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DnnCommunicationsHub() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'new' | comm object
  const [blastTarget, setBlastTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: comms = [], isLoading } = useQuery({
    queryKey: ['dnnCommunications'],
    queryFn: () => appClient.entities.DnnCommunication.list('-created_date', 200),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['dnnCommunications'] });

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    await appClient.entities.DnnCommunication.delete(c.id);
    refresh();
  };

  const handleArchive = async (c) => {
    await appClient.entities.DnnCommunication.update(c.id, { status: 'archived' });
    refresh();
  };

  const filtered = statusFilter === 'all' ? comms : comms.filter(c => c.status === statusFilter);

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Globe className="w-7 h-7 text-yellow-500" />
              DNN Communications Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1">Draft, store, and blast subscriber communications for the Dyson News Network.</p>
          </div>
          <Button onClick={() => setModal('new')} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4" /> New Communication
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'draft', 'ready', 'blasted', 'archived'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
              {s === 'all' ? 'All' : STATUS_STYLES[s]?.label}
              {s !== 'all' && <span className="ml-1.5 opacity-60">{comms.filter(c => c.status === s).length}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No communications yet. Click "New Communication" to create your first.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const ss = STATUS_STYLES[c.status] || STATUS_STYLES.draft;
              return (
                <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}>{ss.label}</span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{TIER_LABELS[c.target_tier] || 'All'}</span>
                        {c.blasted_at && <span className="text-xs text-slate-400">Sent {new Date(c.blasted_at).toLocaleDateString()}</span>}
                        {c.blast_count > 0 && <span className="text-xs text-green-600 font-semibold">→ {c.blast_count} recipients</span>}
                      </div>
                      <h2 className="font-bold text-slate-900 text-base mb-0.5">{c.title}</h2>
                      <p className="text-sm text-slate-500 mb-2 italic">Subject: {c.subject}</p>
                      <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">{c.body}</p>
                      {c.notes && <p className="text-xs text-slate-400 mt-2">📝 {c.notes}</p>}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {(c.status === 'ready' || c.status === 'draft') && (
                        <Button size="sm" onClick={() => setBlastTarget(c)}
                          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                          <Send className="w-3 h-3" /> Blast
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setModal(c)} className="gap-1.5 text-xs">
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                      {c.status !== 'archived' && (
                        <Button size="sm" variant="ghost" onClick={() => handleArchive(c)} className="gap-1.5 text-xs text-slate-400">
                          <Archive className="w-3 h-3" /> Archive
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(c)} className="gap-1.5 text-xs text-red-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <CommForm
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
      {blastTarget && (
        <BlastModal
          comm={blastTarget}
          onClose={() => setBlastTarget(null)}
          onDone={() => { setBlastTarget(null); refresh(); }}
        />
      )}
    </div>
  );
}