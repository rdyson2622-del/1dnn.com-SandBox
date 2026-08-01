import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const GOLD = '#D4AF37';

export const DNN_STING_URL = '/assets/dnn-sting.mp4';

/**
 * DnnStingVideo — plays the DNN logo sting before and after a main video.
 *
 * Sequence: sting (sound) → main video → sting (sound)
 *
 * Props:
 *   videoUrl: string — the main video to wrap
 *   onEnded: () => void — called after the closing sting finishes
 *   fullscreen?: boolean — if true, renders as a full-screen overlay
 */
export default function DnnStingVideo({ videoUrl, onEnded, fullscreen = false }) {
  const videoRef = useRef(null);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'main' | 'outro'
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const src = phase === 'main' ? videoUrl : DNN_STING_URL;

  useEffect(() => {
    setPhase('intro');
    setPlaying(true);
    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (v) {
        v.muted = false;
        v.play().then(() => setPlaying(true)).catch(() => {
          v.muted = true;
          setMuted(true);
          v.play().then(() => setPlaying(true)).catch(() => {});
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [videoUrl]);

  const handleEnded = () => {
    if (phase === 'intro') {
      setPhase('main');
    } else if (phase === 'main') {
      setPhase('outro');
    } else {
      setPlaying(false);
      onEnded?.();
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const replay = () => {
    setPhase('intro');
    setTimeout(() => {
      const v = videoRef.current;
      if (v) { v.currentTime = 0; v.play().then(() => setPlaying(true)).catch(() => {}); }
    }, 50);
  };

  const phaseLabel = phase === 'main' ? 'DNN BROADCAST' : 'DNN';

  const containerClass = fullscreen
    ? 'fixed inset-0 z-[300] flex items-center justify-center'
    : 'relative w-full h-full';

  const videoClass = fullscreen
    ? 'w-full h-full object-contain'
    : 'w-full h-full object-cover';

  return (
    <div className={containerClass} style={fullscreen ? { background: '#000' } : {}}>
      {fullscreen && (
        <button onClick={onEnded} aria-label="Close"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${GOLD}`, color: GOLD }}>
          <X className="w-5 h-5" />
        </button>
      )}

      <video
        key={src + phase}
        ref={videoRef}
        src={src}
        autoPlay
        playsInline
        onEnded={handleEnded}
        onClick={togglePlay}
        className={videoClass}
      />

      {!playing && (
        <button
          onClick={phase === 'outro' ? onEnded : togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center transition-all hover:bg-black/20"
        >
          <span className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.65)', border: `2px solid ${GOLD}` }}>
            <Play className="w-6 h-6 ml-0.5" style={{ color: GOLD }} fill={GOLD} />
          </span>
        </button>
      )}

      {/* Phase badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.65)', border: `1px solid rgba(212,175,55,0.4)`, backdropFilter: 'blur(4px)' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
        <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>{phaseLabel}</span>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-3 py-2"
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
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
  );
}