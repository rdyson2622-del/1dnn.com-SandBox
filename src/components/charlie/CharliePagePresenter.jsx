import React, { useEffect, useRef, useState } from 'react';
import { appClient } from '@/api/appClient';
import { Play, Pause, Volume2, VolumeX, RotateCcw, X } from 'lucide-react';

const GOLD = '#D4AF37';

// Ruben is the on-camera presenter behind the Charlie page-guide experience.
// These clips were migrated from the original Base44 media library so the
// independent site does not depend on Base44 URLs at runtime.
const RUBEN_PAGE_PRESENTERS = {
  'relocation-services': {
    videoUrl: '/assets/ruben-relocation-services.mp4',
    thumbnailUrl: '/assets/ruben-relocation-services.jpg',
  },
  'client-home': {
    videoUrl: '/assets/ruben-client-home.mp4',
    thumbnailUrl: '/assets/ruben-client-home.jpg',
  },
  'gemini-session': {
    videoUrl: '/assets/ruben-gemini-session.mp4',
    thumbnailUrl: '/assets/ruben-gemini-session.jpg',
  },
  'corporate-relo': {
    videoUrl: '/assets/ruben-corporate-relo.mp4',
    thumbnailUrl: '/assets/ruben-corporate-relo.jpg',
  },
  'portal-client': {
    videoUrl: '/assets/ruben-portal-client.mp4',
    thumbnailUrl: '/assets/ruben-portal-client.jpg',
  },
  'portal-relocation-agent': {
    videoUrl: '/assets/ruben-portal-relocation-agent.mp4',
    thumbnailUrl: '/assets/ruben-portal-relocation-agent.jpg',
  },
  'portal-referral-agent': {
    videoUrl: '/assets/ruben-portal-referral-agent.mp4',
    thumbnailUrl: '/assets/ruben-portal-referral-agent.jpg',
  },
  'portal-vendor': {
    videoUrl: '/assets/ruben-portal-vendor.mp4',
    thumbnailUrl: '/assets/ruben-portal-vendor.jpg',
  },
};

/**
 * CharliePagePresenter — Shard2 in-app presentation layer.
 *
 * Collapsed: a small Charlie pill pinned near the top of the page — no page
 * content needs to move. Clicking it expands into the video box and Charlie
 * begins speaking (unmuted, since it's a user gesture).
 *
 * Built as a single self-contained widget so the one-way video can later be
 * swapped for a live voice-to-voice session without touching any page.
 *
 * Usage: <CharliePagePresenter pageKey="relocation-services" />
 */
export default function CharliePagePresenter({ pageKey, topOffsetClass, inline = false, positionClass }) {
  const [explainer, setExplainer] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    appClient.entities.CharliePageExplainer.filter({ pageKey })
      .then((arr) => {
        if (!cancelled) setExplainer(arr?.[0] || null);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [pageKey]);

  if (!loaded) return null;

  // Prefer the Charlie-only presenter clip; the composed full-screen video
  // (finalVideoUrl) is a demo/render artifact and is NOT shown in the widget.
  const localPresenter = RUBEN_PAGE_PRESENTERS[pageKey];
  const presenterSrc = explainer?.renderStatus === 'completed' && explainer?.presenterVideoUrl
    ? explainer.presenterVideoUrl
    : localPresenter?.videoUrl;
  const presenterThumbnail = explainer?.thumbnailUrl || localPresenter?.thumbnailUrl;
  const hasVideo = Boolean(presenterSrc);

  const openAndSpeak = () => {
    setExpanded(true);
    setEnded(false);
    // Start speaking on the click gesture — unmuted playback is allowed here
    setTimeout(() => {
      const v = videoRef.current;
      if (v) {
        v.muted = false;
        setMuted(false);
        v.play().then(() => setPlaying(true)).catch(() => {});
      }
    }, 50);
  };

  const collapse = () => {
    const v = videoRef.current;
    if (v) v.pause();
    setPlaying(false);
    setExpanded(false);
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

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setPlaying(true);
    setEnded(false);
  };

  const ControlBtn = ({ onClick, children, label }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.4)', color: GOLD }}
    >
      {children}
    </button>
  );

  /* ── Collapsed: round Charlie headshot in the upper right — never covers page copy ── */
  if (!expanded) {
    return (
      <button
        onClick={openAndSpeak}
        aria-label="Hear Charlie explain this page"
        className={`${inline ? 'absolute' : 'fixed'} z-40 ${positionClass || `${topOffsetClass || 'top-16 md:top-[4.5rem]'} right-3 md:right-5`} w-[126px] h-[126px] md:w-36 md:h-36 transition-all hover:scale-105 active:scale-95`}
      >
        <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
          style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
          {presenterThumbnail ? (
            <img
              src={presenterThumbnail}
              alt="Ruben — Charlie page presenter"
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : hasVideo ? (
            <video
              src={presenterSrc}
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={(e) => { e.target.currentTime = 1.5; }}
              onLoadedData={(e) => { if (e.target.currentTime < 1) e.target.currentTime = 1.5; }}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <img
              src="/assets/ruben-client-home.jpg"
              alt="Ruben — Charlie page presenter"
              className="w-full h-full object-cover pointer-events-none"
            />
          )}
        </span>
        {/* Play badge */}
        <span className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: GOLD, border: '2px solid #0d0d0d' }}>
          <Play className="w-5 h-5 ml-0.5" style={{ color: '#000' }} />
        </span>
      </button>
    );
  }

  /* ── Expanded: rectangular video box pinned upper-right, page stays visible ── */
  return (
    <div className="fixed top-20 right-4 md:top-24 md:right-6 z-50">
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
          style={{ background: '#262626', borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
          <p className="text-[9px] font-black tracking-[0.15em] uppercase truncate" style={{ color: GOLD }}>
            Charlie · Page Overview
          </p>
          <button onClick={collapse} aria-label="Minimize Charlie overview"
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            style={{ color: GOLD }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasVideo ? (
          <>
            <div className="relative" style={{ height: 170, background: '#0d0d0d' }}>
              <video
                ref={videoRef}
                src={presenterSrc}
                preload="auto"
                playsInline
                onEnded={() => { setPlaying(false); setEnded(true); }}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />
              {/* Big play overlay when not playing */}
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
            </div>
            {/* Footer controls bar */}
            <div className="flex items-center justify-center gap-3 px-3 py-2"
              style={{ background: '#262626', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
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
          </>
        ) : (
          /* Ruben remains visible even before a page-specific video is available. */
          <div className="flex flex-col items-center text-center">
            <div className="w-full overflow-hidden" style={{ height: 170, background: '#0d0d0d' }}>
              <img
                src="/assets/ruben-client-home.jpg"
                alt="Ruben — Charlie page presenter"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full px-3 py-3" style={{ background: '#262626', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-xs font-bold text-white">Meet Charlie</p>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Your Dyson AI relocation concierge
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
