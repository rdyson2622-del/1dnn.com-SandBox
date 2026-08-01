import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Play } from 'lucide-react';
import InlineCharliePlayer from '@/components/charlie/InlineCharliePlayer';

const GOLD = '#D4AF37';

/**
 * AIAssistantsCharlieCircle — Charlie-only video circle for the 21 AI Assistants page.
 * Uses HeyGen-rendered clips from the AIAssistantClip entity.
 * Positioned top-right below the nav bar.
 */
export default function AIAssistantsCharlieCircle() {
  const [segments, setSegments] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['aiAssistantClips'],
    queryFn: () => appClient.entities.AIAssistantClip.list(),
  });

  const sorted = clips.sort((a, b) => (a.faqIndex ?? 0) - (b.faqIndex ?? 0));
  const firstReady = sorted.find(c => c.charlieStatus === 'completed' && !!c.charlieVideoUrl);

  const playFull = () => {
    const segs = sorted
      .filter(c => c.charlieStatus === 'completed' && c.charlieVideoUrl)
      .map(c => ({ src: c.charlieVideoUrl, speaker: 'charlie' }));
    if (segs.length) setSegments(segs);
  };

  if (!firstReady) return null;

  return (
    <>
      <button
        onClick={playFull}
        aria-label="Hear Charlie explain the 21 AI Assistants"
        className="fixed top-32 right-6 z-40 w-[126px] h-[126px] md:w-36 md:h-36 transition-all hover:scale-105 active:scale-95"
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
          MEET CHARLIE
        </span>
      </button>
      {segments && <InlineCharliePlayer segments={segments} onClose={() => setSegments(null)} />}
    </>
  );
}