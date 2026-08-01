import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play } from 'lucide-react';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

/**
 * DnnComparisonCircle — Charlie + Bob duo circle for the "Why DNN Is Different"
 * competitive comparison section. Reports the research findings and positions
 * Dyson as the only news network that offers solutions.
 */
export default function DnnComparisonCircle() {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['dnnComparisonClips'],
    queryFn: () => appClient.entities.DnnComparisonClip.list('faqIndex'),
  });

  const sorted = [...clips].sort((a, b) => (a.faqIndex ?? 0) - (b.faqIndex ?? 0));
  const firstReady = sorted.find(c => c.charlieStatus === 'completed' && c.charlieVideoUrl);

  const playFull = () => {
    const segs = [];
    for (const c of sorted) {
      if (c.charlieStatus === 'completed' && c.charlieVideoUrl) {
        segs.push({ src: c.charlieVideoUrl, speaker: 'charlie' });
      }
      if (c.bobStatus === 'completed' && c.bobVideoUrl) {
        segs.push({ src: c.bobVideoUrl, speaker: 'bob' });
      }
    }
    if (segs.length) setSegments(segs);
  };

  if (!firstReady) return null;

  return (
    <>
      <div className="flex flex-col items-center gap-3 mb-8">
        <button
          onClick={playFull}
          aria-label="Hear Charlie and Bob explain why DNN is different"
          className="relative w-[126px] h-[126px] md:w-36 md:h-36 transition-all hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
            style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
            <video
              src={firstReady.charlieVideoUrl}
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
            WHY DNN?
          </span>
        </button>
        <p className="text-xs font-bold text-center max-w-[200px]" style={{ color: '#4a4a4a' }}>
          Tap to hear Charlie & Bob explain why DNN is the only network that solves problems
        </p>
      </div>

      {segments && <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />}
    </>
  );
}