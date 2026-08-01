import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Save, CheckCircle, RefreshCw, AlertTriangle, Loader, ChevronDown, ChevronUp, Play, Send } from 'lucide-react';

const STATUS_STYLES = {
  new: { label: 'New', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  script_generated: { label: 'Script Generated', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  pending_review: { label: 'Pending Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  approved_for_render: { label: 'Approved — Awaiting Render', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  rendering: { label: 'Rendering', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  complete: { label: 'Complete', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  failed: { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  needs_revision: { label: 'Needs Revision', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  none: { label: 'No Status', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

function Field({ label, value, onChange, rows = 3, mono = false, placeholder = '' }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1 block">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full rounded-lg px-3 py-2 text-sm text-white resize-y ${mono ? 'font-mono' : ''}`}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
    </div>
  );
}

function ReadOnly({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <label className="text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1 block">{label}</label>
      <div className="rounded-lg px-3 py-2 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {value}
      </div>
    </div>
  );
}

export default function Shard1ScriptReviewCard({ article, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Editable draft — falls back to generated values so admin starts from AI output
  const [draft, setDraft] = useState({
    edited_opening_script: article.edited_opening_script ?? article.generated_opening_script ?? '',
    edited_body_script: article.edited_body_script ?? article.generated_body_script ?? article.body ?? '',
    edited_closing_script: article.edited_closing_script ?? article.generated_closing_script ?? '',
    edited_full_script: article.edited_full_script ?? article.generated_full_script ?? '',
    edited_lower_third_text: article.edited_lower_third_text ?? article.generated_lower_third_text ?? '',
    pronunciation_notes: article.pronunciation_notes ?? '',
    correction_notes: article.correction_notes ?? '',
  });

  const st = STATUS_STYLES[article.production_status] || STATUS_STYLES.none;
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  const persist = async (extra, successText) => {
    setSaving(true);
    setMsg(null);
    await appClient.entities.DnnArticle.update(article.id, { ...draft, ...extra });
    setSaving(false);
    setMsg({ type: 'success', text: successText });
    onChanged?.();
  };

  const handleSave = () => persist({}, 'Corrections saved.');

  const handleApprove = () =>
    persist(
      { admin_approved: true, render_requested: true, production_status: 'approved_for_render' },
      'Approved for render — n8n will pick this up.'
    );

  const handleRerender = () =>
    persist(
      {
        admin_approved: true,
        render_requested: true,
        production_status: 'approved_for_render',
        render_version: (article.render_version || 0) + 1,
        video_url: null,
        last_render_error: null,
      },
      'Re-render requested (version ' + ((article.render_version || 0) + 1) + ').'
    );

  const handleRepublish = () =>
    persist(
      { status: 'published', published_date: new Date().toISOString() },
      'Saved & republished to DNN News.'
    );

  const handleNeedsRevision = () =>
    persist(
      { admin_approved: false, render_requested: false, production_status: 'needs_revision' },
      'Marked as needs revision.'
    );

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: `1px solid ${st.color}33` }}>
      {/* Header */}
      <button onClick={() => setExpanded((e) => !e)} className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/[0.02]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
              {st.label}
            </span>
            {article.render_version > 0 && (
              <span className="text-[10px] text-slate-600">v{article.render_version}</span>
            )}
            {article.video_url && !article.video_url.startsWith('heygen:pending:') && (
              <span className="text-[10px] font-bold" style={{ color: '#4ade80' }}>● Video ready</span>
            )}
          </div>
          <p className="text-sm font-bold text-white leading-snug truncate">{article.headline}</p>
          <p className="text-[10px] text-slate-600">{article.dateline} · {article.trigger_type?.replace(/_/g, ' ')}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="pt-4" />

          {/* Complete Broadcast Script — editable (opening + body + closing) */}
          <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#D4AF37' }}>Complete Broadcast Script — Editable</p>
            <Field label="Scene 1 — Opening" value={draft.edited_opening_script} onChange={set('edited_opening_script')} rows={4} />
            <Field label="Scene 2 — News Story" value={draft.edited_body_script} onChange={set('edited_body_script')} rows={6} />
            <Field label="Scene 3 — Closing" value={draft.edited_closing_script} onChange={set('edited_closing_script')} rows={4} />
          </div>

          {/* Source content */}
          <ReadOnly label="Source Article Body" value={article.body} />

          {/* Video preview */}
          {article.video_url && !article.video_url.startsWith('heygen:pending:') && (
            <a href={article.video_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
              <Play className="w-3 h-3" /> Preview Current Video
            </a>
          )}

          {article.last_render_error && (
            <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
              Last render error: {article.last_render_error}
            </div>
          )}

          {/* Generated (read-only reference) */}
          <div className="rounded-lg p-3 space-y-3" style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#60a5fa' }}>AI-Generated (reference)</p>
            <ReadOnly label="Generated Opening (Scene 1 — DNN Open)" value={article.generated_opening_script} />
            <ReadOnly label="Generated Body (Scene 2 — News Story)" value={article.generated_body_script} />
            <ReadOnly label="Generated Closing (Scene 3 — Dyson Outro)" value={article.generated_closing_script} />
            <ReadOnly label="Generated Lower-Third Text" value={article.generated_lower_third_text} />
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#D4AF37' }}>Final Script — Editable (anchor: Charlie Simmons)</p>
            <Field label="Full Script (used for render if filled)" value={draft.edited_full_script} onChange={set('edited_full_script')} rows={6} placeholder="If filled, this overrides the generated full script for HeyGen." />
            <Field label="Lower-Third Text" value={draft.edited_lower_third_text} onChange={set('edited_lower_third_text')} rows={2} />
            <Field label="Pronunciation Notes" value={draft.pronunciation_notes} onChange={set('pronunciation_notes')} rows={2} placeholder="e.g. 'Dyson = DYE-son', 'Camas = KAM-us'" />
            <Field label="Correction Notes (internal)" value={draft.correction_notes} onChange={set('correction_notes')} rows={2} />
          </div>

          {/* Message */}
          {msg && (
            <p className="text-xs" style={{ color: msg.type === 'success' ? '#4ade80' : '#f87171' }}>{msg.text}</p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
              {saving ? <Loader className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Corrections
            </button>
            <button onClick={handleRepublish} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)' }}>
              {saving ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Save & Republish
            </button>
            <button onClick={handleApprove} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)' }}>
              <CheckCircle className="w-3 h-3" /> Approve for Render
            </button>
            <button onClick={handleRerender} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)' }}>
              <RefreshCw className="w-3 h-3" /> Request Re-render
            </button>
            <button onClick={handleNeedsRevision} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.35)' }}>
              <AlertTriangle className="w-3 h-3" /> Mark Needs Revision
            </button>
          </div>
        </div>
      )}
    </div>
  );
}