import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play } from 'lucide-react';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

// Fetches the Corporate Relo Q&A clips and lets an HR manager tap a question
// to hear Charlie ask it and Bob answer it on video.
export default function CorporateReloQASection() {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['corporateReloClips'],
    queryFn: () => appClient.entities.CorporateReloClip.list(),
  });

  const intro = clips.find(c => c.kind === 'intro');
  const outro = clips.find(c => c.kind === 'outro');
  const qas = clips.filter(c => c.kind === 'qa').sort((a, b) => (a.faqIndex ?? 0) - (b.faqIndex ?? 0));

  const playQA = (clip) => {
    const segs = [];
    // Prefer combined render (one video, one credit charge) over separate clips
    if (clip.combinedVideoUrl) {
      segs.push({ src: clip.combinedVideoUrl, speaker: 'charlie' });
    } else {
      if (clip.charlieVideoUrl) segs.push({ src: clip.charlieVideoUrl, speaker: 'charlie' });
      if (clip.bobVideoUrl) segs.push({ src: clip.bobVideoUrl, speaker: 'bob' });
    }
    if (segs.length) setSegments(segs);
  };

  const playFull = () => {
    const segs = [];
    if (intro?.charlieVideoUrl) segs.push({ src: intro.charlieVideoUrl, speaker: 'charlie' });
    qas.forEach(c => {
      if (c.combinedVideoUrl) {
        segs.push({ src: c.combinedVideoUrl, speaker: 'charlie' });
      } else {
        if (c.charlieVideoUrl) segs.push({ src: c.charlieVideoUrl, speaker: 'charlie' });
        if (c.bobVideoUrl) segs.push({ src: c.bobVideoUrl, speaker: 'bob' });
      }
    });
    if (outro?.charlieVideoUrl) segs.push({ src: outro.charlieVideoUrl, speaker: 'charlie' });
    if (segs.length) setSegments(segs);
  };

  const anyVideo = clips.some(c => c.combinedVideoUrl || c.charlieVideoUrl || c.bobVideoUrl);
  if (qas.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {anyVideo && (
        <button onClick={playFull}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000', boxShadow: '0 4px 20px rgba(212,175,55,0.35)' }}>
          <Play className="w-5 h-5" fill="#000" /> Watch the Full HR Briefing
        </button>
      )}
      {qas.map(clip => (
        <button key={clip.id} onClick={() => playQA(clip)}
          disabled={!clip.combinedVideoUrl && !clip.charlieVideoUrl && !clip.bobVideoUrl}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left text-sm transition-all hover:scale-[1.01] disabled:opacity-50"
          style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}` }}>
            <Play className="w-4 h-4" style={{ color: GOLD }} />
          </span>
          <span className="text-white font-semibold">{clip.question}</span>
        </button>
      ))}
      {segments && <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />}
    </div>
  );
}