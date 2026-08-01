import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { ChevronDown, ChevronUp, RefreshCw, Trash2, ExternalLink, AlertTriangle, ListChecks, CalendarClock, Loader2 } from 'lucide-react';

const GOLD = '#D4AF37';

const RISK_COLORS = {
  low: { bg: 'rgba(74,222,128,0.15)', text: '#4ade80', border: 'rgba(74,222,128,0.4)' },
  medium: { bg: 'rgba(250,204,21,0.15)', text: '#facc15', border: 'rgba(250,204,21,0.4)' },
  high: { bg: 'rgba(251,146,60,0.15)', text: '#fb923c', border: 'rgba(251,146,60,0.4)' },
  critical: { bg: 'rgba(248,113,113,0.15)', text: '#f87171', border: 'rgba(248,113,113,0.4)' },
};

const STATUS_LABELS = {
  uploaded: { label: 'Queued', color: '#9ca3af' },
  reviewing: { label: 'AI Reviewing…', color: GOLD },
  reviewed: { label: 'Reviewed', color: '#4ade80' },
  failed: { label: 'Review Failed', color: '#f87171' },
};

const SOURCE_LABELS = {
  dre: 'DRE',
  association_of_realtors: 'C.A.R.',
  title_company: 'Title',
  escrow_company: 'Escrow',
  brokerage_internal: 'Internal',
  other: 'Other',
};

function Section({ icon: Icon, title, items, color }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-[11px] font-black tracking-wider uppercase mb-1.5 flex items-center gap-1.5" style={{ color }}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-white leading-snug pl-4 relative">
            <span className="absolute left-0" style={{ color }}>•</span>{it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ComplianceDocCard({ doc, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [working, setWorking] = useState(false);

  const status = STATUS_LABELS[doc.status] || STATUS_LABELS.uploaded;
  const risk = doc.risk_level ? RISK_COLORS[doc.risk_level] : null;

  const rerun = async () => {
    setWorking(true);
    try {
      await appClient.functions.invoke('complianceReviewDocument', { documentId: doc.id });
    } finally {
      setWorking(false);
      onChanged?.();
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${doc.file_name}" and its review?`)) return;
    await appClient.entities.ComplianceDocument.delete(doc.id);
    onChanged?.();
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}>
      {/* Header row */}
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{doc.file_name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {doc.document_type || 'Type pending'} · {SOURCE_LABELS[doc.source] || 'Other'} · {new Date(doc.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        {risk && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"
            style={{ background: risk.bg, color: risk.text, border: `1px solid ${risk.border}` }}>
            {doc.risk_level} risk
          </span>
        )}
        {doc.status === 'reviewed' ? (
          <button
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Hide full review' : 'View full review'}
            className="text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: status.color, border: '1px solid rgba(74,222,128,0.35)', background: 'rgba(74,222,128,0.08)' }}
          >
            {status.label}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: status.color }}>
            {doc.status === 'reviewing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {status.label}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <a href={doc.file_url} target="_blank" rel="noreferrer" title="Open original document"
            className="p-2 rounded-lg hover:bg-white/5" style={{ color: GOLD }}>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button onClick={rerun} disabled={working || doc.status === 'reviewing'} title="Re-run AI review"
            className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-40" style={{ color: GOLD }}>
            <RefreshCw className={`w-4 h-4 ${working ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={remove} title="Delete" className="p-2 rounded-lg hover:bg-white/5 text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
          {doc.status === 'reviewed' && (
            <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: GOLD }}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Condensed opinion — always visible once reviewed */}
      {doc.status === 'reviewed' && doc.ai_summary && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{doc.ai_summary}</p>
        </div>
      )}

      {doc.status === 'failed' && doc.error_message && (
        <div className="px-4 pb-3">
          <p className="text-xs text-red-400">Error: {doc.error_message}</p>
        </div>
      )}

      {/* Full review details */}
      {expanded && doc.status === 'reviewed' && (
        <div className="px-4 pb-4 pt-2 space-y-4" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
          <div>
            <p className="text-[11px] font-black tracking-wider uppercase mb-1.5" style={{ color: GOLD }}>Compliance Opinion</p>
            <p className="text-sm text-white leading-relaxed">{doc.ai_opinion}</p>
          </div>
          <Section icon={AlertTriangle} title="Red Flags" items={doc.red_flags} color="#f87171" />
          <Section icon={ListChecks} title="Missing / Incomplete" items={doc.missing_items} color="#fb923c" />
          <Section icon={CalendarClock} title="Key Dates & Deadlines" items={doc.key_dates} color={GOLD} />
        </div>
      )}
    </div>
  );
}