import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play } from 'lucide-react';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

/**
 * RoadmapCharlieCircle — replaces the yellow "Watch Bob & Charlie" banner.
 * Fixed top-right Charlie circle that opens the QADuoPresenter playing the full
 * roadmap sequence (intro → all Q&A → outro).
 */
export default function RoadmapCharlieCircle() {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['roadmapClips'],
    queryFn: () => appClient.entities.RoadmapClip.list(),
  });

  const intro = clips.find(c => c.kind === 'intro');
  const outro = clips.find(c => c.kind === 'outro');
  const qas = clips.filter(c => c.kind === 'qa').sort((a, b) => (a.faqIndex ?? 0) - (b.faqIndex ?? 0));

  const introReady = intro?.charlieStatus === 'completed' && !!intro?.charlieVideoUrl;

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

  if (!introReady) return null;

  return (
    <>
      <button
        onClick={playFull}
        aria-label="Hear Charlie introduce the roadmap"
        className="fixed top-32 right-6 z-40 w-[126px] h-[126px] md:w-36 md:h-36 transition-all hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
          style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
          <video
            src={intro.charlieVideoUrl}
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
            className="w-full h-full object-cover pointer-events-none"
          />
        </span>
        <span className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: GOLD, border: '2px solid #0d0d0d' }}>
          <Play className="w-5 h-5 ml-0.5" style={{ color: '#000' }} />
        </span>
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: '#0d0d0d', color: GOLD, border: `1px solid ${GOLD}` }}>
          CHARLIE
        </span>
      </button>
      {segments && <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />}
    </>
  );
}