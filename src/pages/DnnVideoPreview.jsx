import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play, RefreshCw, Send, CheckCircle, XCircle, Clock, Globe, Linkedin } from 'lucide-react';

const GOLD = '#D4AF37';
const DNN_LOGO = "/assets/dyson-logo.png";
const DNN_STUDIO_IMAGE = "/assets/dnn-studio.png";

const TRIGGER_LABELS = {
  tax_policy: 'TAX POLICY', housing_market: 'HOUSING MARKET', job_market: 'JOB MARKET',
  interest_rates: 'INTEREST RATES', migration_data: 'MIGRATION DATA', employer_news: 'EMPLOYER NEWS',
  general: 'GENERAL', federal_reserve: 'FEDERAL RESERVE', mortgage_lending: 'MORTGAGE LENDING',
  federal_legislation: 'FEDERAL LEGISLATION', national_housing_data: 'NATIONAL HOUSING DATA',
  economic_indicators: 'ECONOMIC INDICATORS', demographics_migration: 'DEMOGRAPHICS & MIGRATION',
  insurance_climate: 'INSURANCE & CLIMATE', regulatory_compliance: 'REGULATORY COMPLIANCE',
  construction_supply: 'CONSTRUCTION & SUPPLY', consumer_protection: 'CONSUMER PROTECTION',
};

