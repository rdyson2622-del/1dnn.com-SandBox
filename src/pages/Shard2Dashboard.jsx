import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { FileStack, Sparkles, ClipboardCheck, CheckCircle, Loader, Film, AlertCircle, Plus, PenLine, Video } from 'lucide-react';
import Shard2Header from '@/components/shard2/Shard2Header';

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#1a1a1a', border: `1px solid ${color}25` }}>
      <Icon className="w-5 h-5 shrink-0" style={{ color }} />
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function QuickButton({ to, label, icon: Icon }) {
  return (
    <Link to={to}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
      style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}>
      <Icon className="w-4 h-4" /> {label}
    </Link>
  );
}

export default function Shard2Dashboard() {
  const { data: pages = [] } = useQuery({
    queryKey: ['shard2Pages'],
    queryFn: () => appClient.entities.DysonPage.list('-created_date', 200),
  });
  const { data: explainers = [] } = useQuery({
    queryKey: ['shard2Explainers'],
    queryFn: () => appClient.entities.CharliePageExplainer.list('-created_date', 500),
  });

  const scriptsGenerated = explainers.filter(e => ['generated', 'needs_review', 'approved'].includes(e.scriptStatus)).length;
  const needsReview = explainers.filter(e => e.scriptStatus === 'generated' || e.scriptStatus === 'needs_review').length;
  const approved = explainers.filter(e => e.scriptStatus === 'approved').length;
  const rendering = explainers.filter(e => ['queued', 'rendering', 'heygen_completed', 'composing'].includes(e.renderStatus)).length;
  const completed = explainers.filter(e => e.renderStatus === 'completed').length;
  const failed = explainers.filter(e => e.renderStatus === 'failed').length;

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Shard2Header />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard label="Total Pages" value={pages.length} color="#D4AF37" icon={FileStack} />
          <StatCard label="Scripts Generated" value={scriptsGenerated} color="#60a5fa" icon={Sparkles} />
          <StatCard label="Needs Review" value={needsReview} color="#fbbf24" icon={ClipboardCheck} />
          <StatCard label="Approved" value={approved} color="#4ade80" icon={CheckCircle} />
          <StatCard label="Rendering" value={rendering} color="#a78bfa" icon={Loader} />
          <StatCard label="Completed" value={completed} color="#34d399" icon={Film} />
          <StatCard label="Failed" value={failed} color="#f87171" icon={AlertCircle} />
        </div>

        <div>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: '#D4AF37' }}>Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <QuickButton to="/admin/shard2/pages" label="Add Page" icon={Plus} />
            <QuickButton to="/admin/shard2/scripts" label="Generate / Review Scripts" icon={PenLine} />
            <QuickButton to="/admin/shard2/scripts" label="Render Approved" icon={Video} />
            <QuickButton to="/admin/shard2/library" label="Open Video Library" icon={Film} />
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: '#D4AF37' }}>How Shard 2 Works</p>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { n: '1', t: 'Add a page', d: 'Capture the page title, URL and copy in Pages Manager.' },
              { n: '2', t: 'Generate & edit script', d: 'AI drafts Charlie\u2019s script; you refine it in the Script Editor.' },
              { n: '3', t: 'Approve & queue', d: 'Approve a script and queue it so n8n picks it up for rendering.' },
              { n: '4', t: 'Render & display', d: 'n8n + HeyGen + Cloudinary produce the final video, saved to your Library.' },
            ].map(s => (
              <div key={s.n} className="rounded-lg p-3 flex gap-3 items-start" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-black" style={{ background: '#D4AF37' }}>{s.n}</div>
                <div>
                  <p className="text-xs font-bold text-white">{s.t}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}