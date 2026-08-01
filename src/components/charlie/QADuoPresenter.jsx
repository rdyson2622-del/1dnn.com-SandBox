import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const GOLD = '#D4AF37';

const SPEAKER_LABELS = {
  charlie: 'CHARLIE · DYSON AI CONCIERGE',
  bob: 'BOB DYSON · FOUNDER',
};

/**
 * QADuoPresenter — a non-blocking rectangular video box pinned to the
 * upper-right corner. The page beneath remains fully visible and scrollable.
 * Plays through segments sequentially, switching between Charlie and Bob.
 *
 * Props:
 *   segments: [{ src, speaker: 'charlie'|'bob' }]
 *   onClose: () => void
 *   title: optional header label (defaults to speaker label)
 */
export default function QADuoPresenter({ segments, onClose, title }) {
  const [idx, setIdx] = useState(0);
  const [ended, setEnded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setIdx(0);
    setEnded(false);
    setPlaying(true);
    setMuted(false);
    // Auto-play on mount. Start muted to satisfy browser autoplay policies,
    // then attempt to unmute (works if a user gesture is still active).
    setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = true;
      v.play().then(() => {
        setPlaying(true);
        v.muted = false;
        setMuted(false);
      }).catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().then(() => setPlaying(true)).catch(() => {});
      });
    }, 50);
  }, [segments]);

  // When segment index changes (Charlie → Bob → Charlie), explicitly play the new video
  useEffect(() => {
    if (idx === 0) return; // skip initial — handled by mount effect above
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.currentTime = 0;
    v.play().then(() => setPlaying(true)).catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().then(() => setPlaying(true)).catch(() => {});
    });
  }, [idx]);

  const seg = segments[idx];
  if (!seg) return null;

  const handleEnded = () => {
    if (idx < segments.length - 1) {
      setIdx(i => i + 1);
    } else {
      setEnded(true);
      setPlaying(false);
    }
  };

  const replay = () => {
    setIdx(0);
    setEnded(false);
    setTimeout(() => {
      const v = videoRef.current;
      if (v) { v.currentTime = 0; v.muted = false; setMuted(false); v.play().then(() => setPlaying(true)).catch(() => {}); }
    }, 50);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); setEnded(false); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const headerLabel = title || SPEAKER_LABELS[seg.speaker] || 'CHARLIE';

  return (
    <div className="fixed top-28 right-4 md:top-32 md:right-6 z-50">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: 150,
          background: '#1a1a1a',
          border: `2px solid ${GOLD}`,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2"
          style={{ background: '#262626', borderBottom: `1px solid rgba(212,175,55,0.25)` }}>
          <p className="text-[9px] font-black tracking-[0.15em] uppercase truncate" style={{ color: GOLD }}>
            {headerLabel}
          </p>
          <button onClick={onClose} aria-label="Close"
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            style={{ color: GOLD }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video area — portrait aspect ratio */}
        <div className="relative overflow-hidden" style={{ height: 170, background: '#0d0d0d' }}>
          <video
            key={seg.src}
            ref={videoRef}
            src={seg.src}
            autoPlay
            playsInline
            onEnded={handleEnded}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
            style={{ transform: seg.speaker === 'bob' ? 'scale(1.0) translateY(2%)' : 'scale(1.05)' }}
          />

          {/* Big play overlay when paused/ended */}
          {!playing && (
            <button
              onClick={ended ? replay : togglePlay}
              aria-label={ended ? 'Replay' : 'Play'}
              className="absolute inset-0 flex items-center justify-center transition-all hover:bg-black/20"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.65)', border: `2px solid ${GOLD}` }}>
                {ended
                  ? <RotateCcw className="w-5 h-5" style={{ color: GOLD }} />
                  : <Play className="w-5 h-5 ml-0.5" style={{ color: GOLD }} />}
              </span>
            </button>
          )}

          {/* Tap for sound overlay when muted but playing */}
          {playing && muted && (
            <button
              onClick={toggleMute}
              aria-label="Tap for sound"
              className="absolute inset-0 flex items-center justify-center transition-all hover:bg-black/30"
            >
              <span className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${GOLD}` }}>
                <VolumeX className="w-5 h-5" style={{ color: GOLD }} />
                <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color: GOLD }}>
                  Tap for Sound
                </span>
              </span>
            </button>
          )}

          {/* Progress dots */}
          {segments.length > 1 && (
            <div className="absolute top-2 left-2 flex gap-1">
              {segments.map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: i <= idx ? GOLD : 'rgba(255,255,255,0.25)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Footer controls bar */}
        <div className="flex items-center justify-center gap-3 px-3 py-2"
          style={{ background: '#262626', borderTop: `1px solid rgba(212,175,55,0.15)` }}>
          <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ color: GOLD }}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ color: GOLD }}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={replay} aria-label="Replay"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ color: GOLD }}>
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}