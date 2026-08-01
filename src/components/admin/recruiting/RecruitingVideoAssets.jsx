import React, { useState, useEffect } from 'react';
import { Copy, Check, Video } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

export default function RecruitingVideoAssets() {
  const [clips, setClips] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    appClient.entities.VettingDeskClip.list().then(setClips).catch(() => {});
  }, []);

  const assets = [];
  clips
    .sort((a, b) => (a.faqIndex ?? -1) - (b.faqIndex ?? -1))
    .forEach(c => {
      const label = c.kind === 'intro' ? 'Charlie — Network Intro'
        : c.kind === 'outro' ? 'Charlie — Closing Call-to-Action'
        : c.question;
      if (c.charlieVideoUrl) assets.push({ key: `${c.id}-c`, label: c.kind === 'qa' ? `Charlie asks: ${label}` : label, url: c.charlieVideoUrl });
      if (c.bobVideoUrl) assets.push({ key: `${c.id}-b`, label: `Bob answers: ${label}`, url: c.bobVideoUrl });
    });

  const copyUrl = (a) => {
    navigator.clipboard.writeText(a.url);
    setCopied(a.key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.3)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Video className="w-4 h-4" style={{ color: GOLD }} />
        <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>VIDEO ASSETS — VETTING DESK LIBRARY</p>
      </div>
      <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Copy any clip URL to embed in social posts, recruiting messages, or email campaigns.
      </p>
      {assets.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>No completed clips yet — check the render status.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {assets.map(a => (
            <div key={a.key} className="rounded-xl p-3 flex gap-3 items-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <video src={a.url} muted playsInline preload="metadata"
                onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
                className="w-20 h-12 rounded-lg object-cover shrink-0" style={{ background: '#000' }} />
              <p className="flex-1 text-xs text-white leading-snug min-w-0">{a.label}</p>
              <button onClick={() => copyUrl(a)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 transition-all hover:scale-105"
                style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}`, color: GOLD }}>
                {copied === a.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === a.key ? 'Copied' : 'Copy URL'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}