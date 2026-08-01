import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { appClient } from '@/api/appClient';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

/**
 * PortalLeadInDuo — Charlie/Bob DNN strategy dialogue lead-in.
 * Renders a gold-bordered circular trigger that plays the 3-segment
 * sequence: Charlie introduces Bob → Bob explains DNN strategy → Charlie closes.
 */
export default function PortalLeadInDuo() {
  const [clips, setClips] = useState([]);
  const [sequence, setSequence] = useState(null);

  useEffect(() => {
    appClient.entities.PortalLeadInClip.list()
      .then(setClips)
      .catch(() => {});
  }, []);

  const intro = clips.find(c => c.kind === 'intro');
  const qa = clips.find(c => c.kind === 'qa');
  const outro = clips.find(c => c.kind === 'outro');

  const introReady = intro?.charlieStatus === 'completed' && intro?.charlieVideoUrl;
  const bobReady = qa?.bobStatus === 'completed' && qa?.bobVideoUrl;

  const playSequence = () => {
    const segs = [];
    if (intro?.charlieVideoUrl) segs.push({ src: intro.charlieVideoUrl, speaker: 'charlie' });
    if (qa?.bobVideoUrl) segs.push({ src: qa.bobVideoUrl, speaker: 'bob' });
    if (outro?.charlieVideoUrl) segs.push({ src: outro.charlieVideoUrl, speaker: 'charlie' });
    if (segs.length) setSequence(segs);
  };

  if (!introReady && !bobReady) return null;

  return (
    <>
      {sequence && (
        <QADuoPresenter segments={sequence} onClose={() => setSequence(null)} />
      )}

      <div className="flex justify-center py-8">
        <button
          onClick={playSequence}
          aria-label="Hear Charlie and Bob explain the DNN strategy"
          className="relative w-[126px] h-[126px] md:w-36 md:h-36 shrink-0 transition-all hover:scale-105 active:scale-95"
        >
          <span
            className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
            style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}
          >
            {intro?.charlieVideoUrl && (
              <video
                src={intro.charlieVideoUrl}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
                className="w-full h-full object-cover pointer-events-none"
              />
            )}
          </span>
          <span
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: GOLD, border: '2px solid #0d0d0d' }}
          >
            <Play className="w-5 h-5 ml-0.5" style={{ color: '#000' }} />
          </span>
        </button>
      </div>
    </>
  );
}