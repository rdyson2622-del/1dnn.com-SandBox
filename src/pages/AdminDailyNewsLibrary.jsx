import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader, Library, Video, FileText, CheckCircle, Save, Wand2 } from 'lucide-react';
import Shard1ScriptReviewCard from '@/components/dnn/Shard1ScriptReviewCard';

const DNN_LOGO = "/assets/dyson-logo.png";
const GOLD = '#D4AF37';

const DEFAULT_OPENING_CTA = `You're watching DNN — Dyson News Network. I'm Charlie Simmons. Today's real estate intelligence moves markets, and we'll tell you exactly what it means for your move. For a free, white-glove relocation plan and a vetted agent in your destination market, visit 1dnn.com — that's the number one, D-N-N dot com.`;

const DEFAULT_CLOSING_CTA = `That's your DNN Intelligence Brief. I'm Charlie Simmons. Moving? Don't guess — get managed. Dyson & Dyson coordinates your entire relocation at zero cost to you: vetted agents, lenders, movers, and a dedicated concierge. Subscribe to DNN daily and start your free relocation plan at 1dnn.com. We'll see you tomorrow — twice a day, every day.`;

const FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'video', label: 'Has Video', test: (a) => a.video_url && !String(a.video_url).startsWith('heygen:pending:') },
  { key: 'review', label: 'Needs Review', test: (a) => ['pending_review', 'needs_revision', 'script_generated', 'new', 'none'].includes(a.production_status) },
  { key: 'complete', label: 'Complete', test: (a) => a.production_status === 'complete' },
];

function loadCta() {
  try {
    const saved = JSON.parse(localStorage.getItem('dnn_default_cta'));
    return {
      opening: saved?.opening ?? DEFAULT_OPENING_CTA,
      closing: saved?.closing ?? DEFAULT_CLOSING_CTA,
    };
  } catch {
    return { opening: DEFAULT_OPENING_CTA, closing: DEFAULT_CLOSING_CTA };
  }
}

function saveCta(cta) {
  localStorage.setItem('dnn_default_cta', JSON.stringify(cta));
}

function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function editionTag(article) {
  const d = new Date(article.generated_date || article.created_date);
  const h = d.getHours();
  // 6AM national pull = "Morning Edition"; afternoon/evening = "Evening Edition"
  if (h < 12) return 'Morning Edition';
  return 'Evening Edition';
}

