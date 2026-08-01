import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { Building2, Video, RefreshCw, Sprout, ExternalLink, BookOpen } from 'lucide-react';
import CorporateClipCard from '@/components/corporate/CorporateClipCard';

const GOLD = '#D4AF37';

const HR_GUIDELINES = [
  { title: 'The Pitch', body: 'Lead with cost: traditional relocation companies charge management fees, referral markups, and admin overhead per transferee. We charge the company nothing — we share in the agent commission already built into the transaction.' },
  { title: 'The Vetting Story', body: "Every receiving agent is production-vetted and license-verified. The 'Aunt Suzie' contrast lands well with HR audiences — a proven pro versus a relative with a license who assumes she's getting the business." },
  { title: 'The Awkwardness Eliminator', body: 'When the transferee knows multiple agents, our process makes the selection for them — no awkward calls, no favors owed, no appearance of choosing. This is consistently the strongest hook with HR managers.' },
  { title: 'Where to Post', body: 'LinkedIn is the primary channel for HR decision-makers. Link posts and outreach to the public Corporate Relo page, where the video briefing is the hero. Cross-linked from the Relo Management page under "For Employers."' },
];

export default function AdminCorporateRelo() {
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: clips = [] } = useQuery({
    queryKey: ['adminCorporateReloClips'],
    queryFn: () => appClient.entities.CorporateReloClip.list(),
  });

  const run = async (action, label) => {
    setBusy(action);
    setMessage('');
    const res = await appClient.functions.invoke('corporateReloQARender', { action });
    const d = res.data;
    if (action === 'seed') setMessage(d.message || `Seeded ${d.created} clips`);
    if (action === 'startAll') setMessage(`Started ${d.started?.length || 0} renders`);
    if (action === 'checkAll') setMessage(`Checked ${d.checked?.length || 0} rendering clips`);
    queryClient.invalidateQueries({ queryKey: ['adminCorporateReloClips'] });
    setBusy('');
  };

  const sorted = [...clips].sort((a, b) => {
    const order = k => k.kind === 'intro' ? -1 : k.kind === 'outro' ? 99 : (k.faqIndex ?? 0);
    return order(a) - order(b);
  });

  return (
    <div className="min-h-screen p-8" style={{ background: '#0d0d0d' }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>
              <Building2 className="w-3.5 h-3.5 inline mr-1.5" />CORPORATE RELO / HR
            </p>
            <h1 className="text-2xl font-black text-white">HR Explainer Video Production</h1>
            <p className="text-sm text-slate-400 mt-1">Charlie asks, Bob answers — rendered via HeyGen for the public Corporate Relo page.</p>
          </div>
          <Link to="/corporate-relo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
            <ExternalLink className="w-4 h-4" /> View Public Page
          </Link>
        </div>

        {/* Production controls */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: '#141414', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>
            <Video className="w-3.5 h-3.5 inline mr-1.5" />Production Controls
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => run('seed')} disabled={!!busy || clips.length > 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}>
              <Sprout className="w-4 h-4" /> {busy === 'seed' ? 'Seeding…' : '1 · Seed Scripts'}
            </button>
            <button onClick={() => run('startAll')} disabled={!!busy || clips.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}>
              <Video className="w-4 h-4" /> {busy === 'startAll' ? 'Starting…' : '2 · Render All Clips'}
            </button>
            <button onClick={() => run('checkAll')} disabled={!!busy || clips.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ border: `1px solid ${GOLD}`, color: GOLD }}>
              <RefreshCw className="w-4 h-4" /> {busy === 'checkAll' ? 'Checking…' : '3 · Check Render Status'}
            </button>
          </div>
          {message && <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>✓ {message}</p>}
        </div>

        {/* Clip status */}
        {sorted.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>Clip Status</p>
            {sorted.map(clip => <CorporateClipCard key={clip.id} clip={clip} />)}
          </div>
        )}

        {/* HR department guidelines */}
        <div className="space-y-3">
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>
            <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />HR Department Guidelines
          </p>
          {HR_GUIDELINES.map(g => (
            <div key={g.title} className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="text-sm font-bold text-white mb-1">{g.title}</p>
              <p className="text-sm leading-relaxed text-slate-300">{g.body}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}