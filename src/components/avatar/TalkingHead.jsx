import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Volume2, VolumeX } from 'lucide-react';

/**
 * TalkingHead — floating circular video/audio bubble
 * 
 * Props:
 *   speaker: 'bob' | 'charlie'
 *   audioUrl: string — URL to audio file (from charlieSpeak or TTS)
 *   videoUrl: string — optional HeyGen video URL (if avatar render exists)
 *   label: string — label shown under circle (e.g. "Bob Dyson")
 *   autoPlay: boolean
 *   onClose: function
 */

const SPEAKERS = {
  bob: {
    name: 'Bob Dyson',
    photo: '/assets/dyson-logo.png',
    color: '#D4AF37',
    initials: 'BD',
  },
  charlie: {
    name: 'Charlie',
    photo: null,
    color: '#A78BFA',
    initials: 'C',
  },
};

export default function TalkingHead({
  speaker = 'bob',
  audioUrl = null,
  videoUrl = null,
  label = null,
  autoPlay = false,
  onClose,
}) {
  const [minimized, setMinimized] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [talking, setTalking] = useState(false);
  const audioRef = useRef(null);
  const config = SPEAKERS[speaker] || SPEAKERS.bob;
  const displayLabel = label || config.name;

  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [autoPlay, audioUrl]);

  const handlePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
        setTalking(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
        setTalking(true);
      }
    }
  };

  const handleMute = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-sm font-black transition-all hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${config.color}, ${config.color}88)`,
          border: `2px solid ${config.color}`,
          color: '#000',
        }}
      >
        {config.initials}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-2"
      style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
    >
      {/* Controls row */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMute}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {muted
            ? <VolumeX className="w-3.5 h-3.5 text-white" />
            : <Volume2 className="w-3.5 h-3.5 text-white" />}
        </button>
        <button
          onClick={() => setMinimized(true)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Minimize2 className="w-3.5 h-3.5 text-white" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      {/* Main circle */}
      <div
        onClick={handlePlay}
        className="relative cursor-pointer transition-transform hover:scale-105"
        style={{ width: 96, height: 96 }}
      >
        {/* Talking pulse ring */}
        {talking && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: 'transparent',
              border: `3px solid ${config.color}`,
              opacity: 0.5,
              animationDuration: '1s',
            }}
          />
        )}

        {/* Border ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid ${config.color}`,
            boxShadow: talking ? `0 0 20px ${config.color}66` : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        />

        {/* Video (if HeyGen render available) */}
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay={autoPlay}
            loop
            muted={muted}
            playsInline
            className="w-full h-full rounded-full object-cover"
            style={{ objectPosition: 'top' }}
            onPlay={() => { setPlaying(true); setTalking(true); }}
            onPause={() => { setPlaying(false); setTalking(false); }}
            onEnded={() => { setPlaying(false); setTalking(false); }}
          />
        ) : config.photo ? (
          /* Static photo with talking shimmer overlay */
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <img
              src={config.photo}
              alt={displayLabel}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'top center' }}
            />
            {/* Mouth area shimmer when talking */}
            {talking && (
              <div
                className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-full"
                style={{
                  background: `linear-gradient(to top, ${config.color}33, transparent)`,
                  animation: 'gentlePulse 0.4s ease-in-out infinite',
                }}
              />
            )}
          </div>
        ) : (
          /* Initials fallback */
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-2xl font-black"
            style={{
              background: `linear-gradient(135deg, ${config.color}33, ${config.color}11)`,
              color: config.color,
            }}
          >
            {config.initials}
          </div>
        )}

        {/* Play button overlay when not playing */}
        {!playing && audioUrl && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.35)' }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fff', marginLeft: '3px' }}>
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        )}
      </div>

      {/* Label + name */}
      <div className="text-center">
        <p className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: config.color,
            border: `1px solid ${config.color}44`,
            backdropFilter: 'blur(6px)',
          }}>
          {displayLabel}
        </p>
        {playing && (
          <p className="text-[10px] mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Speaking...
          </p>
        )}
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => { setPlaying(true); setTalking(true); }}
          onPause={() => { setPlaying(false); setTalking(false); }}
          onEnded={() => { setPlaying(false); setTalking(false); }}
        />
      )}
    </div>
  );
}