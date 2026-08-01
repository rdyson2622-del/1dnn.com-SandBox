import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Sparkles, CheckCircle, Send, Loader, ExternalLink, FileText, Clapperboard, RefreshCw } from 'lucide-react';
import Shard2Header from '@/components/shard2/Shard2Header';
import RenderStatusTracker from '@/components/shard2/RenderStatusTracker';

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)' };

const SCRIPT_STATUS_META = {
  new: { label: 'New', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  generated: { label: 'Generated', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  needs_review: { label: 'Needs Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  approved: { label: 'Approved', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

const RENDER_STATUS_META = {
  not_started: { label: 'Not started', color: '#94a3b8' },
  queued: { label: 'Queued for render', color: '#fbbf24' },
  rendering: { label: 'Rendering', color: '#a78bfa' },
  heygen_completed: { label: 'HeyGen done', color: '#60a5fa' },
  composing: { label: 'Composing', color: '#60a5fa' },
  completed: { label: 'Completed', color: '#4ade80' },
  failed: { label: 'Failed', color: '#f87171' },
};

function StatusPill({ meta }) {
  if (!meta) return null;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: meta.bg || 'rgba(255,255,255,0.06)', color: meta.color }}>
      {meta.label}
    </span>
  );
}

function ScriptEditor({ explainer, onChanged }) {
  const [script, setScript] = useState(explainer.finalScript || explainer.aiGeneratedScript || '');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setScript(explainer.finalScript || explainer.aiGeneratedScript || '');
  }, [explainer.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setMsg(null);
    const res = await appClient.functions.invoke('shard2GenerateScript', { explainerId: explainer.id });
    if (res.data?.success) {
      setScript(res.data.script || '');
      setMsg({ type: 'ok', text: 'Script generated — review and edit before approving.' });
      onChanged();
    } else {
      setMsg({ type: 'err', text: res.data?.error || 'Generation failed.' });
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await appClient.entities.CharliePageExplainer.update(explainer.id, {
      finalScript: script,
      scriptStatus: explainer.scriptStatus === 'new' ? 'needs_review' : explainer.scriptStatus,
    });
    setSaving(false);
    setMsg({ type: 'ok', text: 'Saved.' });
    onChanged();
  };

  const handleApprove = async () => {
    setSaving(true);
    await appClient.entities.CharliePageExplainer.update(explainer.id, {
      finalScript: script,
      scriptStatus: 'approved',
      approvedAt: new Date().toISOString(),
    });
    setSaving(false);
    setMsg({ type: 'ok', text: 'Approved. Click "Send to Render" to queue it for n8n.' });
    onChanged();
  };

  // Fix #1: queue for render so shard2PullApproved (approved + queued) picks it up
  const handleSendToRender = async () => {
    setSaving(true);
    await appClient.entities.CharliePageExplainer.update(explainer.id, {
      finalScript: script,
      scriptStatus: 'approved',
      renderStatus: 'queued',
      approvedAt: explainer.approvedAt || new Date().toISOString(),
    });
    setSaving(false);
    setMsg({ type: 'ok', text: 'Queued for render — n8n will pick this up.' });
    onChanged();
  };

  // Direct HeyGen render — no n8n round-trip. Starts the render, then polls
  // every 20s until the presenter clip is completed and stored.
  const handleRenderNow = async () => {
    setRendering(true);
    setMsg(null);
    // Persist the latest script first so HeyGen renders exactly what's on screen
    await appClient.entities.CharliePageExplainer.update(explainer.id, { finalScript: script });
    const startRes = await appClient.functions.invoke('shard2RenderPresenterClip', {
      action: 'start', explainerId: explainer.id,
    });
    if (!startRes.data?.success) {
      setMsg({ type: 'err', text: startRes.data?.error || 'HeyGen render failed to start.' });
      setRendering(false);
      onChanged();
      return;
    }
    setMsg({ type: 'ok', text: 'Rendering in HeyGen — this usually takes 2–5 minutes...' });
    onChanged();

    const poll = async () => {
      const res = await appClient.functions.invoke('shard2RenderPresenterClip', {
        action: 'check', explainerId: explainer.id,
      });
      const status = res.data?.status;
      if (status === 'completed') {
        setMsg({ type: 'ok', text: 'Video completed! It is now live on the page.' });
        setRendering(false);
        onChanged();
      } else if (status === 'failed') {
        setMsg({ type: 'err', text: res.data?.error || 'HeyGen render failed.' });
        setRendering(false);
        onChanged();
      } else {
        setTimeout(poll, 20000);
      }
    };
    setTimeout(poll, 20000);
  };

  return (
    <div className="rounded-xl p-5 space-y-4" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold text-white">{explainer.pageTitle}</p>
          {explainer.pageUrl && (
            <a href={explainer.pageUrl} target="_blank" rel="noreferrer"
              className="text-[11px] text-slate-500 hover:text-yellow-400 inline-flex items-center gap-1">
              {explainer.pageUrl} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill meta={SCRIPT_STATUS_META[explainer.scriptStatus]} />
          <span className="text-[10px] font-bold" style={{ color: RENDER_STATUS_META[explainer.renderStatus]?.color }}>
            {RENDER_STATUS_META[explainer.renderStatus]?.label}
          </span>
        </div>
      </div>

      {explainer.aiGeneratedOverview && (
        <p className="text-[11px] text-slate-500 italic leading-relaxed">{explainer.aiGeneratedOverview}</p>
      )}

      <RenderStatusTracker explainer={explainer} onStatusChange={onChanged} />

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
          style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
          {generating ? <Loader className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {generating ? 'Generating...' : (explainer.aiGeneratedScript ? 'Regenerate' : 'Generate Script')}
        </button>
      </div>

      <textarea value={script} onChange={e => setScript(e.target.value)} rows={8}
        placeholder="Charlie's spoken script will appear here. Review and edit before approving."
        className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none focus:outline-none leading-relaxed" style={inputStyle} />

      {msg && (
        <p className="text-xs" style={{ color: msg.type === 'err' ? '#f87171' : '#4ade80' }}>{msg.text}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleSave} disabled={saving}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Save Draft
        </button>
        <button onClick={handleApprove} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
          style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
          <CheckCircle className="w-3 h-3" /> Approve
        </button>
        <button onClick={handleSendToRender} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-black disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
          <Send className="w-3 h-3" /> Send to Render
        </button>
        <button onClick={handleRenderNow} disabled={rendering || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
          style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.4)' }}>
          {rendering ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Clapperboard className="w-3 h-3" />}
          {rendering ? 'Rendering in HeyGen...' : 'Render Now (HeyGen Direct)'}
        </button>
      </div>
    </div>
  );
}

export default function Shard2Scripts() {
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const focusId = params.get('explainer');

  const { data: explainers = [], isLoading } = useQuery({
    queryKey: ['shard2Explainers'],
    queryFn: () => appClient.entities.CharliePageExplainer.list('-created_date', 500),
  });

  const onChanged = () => queryClient.invalidateQueries({ queryKey: ['shard2Explainers'] });

  const sorted = focusId
    ? [...explainers].sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : 0))
    : explainers;

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Shard2Header />
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#D4AF37' }}>Script Editor & Review</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader className="w-6 h-6 animate-spin" style={{ color: '#D4AF37' }} /></div>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm text-slate-500">No explainers yet. Create one from the Pages Manager.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(ex => (
              <ScriptEditor key={ex.id} explainer={ex} onChanged={onChanged} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}