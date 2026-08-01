import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';

const GOLD = '#D4AF37';
const BROADCAST_VIDEO = '/assets/dnn-broadcast-4k.mp4';

export default function BroadcastShow() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    video?.play().catch(() => {
      // Browsers may require one click before starting a video with sound.
    });
    return () => {
      try { video?.pause(); } catch (_) {}
    };
  }, []);

  return (
    <main className="fixed inset-0 z-[400] overflow-hidden bg-black" aria-label="DNN 4K broadcast">
      <video
        ref={videoRef}
        src={BROADCAST_VIDEO}
        autoPlay
        muted={muted}
        controls
        playsInline
        preload="auto"
        className="w-screen h-screen bg-black object-contain"
        aria-label="Charlie Simmons and Bob Dyson DNN Real Estate News broadcast"
      />

      <button
        onClick={() => {
          setMuted((current) => !current);
          videoRef.current?.play().catch(() => {});
        }}
        className="absolute left-4 bottom-4 z-20 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-transform hover:scale-105"
        style={{ background: 'rgba(0,0,0,0.76)', border: `1px solid ${GOLD}`, color: GOLD, backdropFilter: 'blur(8px)' }}
        aria-label={muted ? 'Turn broadcast sound on' : 'Mute broadcast'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {muted ? 'Tap for sound' : 'Sound on'}
      </button>

      <button
        onClick={() => { window.location.href = '/?choose=1'; }}
        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105"
        style={{ background: 'rgba(0,0,0,0.72)', border: `1px solid ${GOLD}`, backdropFilter: 'blur(8px)' }}
        aria-label="Close DNN broadcast"
      >
        <X className="w-5 h-5" style={{ color: GOLD }} />
      </button>
    </main>
  );
}
