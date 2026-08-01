import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { appClient } from '@/api/appClient';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

/**
 * SolveMyStoryPresenter — Charlie circle for the Solve My Story page.
 * Plays the Charlie intro (page explanation + Bob handoff) followed by
 * Bob's AI vision message in the duo talk box.
 */
export default function SolveMyStoryPresenter() {
  const [segments, setSegments] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    appClient.entities.SolveMyStoryClip.list('faqIndex')
      .then((clips) => {
        const segs = [];
        for (const c of clips) {
          if (c.charlieVideoUrl && c.charlieStatus === 'completed') {
            segs.push({ src: c.charlieVideoUrl, speaker: 'charlie' });
          }
          if (c.bobVideoUrl && c.bobStatus === 'completed') {
            segs.push({ src: c.bobVideoUrl, speaker: 'bob' });
          }
        }
        setSegments(segs);
      })
      .catch(() => setSegments([]));
  }, []);

  if (!segments || segments.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Hear Charlie explain this page"
        className="fixed top-32 right-6 z-40 w-[126px] h-[126px] md:w-36 md:h-36 transition-all hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
          style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
          <video
            src={segments[0].src}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => { e.target.currentTime = 1.5; }}
            className="w-full h-full object-cover pointer-events-none"
            style={{ transform: 'scale(1.35)' }}
          />
        </span>
        <span className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: GOLD, border: '2px solid #0d0d0d' }}>
          <Play className="w-5 h-5 ml-0.5" style={{ color: '#000' }} />
        </span>
      </button>

      {open && <QADuoPresenter segments={segments} onClose={() => setOpen(false)} />}
    </>
  );
}