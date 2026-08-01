import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import ChromaKeyVideo from '@/components/dnn/ChromaKeyVideo';
import { DNN_STING_URL } from '@/components/dnn/DnnStingVideo';

const GOLD = '#D4AF37';
const STUDIO_BG = '/assets/studio-bg.png';

// Plays a clip sequence over the full studio background: Charlie appears in a
// bordered box in the lower left; Bob clips appear in a remote-correspondent
// box in the upper right while Charlie holds his last frame.
export default function TagTeamBroadcastPlayer({ clips, onEnded }) {
  const [phase, setPhase] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [stingPhase, setStingPhase] = useState('intro'); // 'intro' | null | 'outro'
  const stingRef = useRef(null);
  const charlieRef = useRef(null);
  const current = clips[phase];

  // Auto-play intro sting on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const v = stingRef.current;
      if (v) {
        v.muted = false;
        v.play().catch(() => {
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleStingEnded = () => {
    if (stingPhase === 'intro') {
      setStingPhase(null);
    } else if (stingPhase === 'outro') {
      onEnded?.();
    }
  };

  const handleBroadcastEnded = () => {
    setStingPhase('outro');
  };

  // The Charlie video shown full-screen: current clip if Charlie, otherwise the last Charlie clip
  const charlieUrl = useMemo(() => {
    for (let i = phase; i >= 0; i--) {
      if (clips[i].role === 'charlie') return clips[i].videoUrl;
    }
    return clips.find(c => c.role === 'charlie')?.videoUrl;
  }, [phase, clips]);

  const advance = () => {
    if (phase + 1 < clips.length) setPhase(phase + 1);
    else handleBroadcastEnded();
  };

  const isBobPhase = current?.role === 'bob';

  return (
    <div className="relative w-full h-full">
      {/* DNN Logo Sting — intro and outro */}
      {stingPhase && (
        <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: '#000' }}>
          <video
            ref={stingRef}
            src={DNN_STING_URL}
            autoPlay
            playsInline
            onEnded={handleStingEnded}
            className="w-full h-full object-contain"
          />
          <button
            onClick={() => { if (stingPhase === 'outro') onEnded?.(); else handleStingEnded(); }}
            aria-label="Skip"
            className="absolute bottom-6 right-6 z-30 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${GOLD}`, color: GOLD }}
          >
            {stingPhase === 'outro' ? 'Close' : 'Skip Intro'}
          </button>
        </div>
      )}

      {/* Studio background — full frame so the national wall map stays visible */}
      <img src={STUDIO_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />

      {/* Charlie — bordered anchor box, lower left */}
      <div className="absolute" style={{ bottom: '2%', left: '1%', width: '24%' }}>
        <div className="rounded-lg overflow-hidden"
          style={{ border: `2px solid ${GOLD}`, boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.35)', background: '#000' }}>
          <div className="w-full overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
            <ChromaKeyVideo
              ref={charlieRef}
              src={charlieUrl}
              className="w-full h-full block object-cover"
              style={{ transform: 'scale(1.35)', transformOrigin: 'center bottom' }}
              onEnded={() => { if (!isBobPhase) advance(); }}
              onPlayBlocked={() => setBlocked(true)}
            />
          </div>
          <div className="px-2 py-1 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #1a1a1a, #000)', borderTop: `1px solid rgba(212,175,55,0.5)` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: '#ef4444' }} />
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.15em] uppercase truncate" style={{ color: GOLD }}>
              CHARLIE SIMMONS · DNN NEWS DESK
            </span>
          </div>
        </div>
      </div>

      {/* Bob — remote correspondent box, upper right */}
      {isBobPhase && (
        <div className="absolute dnn-remote-box" style={{ bottom: '2%', right: '1%', width: '24%' }}>
          <div className="rounded-lg overflow-hidden"
            style={{ border: `2px solid ${GOLD}`, boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.35)', background: '#000' }}>
            <div className="w-full overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
              <video
                src={current.videoUrl}
                autoPlay
                playsInline
                className="w-full h-full block object-cover"
                onEnded={advance}
              />
            </div>
            <div className="px-2 py-1 flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #1a1a1a, #000)', borderTop: `1px solid rgba(212,175,55,0.5)` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: '#ef4444' }} />
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.15em] uppercase truncate" style={{ color: GOLD }}>
                BOB DYSON · REPORTING
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tap-to-start overlay when the browser blocks unmuted autoplay */}
      {blocked && (
        <button
          onClick={() => { charlieRef.current?.play(); setBlocked(false); }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
          style={{ background: 'rgba(0,0,0,0.45)' }}>
          <span className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.95)', boxShadow: '0 0 60px rgba(212,175,55,0.4)' }}>
            <Play className="w-9 h-9 ml-1" style={{ color: '#000' }} fill="#000" />
          </span>
          <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>
            Tap to Start Broadcast
          </span>
        </button>
      )}

      <style>{`
        @keyframes dnnRemoteIn {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        .dnn-remote-box { animation: dnnRemoteIn 0.35s ease-out; transform-origin: bottom right; }
      `}</style>
    </div>
  );
}