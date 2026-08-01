import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import {
  DollarSign, Sparkles, Loader2, CheckCircle, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const GOLD = '#D4AF37';

const RECOMMENDATION_STYLE = {
  'APPROVE': { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: CheckCircle },
  'CONDITIONAL APPROVAL': { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', icon: AlertTriangle },
  'REJECT': { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: XCircle },
};

function ScoreMeter({ score }) {
  const pct = Math.round((score / 35) * 100);
  const color = pct >= 80 ? '#4ade80' : pct >= 55 ? '#fbbf24' : '#f87171';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm font-black shrink-0" style={{ color }}>{score}/35</span>
    </div>
  );
}

function LenderModal({ lender, onClose, onSaved }) {
  const [form, setForm] = useState({
    lender_name: lender?.lender_name || '',
    email: lender?.email || '',
    phone: lender?.phone || '',
    company: lender?.company || '',
    nmls_number: lender?.nmls_number || '',
    state: lender?.state || 'CA',
    status: lender?.status || 'prospect',
    featured_tier: lender?.featured_tier || 'bronze',
    bio: lender?.bio || '',
    notes: lender?.notes || '',
    avg_close_days: lender?.avg_close_days || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, avg_close_days: form.avg_close_days ? Number(form.avg_close_days) : undefined };
    if (lender?.id) {
      await appClient.entities.VettedLender.update(lender.id, payload);
    } else {
      await appClient.entities.VettedLender.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-xl bg-slate-950 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{lender?.id ? 'Edit Vetted Lender' : 'Add Bureau Lender'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">Lender Name *</label>
              <Input required value={form.lender_name} onChange={e => set('lender_name', e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Email *</label>
              <Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Company</label>
              <Input value={form.company} onChange={e => set('company', e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">NMLS #</label>
              <Input value={form.nmls_number} onChange={e => set('nmls_number', e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">State</label>
              <Input value={form.state} onChange={e => set('state', e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Avg Close Days</label>
              <Input type="number" value={form.avg_close_days} onChange={e => set('avg_close_days', e.target.value)} placeholder="e.g. 21" className="bg-slate-900 border-slate-700 text-white" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Featured Tier</label>
              <select value={form.featured_tier} onChange={e => set('featured_tier', e.target.value)}
                className="w-full h-9 border border-slate-700 rounded-md px-2 text-sm bg-slate-900 text-white">
                <option value="bronze">Bronze ($497/mo)</option>
                <option value="silver">Silver ($997/mo)</option>
                <option value="gold">Gold ($1,997/mo)</option>
              </select></div>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full h-9 border border-slate-700 rounded-md px-2 text-sm bg-slate-900 text-white">
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="churned">Churned</option>
            </select></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Client-Facing Bio</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none" /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">Internal Notes</label>
            <Input value={form.notes} onChange={e => set('notes', e.target.value)} className="bg-slate-900 border-slate-700 text-white" /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-white">Cancel</Button>
            <Button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37)', color: '#000', fontWeight: 700 }}>
              {saving ? 'Saving...' : lender?.id ? 'Update' : 'Add to Bureau'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VettingForm({ onResult }) {
  const [form, setForm] = useState({ lender_name: '', nmls_number: '', state: 'CA', company: '', markets: '', loan_types: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await appClient.functions.invoke('vettingLender', {
        ...form,
        markets: form.markets.split(',').map(m => m.trim()).filter(Boolean),
        loan_types: form.loan_types.split(',').map(m => m.trim()).filter(Boolean),
      });
      onResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className="text-xs font-bold mb-1.5 block uppercase tracking-widest" style={{ color: GOLD }}>Lender Name *</label>
          <Input required value={form.lender_name} onChange={e => set('lender_name', e.target.value)} placeholder="John Smith" className="bg-black border-slate-700 text-white" /></div>
        <div><label className="text-xs font-bold mb-1.5 block uppercase tracking-widest" style={{ color: GOLD }}>NMLS #</label>
          <Input value={form.nmls_number} onChange={e => set('nmls_number', e.target.value)} placeholder="123456" className="bg-black border-slate-700 text-white" /></div>
        <div><label className="text-xs font-bold mb-1.5 block uppercase tracking-widest" style={{ color: GOLD }}>Company</label>
          <Input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Guild Mortgage, Chase..." className="bg-black border-slate-700 text-white" /></div>
        <div><label className="text-xs font-bold mb-1.5 block uppercase tracking-widest" style={{ color: GOLD }}>State</label>
          <Input value={form.state} onChange={e => set('state', e.target.value)} className="bg-black border-slate-700 text-white" /></div>
        <div><label className="text-xs font-bold mb-1.5 block uppercase tracking-widest" style={{ color: GOLD }}>Markets (comma-sep)</label>
          <Input value={form.markets} onChange={e => set('markets', e.target.value)} placeholder="San Diego, Los Angeles..." className="bg-black border-slate-700 text-white" /></div>
        <div><label className="text-xs font-bold mb-1.5 block uppercase tracking-widest" style={{ color: GOLD }}>Loan Types (comma-sep)</label>
          <Input value={form.loan_types} onChange={e => set('loan_types', e.target.value)} placeholder="conventional, jumbo, VA..." className="bg-black border-slate-700 text-white" /></div>
      </div>
      <Button type="submit" disabled={loading || !form.lender_name} className="w-full gap-2 font-black"
        style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37)', color: '#000' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gemini Researching Lender...</> : <><Sparkles className="w-4 h-4" /> Run Gemini Vetting Analysis</>}
      </Button>
      {loading && <p className="text-xs text-center text-slate-500">Searching NMLS records, reviews, and production data... ~20 seconds</p>}
    </form>
  );
}

function VettingResult({ result, onAddToBureau }) {
  const rec = result.recommendation?.toUpperCase().trim();
  const style = Object.entries(RECOMMENDATION_STYLE).find(([k]) => rec?.includes(k))?.[1] || RECOMMENDATION_STYLE['CONDITIONAL APPROVAL'];
  const Icon = style.icon;
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6" style={{ color: style.color }} />
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">Bureau Recommendation</p>
              <p className="text-lg font-black" style={{ color: style.color }}>{result.recommendation}</p>
            </div>
          </div>
          {result.score && (
            <div className="w-48">
              <p className="text-[10px] uppercase tracking-widest mb-1.5 text-slate-500">Score</p>
              <ScoreMeter score={result.score} />
            </div>
          )}
        </div>
      </div>
      {rec?.includes('APPROVE') && (
        <Button onClick={onAddToBureau} className="w-full gap-2 font-black"
          style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37)', color: '#000' }}>
          <Plus className="w-4 h-4" /> Add {result.lender_name} to Bureau
        </Button>
      )}
      <button onClick={() => setShowReport(v => !v)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
        {showReport ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Full Report
      </button>
      {showReport && (
        <pre className="text-xs leading-relaxed whitespace-pre-wrap p-4 rounded-xl text-slate-400"
          style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Inter, sans-serif' }}>
          {result.report}
        </pre>
      )}
    </div>
  );
}

export default function AdminLenderVetting() {
  const [result, setResult] = useState(null);
  const [modal, setModal] = useState(null);
  const qc = useQueryClient();

  const { data: lenders = [] } = useQuery({
    queryKey: ['vettedLenders'],
    queryFn: () => appClient.entities.VettedLender.list('-created_date', 100),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['vettedLenders'] });

  const handleAddToBureau = async () => {
    if (!result?.lender_name) return;
    await appClient.entities.VettedLender.create({
      lender_name: result.lender_name,
      email: `pending_${Date.now()}@placeholder.com`,
      status: 'prospect',
      notes: `Gemini score: ${result.score}/35 — ${result.recommendation}`,
    });
    refresh();
    setResult(null);
    alert(`${result.lender_name} added as Prospect. Edit their record to complete the profile.`);
  };

  const active = lenders.filter(l => l.status === 'active');
  const statusColor = { prospect: GOLD, active: '#4ade80', paused: '#fbbf24', churned: '#f87171' };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>DNN Lender Bureau</span>
          </div>
          <h1 className="display-heading text-white mb-2" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', letterSpacing: '0.12em' }}>
            LENDER VETTING PROCESS
          </h1>
          <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}>
            Every DNN Bureau lender is NMLS-verified, production-screened, and personally interviewed for relocation-client fit.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Active Lenders', value: active.length, color: '#4ade80' },
            { label: 'Total in Bureau', value: lenders.length, color: GOLD },
            { label: 'Prospects', value: lenders.filter(l => l.status === 'prospect').length, color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-widest mb-1 text-slate-500">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vetting Form */}
          <div className="space-y-4">
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-xs font-black tracking-widest uppercase mb-5" style={{ color: GOLD }}>Run Gemini Vetting</p>
              <VettingForm onResult={setResult} />
            </div>
            {result && (
              <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: GOLD }}>Analysis: {result.lender_name}</p>
                <VettingResult result={result} onAddToBureau={handleAddToBureau} />
              </div>
            )}
          </div>

          {/* Lender Roster */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>Lender Roster ({lenders.length})</p>
              <Button size="sm" onClick={() => setModal('new')} className="gap-1 text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#e8c84a,#D4AF37)', color: '#000' }}>
                <Plus className="w-3 h-3" /> Add Manually
              </Button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {lenders.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No lenders yet. Run a vetting analysis to add your first.</p>}
              {lenders.map(l => (
                <div key={l.id} className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                  onClick={() => setModal(l)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                      style={{ background: 'rgba(212,175,55,0.1)', color: GOLD }}>{l.lender_name?.[0]}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{l.lender_name}</p>
                      <p className="text-xs truncate text-slate-500">{l.company || '—'} · NMLS #{l.nmls_number || '?'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 capitalize"
                    style={{ color: statusColor[l.status] || '#fff', background: `${statusColor[l.status]}18`, border: `1px solid ${statusColor[l.status]}30` }}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <LenderModal
          lender={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}