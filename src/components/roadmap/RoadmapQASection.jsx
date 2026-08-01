import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play } from 'lucide-react';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

// Fetches the Relocation Roadmap explainer clips: Charlie introduces each of
// the 8 phases and Bob Dyson answers with exactly what Dyson & Dyson executes.
export default function RoadmapQASection() {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['roadmapClips'],
    queryFn: () => appClient.entities.RoadmapClip.list(),
  });

  const intro = clips.find(c => c.kind === 'intro');
  const outro = clips.find(c => c.kind === 'outro');
  const qas = clips.filter(c => c.kind === 'qa').sort((a, b) => (a.faqIndex ?? 0) - (b.faqIndex ?? 0));

  const playFull = () => {
    const segs = [];
    if (intro?.charlieVideoUrl) segs.push({ src: intro.charlieVideoUrl, speaker: 'charlie' });
    qas.forEach(c => {
      if (c.charlieVideoUrl) segs.push({ src: c.charlieVideoUrl, speaker: 'charlie' });
      if (c.bobVideoUrl) segs.push({ src: c.bobVideoUrl, speaker: 'bob' });
    });
    if (outro?.charlieVideoUrl) segs.push({ src: outro.charlieVideoUrl, speaker: 'charlie' });
    if (segs.length) setSegments(segs);
  };

  const anyVideo = clips.some(c => c.charlieVideoUrl || c.bobVideoUrl);
  if (!anyVideo) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 pb-8">
      <button onClick={playFull}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.02]"
        style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000', boxShadow: '0 4px 20px rgba(212,175,55,0.35)' }}>
        <Play className="w-5 h-5" fill="#000" /> Watch Bob &amp; Charlie Walk the Roadmap
      </button>
      {segments && <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />}
    </div>
  );
}

// Compact per-phase play badge shown on the phase header row itself.
// Visible to everyone — clicking it plays Charlie's question + Bob's answer
// for that phase without expanding the card.
export function RoadmapPhasePlayBadge({ phaseNumber }) {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['roadmapClips'],
    queryFn: () => appClient.entities.RoadmapClip.list(),
  });

  const clip = clips.find(c => c.kind === 'qa' && c.faqIndex === phaseNumber);
  if (!clip || (!clip.charlieVideoUrl && !clip.bobVideoUrl)) return null;

  const play = (e) => {
    e.stopPropagation();
    const segs = [];
    if (clip.charlieVideoUrl) segs.push({ src: clip.charlieVideoUrl, speaker: 'charlie' });
    if (clip.bobVideoUrl) segs.push({ src: clip.bobVideoUrl, speaker: 'bob' });
    if (segs.length) setSegments(segs);
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={play}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') play(e); }}
        aria-label={`Hear Bob explain Phase ${phaseNumber}`}
        title={`Hear Bob explain Phase ${phaseNumber}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shrink-0 cursor-pointer transition-all hover:scale-105"
        style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}` }}
      >
        <Play className="w-3 h-3" fill={GOLD} style={{ color: GOLD }} />
        <span className="text-[10px] font-black tracking-wide uppercase hidden sm:inline" style={{ color: GOLD }}>
          Bob explains
        </span>
      </span>
      {segments && (
        <span onClick={(e) => e.stopPropagation()}>
          <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />
        </span>
      )}
    </>
  );
}

// Per-phase play button used inside each expanded phase card
export function RoadmapPhasePlay({ phaseNumber }) {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['roadmapClips'],
    queryFn: () => appClient.entities.RoadmapClip.list(),
  });

  const clip = clips.find(c => c.kind === 'qa' && c.faqIndex === phaseNumber);
  if (!clip || (!clip.charlieVideoUrl && !clip.bobVideoUrl)) return null;

  const play = () => {
    const segs = [];
    if (clip.charlieVideoUrl) segs.push({ src: clip.charlieVideoUrl, speaker: 'charlie' });
    if (clip.bobVideoUrl) segs.push({ src: clip.bobVideoUrl, speaker: 'bob' });
    if (segs.length) setSegments(segs);
  };

  return (
    <>
      <button onClick={play}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(212,175,55,0.1)', border: `1px solid ${GOLD}`, color: '#fff' }}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}` }}>
          <Play className="w-3.5 h-3.5" style={{ color: GOLD }} />
        </span>
        Hear Bob explain Phase {phaseNumber}
      </button>
      {segments && <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />}
    </>
  );
}