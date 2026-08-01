import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play } from 'lucide-react';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

/**
 * LenderDuo — Charlie-only video circle for the Financial Services page.
 * Uses HeyGen-rendered clips from the LenderClip entity.
 * Positioned top-right below the nav bar.
 */
export default function LenderDuo() {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['lenderClips'],
    queryFn: () => appClient.entities.LenderClip.list(),
  });

  const sorted = clips.sort((a, b) => (a.faqIndex ?? 0) - (b.faqIndex ?? 0));

  // Build interleaved segments: Charlie asks, Bob answers — per clip
  const allSegs = [];
  for (const c of sorted) {
    if (c.charlieStatus === 'completed' && c.charlieVideoUrl) {
      allSegs.push({ src: c.charlieVideoUrl, speaker: 'charlie' });
    }
    if (c.bobStatus === 'completed' && c.bobVideoUrl) {
      allSegs.push({ src: c.bobVideoUrl, speaker: 'bob' });
    }
  }

  const firstReady = allSegs[0] || null;

  const playFull = () => {
    if (allSegs.length) setSegments(allSegs);
  };

  // Placeholder while HeyGen renders are in progress
  if (!firstReady) {
    return (
      <div
        aria-label="Charlie is preparing his presentation"
        className="fixed top-32 right-6 z-40 w-[126px] h-[126px] md:w-36 md:h-36 flex flex-col items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
          style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${GOLD}40`, borderTopColor: GOLD }} />
            <span className="text-[8px] font-black tracking-widest uppercase text-center leading-tight" style={{ color: GOLD }}>Preparing</span>
          </div>
        </span>
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: '#0d0d0d', color: GOLD, border: `1px solid ${GOLD}` }}>
          MEET CHARLIE
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={playFull}
        aria-label="Hear Charlie explain the lending process"
        className="fixed top-32 right-6 z-40 w-[126px] h-[126px] md:w-36 md:h-36 transition-all hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
          style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
          <video
            src={firstReady.src}
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
          MEET CHARLIE
        </span>
      </button>
      {segments && <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />}
    </>
  );
}