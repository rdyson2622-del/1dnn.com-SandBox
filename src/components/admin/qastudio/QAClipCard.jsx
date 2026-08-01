import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Loader2, Play, RefreshCw, Check, Save, ChevronDown, ChevronUp } from 'lucide-react';

const GOLD = '#D4AF37';

const STATUS_COLORS = {
  not_started: '#888',
  rendering: '#60A5FA',
  completed: '#4ADE80',
  failed: '#F87171',
};

function Badge({ label, color }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
      {label}
    </span>
  );
}

/**
 * QAClipCard — one clip in the Q&A Script Studio.
 * Editing never triggers a render. Rendering requires explicit approval +
 * a separate Render click, and never overwrites a completed video unless
 * the admin explicitly re-renders.
 */
export default function QAClipCard({ clip, entityName, functionName, onRefresh }) {
  const [charlie, setCharlie] = useState(clip.charlieScript || '');
  const [bob, setBob] = useState(clip.bobScript || '');
  const [showSource, setShowSource] = useState(false);
  const [busy, setBusy] = useState('');

  const dirty = charlie !== (clip.charlieScript || '') || bob !== (clip.bobScript || '');
  const scriptStatus = clip.scriptStatus || 'seeded';

  const run = async (label, fn) => {
    setBusy(label);
    try { await fn(); await onRefresh(); } finally { setBusy(''); }
  };

  const save = () => run('save', async () => {
    const patch = { charlieScript: charlie, bobScript: bob, scriptStatus: 'needs_review' };
    if (!clip.originalCharlieScript && clip.charlieScript) patch.originalCharlieScript = clip.charlieScript;
    if (!clip.originalBobScript && clip.bobScript) patch.originalBobScript = clip.bobScript;
    await appClient.entities[entityName].update(clip.id, patch);
  });

  const approve = () => run('approve', async () => {
    await appClient.entities[entityName].update(clip.id, { scriptStatus: 'approved' });
  });

  const render = (role) => {
    const isRerender = clip[`${role}Status`] === 'completed';
    if (!window.confirm(`${isRerender ? 'RE-RENDER' : 'Render'} ${role === 'bob' ? "Bob's" : "Charlie's"} clip? This consumes HeyGen credits.${isRerender ? ' The current completed video URL will be replaced when the new render finishes.' : ''}`)) return;
    run(`render-${role}`, async () => {
      await appClient.functions.invoke(functionName, { action: 'start', clipId: clip.id, role });
    });
  };

  const check = (role) => run(`check-${role}`, async () => {
    await appClient.functions.invoke(functionName, { action: 'check', clipId: clip.id, role });
  });

  const title = clip.kind === 'qa'
    ? `Q${clip.faqIndex ?? ''} — ${clip.question || 'Question'}`
    : clip.kind === 'intro' ? 'Charlie Intro' : 'Charlie Outro';

  const roles = clip.kind === 'qa' ? ['charlie', 'bob'] : ['charlie'];

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-sm font-bold text-white flex-1">{title}</p>
        <div className="flex gap-1.5 items-center">
          <Badge label={scriptStatus.replace('_', ' ')}
            color={scriptStatus === 'approved' ? '#4ADE80' : scriptStatus === 'needs_review' ? '#FBBF24' : '#888'} />
          {roles.map(r => (
            <Badge key={r} label={`${r}: ${clip[`${r}Status`] || 'not_started'}`}
              color={STATUS_COLORS[clip[`${r}Status`]] || '#888'} />
          ))}
        </div>
      </div>

      {(clip.originalCharlieScript || clip.originalBobScript) && (
        <div>
          <button onClick={() => setShowSource(s => !s)}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>
            {showSource ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Source script (original)
          </button>
          {showSource && (
            <div className="mt-1 text-xs text-slate-300 space-y-2 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {clip.originalCharlieScript && <p><b style={{ color: GOLD }}>Charlie:</b> {clip.originalCharlieScript}</p>}
              {clip.originalBobScript && <p><b style={{ color: GOLD }}>Bob:</b> {clip.originalBobScript}</p>}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>Charlie script</label>
        <textarea value={charlie} onChange={e => setCharlie(e.target.value)} rows={3}
          className="w-full mt-1 p-2 rounded-lg text-xs text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', outline: 'none' }} />
      </div>
      {clip.kind === 'qa' && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>Bob script</label>
          <textarea value={bob} onChange={e => setBob(e.target.value)} rows={4}
            className="w-full mt-1 p-2 rounded-lg text-xs text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)', outline: 'none' }} />
        </div>
      )}

      {clip.errorMessage && (
        <p className="text-xs text-red-400 break-words">⚠ {clip.errorMessage}</p>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={save} disabled={!dirty || !!busy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
          style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: '1px solid rgba(212,175,55,0.4)' }}>
          {busy === 'save' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Edit
        </button>
        {scriptStatus !== 'approved' && (
          <button onClick={approve} disabled={!!busy || dirty}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
            style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.4)' }}>
            {busy === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve Script
          </button>
        )}
        {roles.map(role => {
          const st = clip[`${role}Status`] || 'not_started';
          return (
            <React.Fragment key={role}>
              <button onClick={() => render(role)} disabled={!!busy || scriptStatus !== 'approved' || st === 'rendering'}
                title={scriptStatus !== 'approved' ? 'Approve the script first' : ''}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.4)' }}>
                {busy === `render-${role}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {st === 'completed' ? `Re-render ${role}` : `Render ${role}`}
              </button>
              {st === 'rendering' && (
                <button onClick={() => check(role)} disabled={!!busy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {busy === `check-${role}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Check {role}
                </button>
              )}
              {clip[`${role}VideoUrl`] && (
                <a href={clip[`${role}VideoUrl`]} target="_blank" rel="noreferrer"
                  className="text-xs underline" style={{ color: STATUS_COLORS.completed }}>
                  ▶ {role} video
                </a>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}