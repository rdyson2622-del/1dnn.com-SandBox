import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Star,
  ChevronDown, ChevronUp, Plus, Loader2, FileCheck, UserCheck,
  Award, Globe, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

function ReportBlock({ report }) {
  const [collapsed, setCollapsed] = useState({
    criteria: false,
    summary: false,
    flags: false,
    questions: true,
  });
  const toggle = k => setCollapsed(p => ({ ...p, [k]: !p[k] }));

  // Extract sections
  const extract = (label) => {
    const regex = new RegExp(`${label}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z]{2,}[^a-z]|$)`, 'i');
    const m = report.match(regex);
    return m ? m[1].trim() : null;
  };

  const sections = [
    { key: 'criteria', label: 'Scoring Criteria', icon: Star, content: extract('VETTING CRITERIA') || extract('1\\. DRE') },
    { key: 'summary', label: 'Client-Facing Summary', icon: Globe, content: extract('AGENT SUMMARY') },
    { key: 'flags', label: 'Internal Red Flags', icon: AlertTriangle, content: extract('INTERNAL RED FLAGS') },
    { key: 'questions', label: 'Interview Questions', icon: UserCheck, content: extract('SUGGESTED QUESTIONS') },
  ];

  return (
    <div className="space-y-2 mt-4">
      {sections.filter(s => s.content).map(s => {
        const Icon = s.icon;
        return (
          <div key={s.key} className="rounded-xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => toggle(s.key)} className="w-full flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color: GOLD }} />
                <span className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>{s.label}</span>
              </div>
              {collapsed[s.key] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            {!collapsed[s.key] && (
              <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap pt-3" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }}>
                  {s.content}
                </pre>
              </div>
            )}
          </div>
        );
      })}

      {/* Full raw report */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => toggle('raw')} className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-black tracking-widest uppercase text-slate-500">Full Raw Report</span>
          </div>
          {collapsed['raw'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
        </button>
        {!collapsed['raw'] && (
          <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap pt-3" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
              {report}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function VettingForm({ onResult }) {
  const [form, setForm] = useState({ agent_name: '', dre_number: '', state: 'CA', brokerage: '', markets: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await appClient.functions.invoke('vettingAgent', {
        ...form,
        markets: form.markets.split(',').map(m => m.trim()).filter(Boolean),
      });
      onResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: GOLD }}>Agent Full Name *</label>
          <Input required value={form.agent_name} onChange={e => set('agent_name', e.target.value)}
            placeholder="Jane Smith" className="bg-black border-slate-700 text-white" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: GOLD }}>DRE License #</label>
          <Input value={form.dre_number} onChange={e => set('dre_number', e.target.value)}
            placeholder="01234567" className="bg-black border-slate-700 text-white" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: GOLD }}>Brokerage</label>
          <Input value={form.brokerage} onChange={e => set('brokerage', e.target.value)}
            placeholder="Compass, Keller Williams..." className="bg-black border-slate-700 text-white" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: GOLD }}>State</label>
          <Input value={form.state} onChange={e => set('state', e.target.value)}
            placeholder="CA" className="bg-black border-slate-700 text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: GOLD }}>Target Markets (comma-separated)</label>
          <Input value={form.markets} onChange={e => set('markets', e.target.value)}
            placeholder="San Diego, La Jolla, Del Mar..." className="bg-black border-slate-700 text-white" />
        </div>
      </div>
      <Button type="submit" disabled={loading || !form.agent_name}
        className="w-full font-black text-sm py-3 gap-2"
        style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}>
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Gemini Researching Agent...</>
          : <><Sparkles className="w-4 h-4" /> Run Gemini Vetting Analysis</>
        }
      </Button>
      {loading && (
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Searching DRE records, web profiles, brokerage data, and production history... ~20 seconds
        </p>
      )}
    </form>
  );
}

function VettingResult({ result, onAddToBureau }) {
  const rec = result.recommendation?.toUpperCase().trim();
  const style = Object.entries(RECOMMENDATION_STYLE).find(([k]) => rec?.includes(k))?.[1] || RECOMMENDATION_STYLE['CONDITIONAL APPROVAL'];
  const Icon = style.icon;

  return (
    <div className="space-y-4">
      {/* Recommendation badge */}
      <div className="rounded-2xl p-5" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6" style={{ color: style.color }} />
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Bureau Recommendation</p>
              <p className="text-lg font-black" style={{ color: style.color }}>{result.recommendation}</p>
            </div>
          </div>
          {result.score && (
            <div className="w-48">
              <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Vetting Score</p>
              <ScoreMeter score={result.score} />
            </div>
          )}
        </div>
      </div>

      {/* Add to Bureau CTA */}
      {rec?.includes('APPROVE') && (
        <Button onClick={onAddToBureau} className="w-full gap-2 font-black"
          style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)', color: '#000' }}>
          <Plus className="w-4 h-4" /> Add {result.agent_name} to the DNN Agent Bureau
        </Button>
      )}

      {/* Collapsible report sections */}
      <ReportBlock report={result.report} />
    </div>
  );
}

