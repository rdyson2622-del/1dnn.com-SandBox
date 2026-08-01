import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Upload, Copy, CheckCircle, Shield } from 'lucide-react';

const STATUS_STYLES = {
  prospect: { bg: 'bg-slate-700', text: 'text-slate-200', label: 'Prospect' },
  active:   { bg: 'bg-green-900', text: 'text-green-300', label: 'Active Bureau Chief' },
  paused:   { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Paused' },
  churned:  { bg: 'bg-red-900', text: 'text-red-300', label: 'Churned' },
};

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

// ── Agent Form Modal ──────────────────────────────────────────────────────────
function AgentModal({ agent, onClose, onSaved }) {
  const [form, setForm] = useState({
    agent_name: agent?.agent_name || '',
    email: agent?.email || '',
    phone: agent?.phone || '',
    brokerage: agent?.brokerage || '',
    dre_number: agent?.dre_number || '',
    state: agent?.state || '',
    co_brand_label: agent?.co_brand_label || '',
    status: agent?.status || 'prospect',
    notes: agent?.notes || '',
    access_token: agent?.access_token || generateToken(),
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, onboarded_at: form.status === 'active' && !agent?.onboarded_at ? new Date().toISOString() : agent?.onboarded_at };
    if (agent?.id) {
      await appClient.entities.PartnerAgent.update(agent.id, payload);
    } else {
      await appClient.entities.PartnerAgent.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-xl bg-slate-950 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{agent?.id ? 'Edit Partner Agent' : 'Add Bureau Chief'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">Agent Name *</label>
              <Input required value={form.agent_name} onChange={e => set('agent_name', e.target.value)} placeholder="Jane Smith" className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Email *</label>
              <Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@brokerage.com" className="bg-slate-900 border-slate-700 text-white" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Brokerage</label>
              <Input value={form.brokerage} onChange={e => set('brokerage', e.target.value)} placeholder="Compass, Keller Williams..." className="bg-slate-900 border-slate-700 text-white" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">DRE #</label>
              <Input value={form.dre_number} onChange={e => set('dre_number', e.target.value)} placeholder="01234567" className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">State</label>
              <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="CA" className="bg-slate-900 border-slate-700 text-white" /></div>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">Co-Brand Display Name</label>
            <Input value={form.co_brand_label} onChange={e => set('co_brand_label', e.target.value)} placeholder="e.g. Jane Smith, Compass San Diego" className="bg-slate-900 border-slate-700 text-white" />
            <p className="text-xs text-slate-500 mt-1">Shown to their clients as: "Brought to you by DNN in partnership with <em>[this name]</em>"</p>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full h-9 border border-slate-700 rounded-md px-2 text-sm bg-slate-900 text-white">
              <option value="prospect">Prospect</option>
              <option value="active">Active Bureau Chief</option>
              <option value="paused">Paused</option>
              <option value="churned">Churned</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Silent Login Token</label>
            <div className="flex gap-2">
              <Input value={form.access_token} readOnly className="bg-slate-900 border-slate-700 text-slate-400 font-mono text-xs" />
              <Button type="button" variant="outline" size="sm" className="border-slate-700 text-slate-300 shrink-0"
                onClick={() => set('access_token', generateToken())}>Regenerate</Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Agent shares this token with clients to bypass login. Token-tagged subscribers are hard-locked to this agent's silo.</p>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <Input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes..." className="bg-slate-900 border-slate-700 text-white" /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-white">Cancel</Button>
            <Button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37,#b8920a)', color: '#000', fontWeight: 700 }}>
              {saving ? 'Saving...' : agent?.id ? 'Update Agent' : 'Add to Bureau'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Silent Import Modal ────────────────────────────────────────────────────────
function SilentImportModal({ agent, onClose, onImported }) {
  const [text, setText] = useState('');
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
        await appClient.entities.DnnSubscriber.create({
          email,
          full_name: name,
          tier: 'tier1',
          source: `Agent Import — ${agent.agent_name}`,
          partner_agent_id: agent.id,
          partner_agent_name: agent.co_brand_label || agent.agent_name,
          is_hot_lead: false,
          subscribed_at: new Date().toISOString(),
        });
        await new Promise(r => setTimeout(r, 40));
        count++;
      }
    }
    // Update subscriber count on agent
    await appClient.entities.PartnerAgent.update(agent.id, {
      subscriber_count: (agent.subscriber_count || 0) + count,
    });
    setResult(count);
    setImporting(false);
    if (count > 0) setTimeout(onImported, 1500);
  };

  const memberLink = `https://dysonrelo.com/?agent_token=${agent.access_token}`;

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Silent Import — {agent.agent_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg p-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <p className="text-xs font-bold text-yellow-400 mb-1 uppercase tracking-wider">Member Access Link</p>
            <p className="text-xs text-slate-300 font-mono break-all mb-2">{memberLink}</p>
            <button onClick={() => navigator.clipboard.writeText(memberLink)}
              className="text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 transition">
              <Copy className="w-3 h-3" /> Copy Link
            </button>
            <p className="text-xs text-slate-500 mt-2">Agent sends this to their clients. Click auto-tags them as this agent's subscriber and bypasses manual login.</p>
          </div>

          <form onSubmit={handleImport} className="space-y-3">
            <p className="text-xs text-slate-400">Paste the agent's client list (one per line). Format: <code className="bg-slate-800 px-1 rounded">Name, email@example.com</code></p>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
              placeholder={"John Doe, john@example.com\nJane Smith, jane@example.com\n..."}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none" />
            {result !== null && <p className="text-green-400 font-semibold text-sm">✓ Imported {result} subscribers, hard-tagged to {agent.agent_name}.</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-white">Close</Button>
              <Button type="submit" disabled={importing || !text.trim()} style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37,#b8920a)', color: '#000', fontWeight: 700 }}>
                {importing ? 'Importing...' : 'Import & Hard-Tag'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DnnAgentBureau() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'new' | agent obj
  const [importAgent, setImportAgent] = useState(null);
  const [copied, setCopied] = useState(null);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['partnerAgents'],
    queryFn: () => appClient.entities.PartnerAgent.list('-created_date', 500),
  });

  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    prospects: agents.filter(a => a.status === 'prospect').length,
    total_subs: agents.reduce((sum, a) => sum + (a.subscriber_count || 0), 0),
  }), [agents]);

  const refresh = () => qc.invalidateQueries({ queryKey: ['partnerAgents'] });

  const handleDelete = async (a) => {
    if (!confirm(`Remove ${a.agent_name} from the bureau? Their subscribers will remain but lose the agent tag.`)) return;
    await appClient.entities.PartnerAgent.delete(a.id);
    refresh();
  };

  const copyLink = (a) => {
    navigator.clipboard.writeText(`https://dysonrelo.com/?agent_token=${a.access_token}`);
    setCopied(a.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>DNN Intelligence Bureau</span>
            </div>
            <h1 className="text-2xl font-black text-white">Agent Bureau — B2B Partner Network</h1>
            <p className="text-sm text-slate-400 mt-1">Manage Bureau Chiefs. Each agent gets a private data silo, co-branded feeds, and silent-login member links.</p>
          </div>
          <Button onClick={() => setModal('new')}
            className="gap-2 font-bold" style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37,#b8920a)', color: '#000' }}>
            <Plus className="w-4 h-4" /> Add Bureau Chief
          </Button>
        </div>

        {/* Safe Cage Banner */}
        <div className="mb-6 rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-xs font-bold tracking-widest text-yellow-400 mb-1 uppercase">⚡ The Safe Cage Protocol</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Fiduciary Buffer Strategy:</strong> We do not sell leads — we manage assets. Each agent's subscriber database is hard-siloed. 
            No agent can see another's list. AI-generated news is co-branded per agent. The consumer's equity and finance structure 
            is positioned <em>before</em> they interact with external lenders or competing agents.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Bureau Chiefs', value: stats.total, color: '#fff' },
            { label: 'Active Partners', value: stats.active, color: '#4ade80' },
            { label: 'Prospects', value: stats.prospects, color: '#D4AF37' },
            { label: 'Total Agent Subs', value: stats.total_subs.toLocaleString(), color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Agent List */}
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin" /></div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No Bureau Chiefs yet. Click "Add Bureau Chief" to onboard your first partner agent.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map(a => {
              const ss = STATUS_STYLES[a.status] || STATUS_STYLES.prospect;
              return (
                <div key={a.id} className="rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}>{ss.label}</span>
                        {a.subscriber_count > 0 && (
                          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                            {a.subscriber_count} subscribers siloed
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-black text-white">{a.agent_name}</h2>
                      <p className="text-sm text-slate-400">{a.brokerage}{a.state ? ` · ${a.state}` : ''}{a.dre_number ? ` · DRE #${a.dre_number}` : ''}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>
                      {a.co_brand_label && (
                        <p className="text-xs mt-1.5 italic" style={{ color: '#D4AF37' }}>
                          Co-brand: "Brought to you by DNN in partnership with <strong>{a.co_brand_label}</strong>"
                        </p>
                      )}
                      {a.notes && <p className="text-xs text-slate-500 mt-1">📝 {a.notes}</p>}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" onClick={() => setImportAgent(a)}
                        className="gap-1.5 text-xs" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                        <Upload className="w-3 h-3" /> Silent Import
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyLink(a)}
                        className="gap-1.5 text-xs border-slate-700 text-slate-300 hover:text-white">
                        {copied === a.id ? <><CheckCircle className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Member Link</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setModal(a)}
                        className="gap-1.5 text-xs border-slate-700 text-slate-300 hover:text-white">
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(a)}
                        className="gap-1.5 text-xs text-red-500 hover:text-red-400">
                        <Trash2 className="w-3 h-3" /> Remove
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
        <AgentModal
          agent={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
      {importAgent && (
        <SilentImportModal
          agent={importAgent}
          onClose={() => setImportAgent(null)}
          onImported={() => { setImportAgent(null); refresh(); qc.invalidateQueries({ queryKey: ['dnnSubscribers'] }); }}
        />
      )}
    </div>
  );
}