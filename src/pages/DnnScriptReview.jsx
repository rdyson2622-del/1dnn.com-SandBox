import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader, FileText } from 'lucide-react';
import Shard1ScriptReviewCard from '@/components/dnn/Shard1ScriptReviewCard';

const DNN_LOGO = "/assets/dyson-logo.png";

const FILTERS = [
  { key: 'review', label: 'Needs Review', statuses: ['pending_review', 'needs_revision', 'script_generated'] },
  { key: 'approved', label: 'Approved / Rendering', statuses: ['approved_for_render', 'rendering'] },
  { key: 'done', label: 'Complete', statuses: ['complete'] },
  { key: 'all', label: 'All', statuses: null },
];

export default function DnnScriptReview() {
  const [filter, setFilter] = useState('review');

  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['dnnScriptReview'],
    queryFn: () => appClient.entities.DnnArticle.list('-generated_date', 200),
    refetchInterval: 60000,
  });

  const active = FILTERS.find((f) => f.key === filter);
  const filtered = active.statuses
    ? articles.filter((a) => active.statuses.includes(a.production_status))
    : articles;

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(13,13,13,0.97)', borderBottom: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <Link to="/admin/dnn/studio">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </Link>
          <img src={DNN_LOGO} alt="DNN" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>Shard 1 Script Review</p>
            <p className="text-[10px] tracking-widest uppercase text-slate-600">Review & approve scripts before HeyGen render</p>
          </div>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80"
          style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}>
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {/* How it works */}
        <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            n8n generates the script and pushes it here (status <b style={{ color: '#fbbf24' }}>Pending Review</b>). Edit the script, pronunciation, and wording,
            then click <b style={{ color: '#4ade80' }}>Approve for Render</b>. Only approved articles are pulled by n8n for HeyGen rendering.
            Anchor: <b className="text-white">Charlie Simmons</b>. Structure: DNN open → news story → Dyson &amp; Dyson outro.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.statuses ? articles.filter((a) => f.statuses.includes(a.production_status)).length : articles.length;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: filter === f.key ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  color: filter === f.key ? '#D4AF37' : '#94a3b8',
                  border: `1px solid ${filter === f.key ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {f.label} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin" style={{ color: '#D4AF37' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm text-slate-600">No articles in this view.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((article) => (
              <Shard1ScriptReviewCard key={article.id} article={article} onChanged={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}