// Past agent cards
function AgentCard({ agent }) {
  const [open, setOpen] = useState(false);
  const statusColor = { prospect: '#D4AF37', active: '#4ade80', paused: '#fbbf24', churned: '#f87171' };
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-4 px-4 py-3 text-left">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
          style={{ background: 'rgba(212,175,55,0.1)', color: GOLD }}>
          {agent.agent_name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{agent.agent_name}</p>
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.brokerage || '—'} · {agent.state}</p>
        </div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 capitalize"
          style={{ color: statusColor[agent.status] || '#fff', background: `${statusColor[agent.status]}18`, border: `1px solid ${statusColor[agent.status]}30` }}>
          {agent.status}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {agent.dre_number && <p className="text-xs pt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>DRE #{agent.dre_number}</p>}
          {agent.markets?.length > 0 && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Markets: {agent.markets.join(', ')}</p>}
          {agent.notes && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Notes: {agent.notes}</p>}
          {agent.email && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{agent.email}</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminAgentVetting() {
  const [result, setResult] = useState(null);
  const [prefillName, setPrefillName] = useState(null);
  const qc = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['partnerAgents'],
    queryFn: () => appClient.entities.PartnerAgent.list('-created_date', 100),
  });

  const handleAddToBureau = async () => {
    if (!result?.agent_name) return;
    await appClient.entities.PartnerAgent.create({
      agent_name: result.agent_name,
      status: 'prospect',
      notes: `Gemini vetting score: ${result.score}/35 — ${result.recommendation}`,
    });
    qc.invalidateQueries({ queryKey: ['partnerAgents'] });
    setResult(null);
    alert(`${result.agent_name} added to the Bureau as a Prospect. Open Agent Bureau to complete their profile.`);
  };

  const active = agents.filter(a => a.status === 'active');
  const prospects = agents.filter(a => a.status === 'prospect');

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>DNN Agent Bureau</span>
          </div>
          <h1 className="display-heading text-white mb-2" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', letterSpacing: '0.12em' }}>
            AGENT VETTING PROCESS
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem' }}>
            Gemini AI researches DRE records, production history, web presence, and market specialization — then scores each candidate against the Dyson Bureau standard.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Active Bureau Agents', value: active.length, color: '#4ade80' },
            { label: 'Prospects in Pipeline', value: prospects.length, color: GOLD },
            { label: 'Total Vetted', value: agents.length, color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — Vetting Form + Result */}
          <div>
            <div className="rounded-2xl p-6 mb-4" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                <p className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>New Vetting Analysis</p>
              </div>
              <VettingForm onResult={setResult} />
            </div>

            {result && (
              <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4" style={{ color: GOLD }} />
                  <p className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>Analysis: {result.agent_name}</p>
                </div>
                <VettingResult result={result} onAddToBureau={handleAddToBureau} />
              </div>
            )}
          </div>

          {/* Right — Bureau Roster */}
          <div>
            {/* 5-Step Standard */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: GOLD }}>The 5-Step Bureau Standard</p>
              <div className="space-y-3">
                {[
                  { n: 1, title: 'DRE Verification', desc: 'License valid, in good standing, no disciplinary actions' },
                  { n: 2, title: 'Production Screening', desc: 'Minimum 12 closings/yr, buyer-side experience, price alignment' },
                  { n: 3, title: 'Market Specialization', desc: 'True neighborhood expert in destination markets' },
                  { n: 4, title: 'Brokerage Assessment', desc: 'Brand strength, support systems, luxury/relocation alignment' },
                  { n: 5, title: 'Personal Interview', desc: 'Bob Dyson\'s team reviews communication style and fiduciary fit' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                      style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>{s.n}</div>
                    <div>
                      <p className="text-sm font-bold text-white">{s.title}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Cormorant Garamond, serif' }}>
                  "Every Bureau agent has passed my personal review. This is not a directory — it's a guarantee." — Bob Dyson
                </p>
              </div>
            </div>

            {/* Bureau Roster */}
            <div>
              <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: GOLD }}>
                Bureau Roster ({agents.length})
              </p>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {agents.length === 0 && (
                  <p className="text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>No agents yet. Run your first vetting analysis.</p>
                )}
                {active.map(a => <AgentCard key={a.id} agent={a} />)}
                {prospects.map(a => <AgentCard key={a.id} agent={a} />)}
                {agents.filter(a => a.status === 'paused' || a.status === 'churned').map(a => <AgentCard key={a.id} agent={a} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}