export default function AdminDailyNewsLibrary() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [cta, setCta] = useState(loadCta);
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState(null);

  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['dnnDailyLibrary'],
    queryFn: () => appClient.entities.DnnArticle.list('-generated_date', 500),
    refetchInterval: 60000,
  });

  // Group articles by date (YYYY-MM-DD)
  const grouped = useMemo(() => {
    const map = {};
    articles.forEach((a) => {
      const d = (a.generated_date || a.created_date || '').slice(0, 10);
      if (!d) return;
      (map[d] = map[d] || []).push(a);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter);
    return articles.filter(f.test);
  }, [articles, filter]);

  const filteredGrouped = useMemo(() => {
    const ids = new Set(filteredArticles.map((a) => a.id));
    return grouped
      .map(([date, items]) => [date, items.filter((a) => ids.has(a.id))])
      .filter(([, items]) => items.length > 0);
  }, [grouped, filteredArticles]);

  const stats = useMemo(() => ({
    total: articles.length,
    videos: articles.filter((a) => a.video_url && !String(a.video_url).startsWith('heygen:pending:')).length,
    today: articles.filter((a) => (a.generated_date || a.created_date || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
    needsReview: articles.filter((a) => ['pending_review', 'needs_revision', 'script_generated', 'new', 'none'].includes(a.production_status)).length,
  }), [articles]);

  const handleApplyCta = async () => {
    if (!confirm(`Apply your default Opening & Closing CTA to all ${filteredArticles.length} visible articles? This overwrites their edited opening/closing scripts.`)) return;
    setApplying(true);
    setApplyMsg(null);
    let ok = 0;
    for (const a of filteredArticles) {
      try {
        await appClient.entities.DnnArticle.update(a.id, {
          edited_opening_script: cta.opening,
          edited_closing_script: cta.closing,
        });
        ok++;
      } catch (e) {
        console.warn('apply failed', a.id, e);
      }
    }
    setApplying(false);
    setApplyMsg({ type: 'success', text: `Applied DNN + relocation CTA to ${ok} article(s).` });
    queryClient.invalidateQueries({ queryKey: ['dnnDailyLibrary'] });
    queryClient.invalidateQueries({ queryKey: ['dnnScriptReview'] });
  };

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
          <Library className="w-5 h-5" style={{ color: GOLD }} />
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>Daily News Library</p>
            <p className="text-[10px] tracking-widest uppercase text-slate-600">Every script & video — edit openings / closings (DNN + relocation CTA)</p>
          </div>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80"
          style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: GOLD }}>
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: 'Total Scripts', value: stats.total, color: '#94a3b8' },
            { icon: Video, label: 'Videos Rendered', value: stats.videos, color: '#4ade80' },
            { icon: CheckCircle, label: "Today's Editions", value: stats.today, color: GOLD },
            { icon: FileText, label: 'Needs Review', value: stats.needsReview, color: '#fbbf24' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-black text-white leading-none">{s.value}</p>
                  <p className="text-[10px] tracking-widest uppercase text-slate-500 mt-1">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Default CTA Template */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: '#111', border: `1px solid ${GOLD}33` }}>
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>Default Opening & Closing CTA</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed -mt-1">
            These direct every viewer to <b style={{ color: GOLD }}>1dnn.com</b> and Dyson &amp; Dyson's free relocation management.
            Edit once here, then "Apply to All" to stamp every script's opening &amp; closing in one click. Twice-a-day editions (morning + evening) inherit the same CTA.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1 block">Default Opening (Scene 1)</label>
              <textarea
                value={cta.opening}
                onChange={(e) => setCta({ ...cta, opening: e.target.value })}
                rows={6}
                className="w-full rounded-lg px-3 py-2 text-xs text-white resize-y leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1 block">Default Closing (Scene 3)</label>
              <textarea
                value={cta.closing}
                onChange={(e) => setCta({ ...cta, closing: e.target.value })}
                rows={6}
                className="w-full rounded-lg px-3 py-2 text-xs text-white resize-y leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { saveCta(cta); setApplyMsg({ type: 'success', text: 'Default CTA saved.' }); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Save className="w-3 h-3" /> Save Template
            </button>
            <button onClick={handleApplyCta} disabled={applying || filteredArticles.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: '1px solid rgba(212,175,55,0.35)' }}>
              {applying ? <Loader className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} Apply to All Visible ({filteredArticles.length})
            </button>
            {applyMsg && <p className="text-xs self-center" style={{ color: applyMsg.type === 'success' ? '#4ade80' : '#f87171' }}>{applyMsg.text}</p>}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = articles.filter(f.test).length;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: filter === f.key ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  color: filter === f.key ? GOLD : '#94a3b8',
                  border: `1px solid ${filter === f.key ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {f.label} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Library grouped by date */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin" style={{ color: GOLD }} /></div>
        ) : filteredGrouped.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Library className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm text-slate-600">No scripts or videos in this view yet.</p>
            <p className="text-xs text-slate-700 mt-1">The daily national news pipeline will populate this library each morning &amp; evening.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredGrouped.map(([date, items]) => (
              <div key={date}>
                <div className="sticky top-[60px] z-10 flex items-center gap-3 py-2 mb-2"
                  style={{ background: 'rgba(13,13,13,0.95)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                  <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>{dayLabel(date)}</span>
                  <span className="text-[10px] text-slate-600">{date}</span>
                  <span className="text-[10px] text-slate-600">· {items.length} edition(s)</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.1)' }} />
                </div>
                <div className="space-y-3">
                  {items.map((article) => (
                    <div key={article.id} className="relative">
                      <span className="absolute -top-2 left-3 z-10 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}>
                        {editionTag(article)} · {article.scope || 'local'}
                      </span>
                      <Shard1ScriptReviewCard article={article} onChanged={refetch} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}