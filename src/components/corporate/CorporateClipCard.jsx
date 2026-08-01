import React from 'react';

const GOLD = '#D4AF37';

const STATUS_COLORS = {
  not_started: '#94a3b8',
  rendering: '#fbbf24',
  completed: '#4ade80',
  failed: '#f87171',
};

function RoleRow({ label, status, videoUrl }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-white font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider" style={{ color: STATUS_COLORS[status] || '#94a3b8' }}>
          {status || 'not_started'}
        </span>
        {videoUrl && (
          <a href={videoUrl} target="_blank" rel="noreferrer"
            className="px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}>
            ▶ Preview
          </a>
        )}
      </div>
    </div>
  );
}

export default function CorporateClipCard({ clip }) {
  const label = clip.kind === 'intro' ? 'INTRO' : clip.kind === 'outro' ? 'OUTRO' : `Q${(clip.faqIndex ?? 0) + 1}`;
  return (
    <div className="p-4 rounded-xl space-y-2" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>{label}</span>
        {clip.question && <span className="text-sm font-bold text-white truncate">{clip.question}</span>}
      </div>
      {clip.charlieScript && <RoleRow label="Charlie" status={clip.charlieStatus} videoUrl={clip.charlieVideoUrl} />}
      {clip.bobScript && <RoleRow label="Bob" status={clip.bobStatus} videoUrl={clip.bobVideoUrl} />}
      {clip.errorMessage && <p className="text-xs" style={{ color: '#f87171' }}>{clip.errorMessage}</p>}
    </div>
  );
}