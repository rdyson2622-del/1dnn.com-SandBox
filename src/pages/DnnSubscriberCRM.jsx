import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Upload, Star, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const TIERS = {
  tier1: { label: 'Tier 1 — Free', color: 'bg-slate-700 text-slate-200', dot: 'bg-slate-400' },
  tier2: { label: 'Tier 2 — Paid', color: 'bg-blue-900 text-blue-200', dot: 'bg-blue-400' },
  tier3: { label: 'Tier 3 — VIP/Agent', color: 'bg-yellow-900 text-yellow-200', dot: 'bg-yellow-400' },
};

export default function DnnSubscriberCRM() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [editingSub, setEditingSub] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['dnnSubscribers'],
    queryFn: () => appClient.entities.DnnSubscriber.list('-created_date', 5000),
  });

  const filtered = useMemo(() => {
    return subscribers.filter(s => {
      const matchTier = tierFilter === 'all' || s.tier === tierFilter;
      const matchSearch = !search ||
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.source?.toLowerCase().includes(search.toLowerCase());
      return matchTier && matchSearch;
    });
  }, [subscribers, tierFilter, search]);

  const stats = useMemo(() => ({
    total: subscribers.length,
    tier1: subscribers.filter(s => s.tier === 'tier1').length,
    tier2: subscribers.filter(s => s.tier === 'tier2').length,
    tier3: subscribers.filter(s => s.tier === 'tier3').length,
    hot: subscribers.filter(s => s.is_hot_lead).length,
  }), [subscribers]);

  const updateSubscriber = async (id, data) => {
    await appClient.entities.DnnSubscriber.update(id, data);
    queryClient.invalidateQueries({ queryKey: ['dnnSubscribers'] });
    setEditingSub(null);
  };

  const deleteSubscriber = async (id) => {
    if (!confirm('Remove this subscriber?')) return;
    await appClient.entities.DnnSubscriber.delete(id);
    queryClient.invalidateQueries({ queryKey: ['dnnSubscribers'] });
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>DNN Intelligence Bureau</span>
            </div>
            <h1 className="text-2xl font-black text-white">Subscriber CRM — The Power Base</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your 35,000-follower pipeline. Track tiers, hot leads, and engagement.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditingSub({})} variant="outline" className="gap-2 text-white border-slate-700 hover:bg-slate-800">
              <Users className="w-4 h-4" /> Add Subscriber
            </Button>
            <Button onClick={() => setImportOpen(true)} className="gap-2 font-bold"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}>
              <Upload className="w-4 h-4" /> Import List
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total.toLocaleString(), color: '#fff' },
            { label: 'Tier 1 Free', value: stats.tier1.toLocaleString(), color: '#94a3b8' },
            { label: 'Tier 2 Paid', value: stats.tier2.toLocaleString(), color: '#60a5fa' },
            { label: 'Tier 3 VIP', value: stats.tier3.toLocaleString(), color: '#D4AF37' },
            { label: '🔥 Hot Leads', value: stats.hot.toLocaleString(), color: '#f87171' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, source..."
              className="pl-8 h-8 text-xs bg-slate-900 border-slate-700 text-white" />
          </div>
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
            className="h-8 border border-slate-700 rounded-md px-2 text-xs bg-slate-900 text-white">
            <option value="all">All Tiers</option>
            <option value="tier1">Tier 1 — Free</option>
            <option value="tier2">Tier 2 — Paid</option>
            <option value="tier3">Tier 3 — VIP/Agent</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden border" style={{ background: '#111', borderColor: 'rgba(255,255,255,0.08)' }}>
          {isLoading
            ? <div className="flex justify-center py-16"><div className="w-6 h-6 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin" /></div>
            : filtered.length === 0
              ? <div className="text-center py-16 text-slate-500">No subscribers match your filters.</div>
              : (
                <table className="w-full text-sm">
                  <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Subscriber</th>
                      <th className="text-left px-4 py-3">Tier</th>
                      <th className="text-left px-4 py-3">Source</th>
                      <th className="text-left px-4 py-3">Hot Lead</th>
                      <th className="text-left px-4 py-3">Notes</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((sub, i) => {
                      const tier = TIERS[sub.tier] || TIERS.tier1;
                      return (
                        <tr key={sub.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-white">{sub.full_name || '—'}</p>
                            <p className="text-xs text-slate-500">{sub.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tier.color}`}>{tier.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{sub.source || '—'}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => updateSubscriber(sub.id, { is_hot_lead: !sub.is_hot_lead })}>
                              <Star className={`w-4 h-4 transition ${sub.is_hot_lead ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px] truncate">{sub.notes || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingSub(sub)} className="text-slate-500 hover:text-white transition"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteSubscriber(sub.id)} className="text-slate-600 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
          }
        </div>

        {/* Edit Modal */}
        {editingSub !== null && (
          <SubscriberModal
            subscriber={editingSub}
            onClose={() => setEditingSub(null)}
            onSave={async (data) => {
              if (editingSub.id) {
                await updateSubscriber(editingSub.id, data);
              } else {
                await appClient.entities.DnnSubscriber.create({ ...data, tier: data.tier || 'tier1' });
                queryClient.invalidateQueries({ queryKey: ['dnnSubscribers'] });
                setEditingSub(null);
              }
            }}
          />
        )}

        {/* Import Modal */}
        {importOpen && (
          <ImportModal onClose={() => setImportOpen(false)} onImported={() => {
            queryClient.invalidateQueries({ queryKey: ['dnnSubscribers'] });
            setImportOpen(false);
          }} />
        )}
      </div>
    </div>
  );
}

function SubscriberModal({ subscriber, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: subscriber.full_name || '',
    email: subscriber.email || '',
    tier: subscriber.tier || 'tier1',
    source: subscriber.source || '',
    notes: subscriber.notes || '',
    is_hot_lead: subscriber.is_hot_lead || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
        <DialogHeader><DialogTitle className="text-white">{subscriber.id ? 'Edit Subscriber' : 'Add Subscriber'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <div><label className="text-xs text-slate-400 mb-1 block">Full Name</label>
            <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Smith" className="bg-slate-900 border-slate-700 text-white" /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Email *</label>
            <Input required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" className="bg-slate-900 border-slate-700 text-white" /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Tier</label>
            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}
              className="w-full h-9 border border-slate-700 rounded-md px-2 text-sm bg-slate-900 text-white">
              <option value="tier1">Tier 1 — Free</option>
              <option value="tier2">Tier 2 — Paid</option>
              <option value="tier3">Tier 3 — VIP/Agent</option>
            </select></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Source (e.g. LinkedIn, Instagram)</label>
            <Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="LinkedIn" className="bg-slate-900 border-slate-700 text-white" /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes..." className="bg-slate-900 border-slate-700 text-white" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_hot_lead} onChange={e => setForm({ ...form, is_hot_lead: e.target.checked })} className="rounded" />
            <span className="text-sm text-white">Mark as 🔥 Hot Lead</span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-white hover:bg-slate-800">Cancel</Button>
            <Button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)', color: '#000' }}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImportModal({ onClose, onImported }) {
  const [text, setText] = useState('');
  const [defaultTier, setDefaultTier] = useState('tier1');
  const [source, setSource] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    setImporting(true);
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.includes('@'));
    let count = 0;
    for (const line of lines) {
      const parts = line.split(',');
      const email = parts.find(p => p.includes('@'))?.trim();
      const name = parts.find(p => !p.includes('@'))?.trim() || '';
      if (email) {
        await appClient.entities.DnnSubscriber.create({ email, full_name: name, tier: defaultTier, source, is_hot_lead: false });
        await new Promise(r => setTimeout(r, 40));
        count++;
      }
    }
    setResult(count);
    setImporting(false);
    if (count > 0) setTimeout(onImported, 1500);
  };

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800 text-white">
        <DialogHeader><DialogTitle className="text-white">Import Subscriber List</DialogTitle></DialogHeader>
        <form onSubmit={handleImport} className="space-y-3">
          <p className="text-xs text-slate-400">Paste emails (one per line). Optionally include name before the email separated by a comma: <code className="bg-slate-800 px-1 rounded">Jane Smith, jane@example.com</code></p>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
            placeholder={"jane@example.com\nJohn Doe, john@example.com\n..."}
            className="w-full px-3 py-2 rounded-md text-sm bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none" />
          <div className="flex gap-3">
            <div className="flex-1"><label className="text-xs text-slate-400 mb-1 block">Default Tier</label>
              <select value={defaultTier} onChange={e => setDefaultTier(e.target.value)}
                className="w-full h-9 border border-slate-700 rounded-md px-2 text-sm bg-slate-900 text-white">
                <option value="tier1">Tier 1 — Free</option>
                <option value="tier2">Tier 2 — Paid</option>
                <option value="tier3">Tier 3 — VIP/Agent</option>
              </select></div>
            <div className="flex-1"><label className="text-xs text-slate-400 mb-1 block">Source Label</label>
              <Input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. LinkedIn Export" className="bg-slate-900 border-slate-700 text-white" /></div>
          </div>
          {result !== null && <p className="text-green-400 font-semibold text-sm">✓ Imported {result} subscribers!</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-white">Cancel</Button>
            <Button type="submit" disabled={importing || !text.trim()} style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)', color: '#000' }}>
              {importing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />Importing...</> : 'Import'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}