function VideoPreviewCard({ article, onBlast }) {
  const [playing, setPlaying] = useState(false);
  const [blasting, setBlasting] = useState(false);
  const [blastResult, setBlastResult] = useState(null);
  const [liPosting, setLiPosting] = useState(false);
  const [liResult, setLiResult] = useState(null);

  const hasVideo = article.video_url && !article.video_url.startsWith('heygen:pending:');
  const isRendering = article.video_url && article.video_url.startsWith('heygen:pending:');
  const isFailed = article.production_status === 'failed';

  const handleBlast = async () => {
    setBlasting(true);
    setBlastResult(null);
    try {
      const res = await appClient.functions.invoke('dnnSocialBlast', {});
      setBlastResult({ success: true, data: res.data });
    } catch (e) {
      setBlastResult({ success: false, error: e.message });
    }
    setBlasting(false);
  };

  const handleLinkedInPost = async () => {
    setLiPosting(true);
    setLiResult(null);
    try {
      const firstPara = article.body?.split('\n').filter(p => p.trim())[0] || '';
      const res = await appClient.functions.invoke('postToLinkedInV2', {
        text: `📡 DNN Intelligence Bureau\n\n${article.headline}\n\n${firstPara}\n\n🔔 Watch the full broadcast: https://1dnn.com/dnn-news?autoplay=1\nSubscribe for free daily intelligence: https://1dnn.com/subscribe`,
        videoUrl: article.video_url,
        imageUrl: DNN_STUDIO_IMAGE,
        title: article.headline,
        description: "Charlie Simmons and Bob Dyson break down today's top relocation and real estate intelligence.",
        organizationName: 'DNN',
      });
      setLiResult({ success: true, data: res.data });
    } catch (e) {
      setLiResult({ success: false, error: e.message });
    }
    setLiPosting(false);
  };

  const statusBadge = () => {
    if (isFailed) return { icon: XCircle, label: 'FAILED', color: '#ef4444' };
    if (hasVideo) return { icon: CheckCircle, label: 'READY', color: '#4ade80' };
    if (isRendering) return { icon: Clock, label: 'RENDERING', color: '#fbbf24' };
    return { icon: Clock, label: 'PENDING', color: '#94a3b8' };
  };

  const badge = statusBadge();
  const StatusIcon = badge.icon;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{ background: `${badge.color}20`, color: badge.color }}>
          <StatusIcon className="w-2.5 h-2.5 inline mr-1" />{badge.label}
        </span>
        {article.trigger_type && (
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500">
            {TRIGGER_LABELS[article.trigger_type] || 'GENERAL'}
          </span>
        )}
      </div>

      {/* Video / Thumbnail */}
      <div className="relative aspect-video bg-black">
        {hasVideo ? (
          playing ? (
            <video src={article.video_url} controls autoPlay playsInline className="w-full h-full" />
          ) : (
            <button onClick={() => setPlaying(true)} className="w-full h-full flex items-center justify-center group">
              <video src={article.video_url} muted playsInline preload="metadata"
                onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: GOLD }}>
                  <Play className="w-6 h-6 ml-1 text-black" fill="black" />
                </div>
              </div>
            </button>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {isRendering && <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${GOLD}40`, borderTopColor: GOLD }} />}
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
              {isFailed ? 'Render Failed' : 'Rendering…'}
            </p>
          </div>
        )}
      </div>

      {/* Article info */}
      <div className="p-3">
        <p className="text-xs font-bold text-white leading-snug mb-1">{article.headline}</p>
        <p className="text-[10px] text-slate-500">{article.dateline}</p>

        {/* LinkedIn button */}
        {hasVideo && (
          <button onClick={handleLinkedInPost} disabled={liPosting}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50"
            style={{ background: liPosting ? '#666' : '#0a66c2' }}>
            {liPosting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Linkedin className="w-3.5 h-3.5" />}
            {liPosting ? 'Posting...' : 'Post Broadcast to LinkedIn'}
          </button>
        )}

        {/* Facebook button */}
        {hasVideo && (
          <button onClick={handleBlast} disabled={blasting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-black transition-all disabled:opacity-50"
            style={{ background: blasting ? '#666' : 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
            {blasting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {blasting ? 'Posting...' : 'Post to Facebook'}
          </button>
        )}

        {/* LinkedIn result */}
        {liResult && (
          <div className="mt-2 rounded-lg p-2 text-[10px]" style={{
            background: liResult.success ? 'rgba(10,102,194,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${liResult.success ? 'rgba(10,102,194,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {liResult.success ? (
              <p className="font-bold text-blue-400">✓ Posted to {liResult.data?.posted_as || 'LinkedIn'} ({liResult.data?.type})</p>
            ) : (
              <p className="text-red-400">✗ {liResult.error}</p>
            )}
          </div>
        )}

        {/* Blast result */}
        {blastResult && (
          <div className="mt-2 rounded-lg p-2 text-[10px]" style={{
            background: blastResult.success ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${blastResult.success ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {blastResult.success ? (
              <>
                <p className="font-bold text-green-400">✓ Posted Successfully</p>
                {blastResult.data?.linkedin?.success && <p className="text-slate-400">LinkedIn: {blastResult.data.linkedin.type}</p>}
                {blastResult.data?.facebook?.success && <p className="text-slate-400">Facebook: {blastResult.data.facebook.type}</p>}
              </>
            ) : (
              <p className="text-red-400">✗ {blastResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DnnVideoPreview() {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (user?.role !== 'admin') {
        window.location.href = '/';
      } else {
        setIsAdmin(true);
      }
    }).catch(() => window.location.href = '/');
  }, []);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['dnnVideoPreview'],
    queryFn: () => appClient.entities.DnnArticle.filter({ status: 'published' }, '-generated_date', 50),
    refetchInterval: 30000, // auto-refresh every 30s to pick up completed renders
  });

  const { data: blasted = [] } = useQuery({
    queryKey: ['dnnVideoPreviewBlasted'],
    queryFn: () => appClient.entities.DnnArticle.filter({ status: 'blasted' }, '-generated_date', 50),
    refetchInterval: 30000,
  });

  const all = [...articles, ...blasted];
  const ready = all.filter(a => a.video_url && !a.video_url.startsWith('heygen:pending:'));
  const rendering = all.filter(a => a.video_url && a.video_url.startsWith('heygen:pending:'));
  const failed = all.filter(a => a.production_status === 'failed');

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="flex items-center gap-3">
          <img src={DNN_LOGO} alt="DNN" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>Video Preview Studio</p>
            <p className="text-[10px] text-slate-500">Review & approve before social blast</p>
          </div>
        </div>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['dnnVideoPreview'] })}
          className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg text-black"
          style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-4 flex gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold text-green-400">{ready.length} Ready</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{rendering.length} Rendering</span>
        </div>
        {failed.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-400">{failed.length} Failed</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg ml-auto" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Globe className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GOLD }}>Auto-blast PAUSED — Manual review mode</span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="px-6 py-3" style={{ background: 'rgba(251,191,36,0.06)' }}>
        <p className="text-xs text-center" style={{ color: '#fbbf24' }}>
          ⚠️ The 6 AM auto-blast is <strong>paused</strong>. Watch each video below, then click "Post Broadcast to LinkedIn" or "Post to Facebook" only on the ones you approve.
          Videos still rendering will appear automatically as they complete (page refreshes every 30s).
        </p>
      </div>

      {/* Grid */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {all.map(article => (
              <VideoPreviewCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
