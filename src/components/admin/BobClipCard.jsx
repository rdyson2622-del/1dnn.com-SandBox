import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Play, RefreshCw, Save } from 'lucide-react';

const GOLD = '#D4AF37';

const STATUS_STYLES = {
  draft: { label: 'Draft', bg: 'rgba(255,255,255,0.1)', color: '#ccc' },
  rendering: { label: 'Rendering…', bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  completed: { label: 'Completed', bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  failed: { label: 'Failed', bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
};

export default function BobClipCard({ clip, onChanged }) {
  const [question, setQuestion] = useState(clip.question);
  const [script, setScript] = useState(clip.answerScript);
  const [busy, setBusy] = useState(false);
  const s = STATUS_STYLES[clip.status] || STATUS_STYLES.draft;
  const dirty = question !== clip.question || script !== clip.answerScript;

  const save = async () => {
    setBusy(true);
    await appClient.entities.BobAnswerClip.update(clip.id, { question, answerScript: script, status: 'draft' });
    setBusy(false);
    onChanged();
  };

  const toggleActive = async () => {
    await appClient.entities.BobAnswerClip.update(clip.id, { isActive: !clip.isActive });
    onChanged();
  };

  const render = async () => {
    setBusy(true);
    await appClient.functions.invoke('bobAnswerLibrary', { action: 'start', clipId: clip.id }).catch(() => {});
    setBusy(false);
    onChanged();
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.25)', opacity: clip.isActive ? 1 : 0.5 }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 bg-transparent text-sm font-bold text-white outline-none border-b border-transparent focus:border-white/20 pb-1"
        />
        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide" style={{ background: s.bg, color: s.color }}>
          {s.label}
        </span>
      </div>

      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        rows={3}
        className="w-full rounded-xl p-3 text-xs leading-relaxed resize-y outline-none"
        style={{ background: '#1a1a1a', color: '#ddd', border: '1px solid #2a2a2a' }}
      />

      {clip.status === 'failed' && clip.errorMessage && (
        <p className="mt-2 text-[10px] text-red-400">{clip.errorMessage}</p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {dirty && (
          <button onClick={save} disabled={busy}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: GOLD, color: '#000' }}>
            <Save className="w-3 h-3" /> Save Script
          </button>
        )}
        {(clip.status === 'draft' || clip.status === 'failed') && !dirty && (
          <button onClick={render} disabled={busy}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#000', color: '#fff', border: `1px solid ${GOLD}` }}>
            <RefreshCw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} /> Render with Bob
          </button>
        )}
        <button onClick={toggleActive}
          className="px-3 py-1.5 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#ccc' }}>
          {clip.isActive ? 'Disable in chat' : 'Enable in chat'}
        </button>
        {clip.videoUrl && (
          <a href={clip.videoUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
            <Play className="w-3 h-3" /> Preview video
          </a>
        )}
      </div>
    </div>
  );
}