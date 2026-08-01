import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Video, FileText, RefreshCw, Play, CheckCircle, AlertCircle, Loader, RotateCcw } from 'lucide-react';

const DNN_LOGO = "/assets/dyson-logo.png";

// Default avatar — can be changed here
const DEFAULT_AVATAR_ID = 'Adrian_public_2_20240312';

function StatusBadge({ label, color, bg }) {
  return (
    <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
      style={{ background: bg, color }}>
      {label}
    </span>
  );
}

function VideoCard({ article, onRender, onCheck, onClearVideo }) {
  const isPending = article.video_url?.startsWith('heygen:pending:');
  const hasVideo = article.video_url && !isPending;
  const videoId = isPending ? article.video_url.replace('heygen:pending:', '') : null;

  const [rendering, setRendering] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const handleRender = async () => {
    setRendering(true);
    setCheckResult(null);
    await onRender(article.id);
    setRendering(false);
  };

  const handleCheck = async () => {
    setChecking(true);
    setCheckResult(null);
    const result = await onCheck(videoId, article.id);
    setCheckResult(result);
    setChecking(false);
  };

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: '#1a1a1a', border: `1px solid ${hasVideo ? 'rgba(74,222,128,0.25)' : isPending ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)'}` }}>

      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasVideo && <StatusBadge label="✓ Video Ready" color="#4ade80" bg="rgba(74,222,128,0.12)" />}
        {isPending && <StatusBadge label="⏳ Rendering" color="#fbbf24" bg="rgba(251,191,36,0.12)" />}
        {!hasVideo && !isPending && <StatusBadge label="No Video" color="#6b7280" bg="rgba(107,114,128,0.12)" />}
        <span className="text-[10px] text-slate-600 ml-auto">{article.status}</span>
      </div>

      {/* Headline */}
      <p className="text-sm font-bold text-white leading-snug">{article.headline}</p>
      <p className="text-[10px] text-slate-600">{article.dateline} · {article.trigger_type?.replace(/_/g, ' ')}</p>

      {/* Video preview */}
      {hasVideo && (
        <div className="flex items-center gap-2">
          <a href={article.video_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
            style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
            <Play className="w-3 h-3" /> Play Video
          </a>
          <button onClick={() => onClearVideo(article.id)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-600 transition-all hover:text-red-400 hover:bg-red-400/10">
            <RotateCcw className="w-3 h-3" /> Re-render
          </button>
        </div>
      )}

      {/* Pending: show check button */}
      {isPending && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-yellow-700">Job ID: {videoId?.slice(0, 20)}...</p>
          <button onClick={handleCheck} disabled={checking}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
            {checking ? <Loader className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {checking ? 'Checking...' : 'Check Status'}
          </button>
          {checkResult && (
            <p className="text-xs" style={{ color: checkResult.status === 'completed' ? '#4ade80' : checkResult.status === 'failed' ? '#f87171' : '#fbbf24' }}>
              {checkResult.status === 'completed' ? '✓ Done! Refresh page to see video.' :
               checkResult.status === 'failed' ? `✗ Failed: ${checkResult.detail || 'unknown error'}` :
               `Still rendering (${checkResult.status})...`}
            </p>
          )}
        </div>
      )}

      {/* No video: render button */}
      {!hasVideo && !isPending && (
        <button onClick={handleRender} disabled={rendering}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
          {rendering ? <Loader className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
          {rendering ? 'Submitting to HeyGen...' : 'Generate Video'}
        </button>
      )}
    </div>
  );
}

export default function DnnStudioDashboard() {
  const queryClient = useQueryClient();
  const [globalMessage, setGlobalMessage] = useState(null);

  const { data: allArticles = [], isLoading, refetch } = useQuery({
    queryKey: ['dnnStudioAll'],
    queryFn: () => appClient.entities.DnnArticle.list('-generated_date', 100),
    refetchInterval: 60000,
  });

  const published = allArticles.filter(a => a.status === 'published' || a.status === 'blasted');
  const withVideo = allArticles.filter(a => a.video_url && !a.video_url.startsWith('heygen:pending:'));
  const pending = allArticles.filter(a => a.video_url?.startsWith('heygen:pending:'));
  const noVideo = allArticles.filter(a => !a.video_url || a.video_url === '');

  const handleRender = async (articleId) => {
    setGlobalMessage(null);
    const res = await appClient.functions.invoke('heygenRenderVideo', {
      article_id: articleId,
      avatar_id: DEFAULT_AVATAR_ID,
    });
    if (res.data?.video_id) {
      setGlobalMessage({ type: 'success', text: `✓ Render job submitted. Job ID: ${res.data.video_id}. Check status in ~2-3 minutes.` });
    } else {
      setGlobalMessage({ type: 'error', text: `✗ Render failed: ${res.data?.error || 'Unknown error'}` });
    }
    refetch();
    return res.data;
  };

  const handleCheck = async (videoId, articleId) => {
    const res = await appClient.functions.invoke('heygenCheckVideo', { video_id: videoId, article_id: articleId });
    if (res.data?.status === 'completed') {
      refetch();
    }
    return res.data;
  };

  const handleClearVideo = async (articleId) => {
    if (!confirm('This will clear the current video URL so you can re-render. Continue?')) return;
    await appClient.entities.DnnArticle.update(articleId, { video_url: null });
    refetch();
  };

  const handleCheckAllPending = async () => {
    setGlobalMessage({ type: 'info', text: `Checking ${pending.length} pending render(s)...` });
    let completed = 0;
    for (const article of pending) {
      const videoId = article.video_url.replace('heygen:pending:', '');
      const res = await appClient.functions.invoke('heygenCheckVideo', { video_id: videoId, article_id: article.id });
      if (res.data?.status === 'completed') completed++;
    }
    setGlobalMessage({ type: 'success', text: `Check complete. ${completed} of ${pending.length} render(s) finished.` });
    refetch();
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(13,13,13,0.97)', borderBottom: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <Link to="/admin/dnn/news-feed">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </Link>
          <img src={DNN_LOGO} alt="DNN" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>DNN Studio</p>
            <p className="text-[10px] tracking-widest uppercase text-slate-600">Video Production Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/dnn/script-review"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
            <FileText className="w-3 h-3" /> Script Review
          </Link>
          <button onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}>
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* How it works */}
        <div className="rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: '#D4AF37' }}>How Video Production Works</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { n: '1', title: 'Click "Generate Video"', desc: 'Submits the article text + HeyGen avatar to render a talking-head MP4. Takes ~2-5 minutes.' },
              { n: '2', title: 'Click "Check Status"', desc: 'Polls HeyGen. When done, the MP4 is downloaded and saved permanently to DNN storage.' },
              { n: '3', title: 'Video appears on DNN News', desc: 'The permanent URL is saved to the article. It will never expire or go dead.' },
            ].map(s => (
              <div key={s.n} className="rounded-lg p-3 flex gap-3 items-start" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-black"
                  style={{ background: '#D4AF37' }}>{s.n}</div>
                <div>
                  <p className="text-xs font-bold text-white">{s.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global message */}
        {globalMessage && (
          <div className="rounded-xl px-5 py-4 flex items-start gap-3"
            style={{
              background: globalMessage.type === 'error' ? 'rgba(248,113,113,0.1)' : globalMessage.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
              border: `1px solid ${globalMessage.type === 'error' ? 'rgba(248,113,113,0.3)' : globalMessage.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`
            }}>
            <p className="text-sm" style={{ color: globalMessage.type === 'error' ? '#f87171' : globalMessage.type === 'success' ? '#4ade80' : '#fbbf24' }}>
              {globalMessage.text}
            </p>
            <button onClick={() => setGlobalMessage(null)} className="ml-auto text-slate-600 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Articles', value: allArticles.length, color: '#D4AF37', icon: FileText },
            { label: 'Videos Ready', value: withVideo.length, color: '#4ade80', icon: CheckCircle },
            { label: 'Rendering', value: pending.length, color: '#fbbf24', icon: Loader },
            { label: 'Need Video', value: noVideo.length, color: '#f87171', icon: AlertCircle },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: '#1a1a1a', border: `1px solid ${s.color}25` }}>
              <s.icon className="w-5 h-5 shrink-0" style={{ color: s.color }} />
              <div>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[11px] text-slate-600">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending renders — check all button */}
        {pending.length > 0 && (
          <div className="rounded-xl px-5 py-4 flex items-center justify-between gap-3"
            style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <div className="flex items-center gap-3">
              <Loader className="w-4 h-4 animate-spin shrink-0" style={{ color: '#fbbf24' }} />
              <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>
                {pending.length} render job{pending.length > 1 ? 's' : ''} in progress
              </p>
            </div>
            <button onClick={handleCheckAllPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black hover:opacity-80"
              style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}>
              <RefreshCw className="w-3 h-3" /> Check All
            </button>
          </div>
        )}

        {/* Article video grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#D4AF37' }} />
          </div>
        ) : (
          <div>
            <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: '#D4AF37' }}>
              All Articles — Video Status
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allArticles.map(article => (
                <VideoCard
                  key={article.id}
                  article={article}
                  onRender={handleRender}
                  onCheck={handleCheck}
                  onClearVideo={handleClearVideo}
                />
              ))}
            </div>
            {allArticles.length === 0 && (
              <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
                <p className="text-sm text-slate-600">No articles found. Generate articles from the DNN News Feed first.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}