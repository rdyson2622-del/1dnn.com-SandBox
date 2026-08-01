import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';
const DNN_LOGO = '/assets/dnn-logo.png';

/**
 * DnnBroadcastPresenter
 *
 * Public News button player. Uses the latest completed DnnBroadcast.videoUrl
 * (a single rendered MP4) instead of stitching old DnnNewsClip records.
 */
export default function DnnBroadcastPresenter() {
  const [broadcast, setBroadcast] = useState(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef(null);
  const fullRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoplay') === '1') {
      setOpen(true);
    }
    appClient.entities.DnnBroadcast.filter({ status: 'completed' }, '-created_date', 20)
      .then((broadcasts) => {
        const latest = broadcasts.find(b => b.videoUrl);
        if (latest) setBroadcast(latest);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // React's `muted` prop does NOT set the DOM muted property — force it via ref
  // so the preview never emits audio (which would overlap the full-screen player).
  useEffect(() => {
    const v = previewRef.current;
    if (!v) return;
    v.defaultMuted = true;
    v.muted = true;
    v.pause();
  }, [broadcast]);

  useEffect(() => {
    const v = previewRef.current;
    if (!v) return;
    if (open) {
      v.pause();
      v.muted = true;
    } else {
      v.muted = true;
      v.currentTime = 1.5;
    }
  }, [open]);

  // Pause the full-screen video when the overlay closes / component unmounts
  // so its audio never lingers and overlaps a subsequent playback.
  useEffect(() => {
    if (!open) return;
    const v = fullRef.current;
    return () => { try { v?.pause(); } catch (_) {} };
  }, [open]);

  if (!loaded) return null;
  if (!broadcast?.videoUrl) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-dnn-news-trigger
          aria-label="Watch the latest DNN broadcast"
          className="relative w-16 h-16 md:w-20 md:h-20 transition-all hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
            style={{ background: '#0d0d0d', border: `2px solid ${GOLD}` }}>
            <video
              ref={previewRef}
              src={broadcast.videoUrl}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => { e.target.muted = true; e.target.currentTime = 1.5; e.target.pause(); }}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </span>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center"
            style={{ background: GOLD, border: '2px solid #0d0d0d' }}>
            <Play className="w-3 h-3 md:w-3.5 md:h-3.5 ml-0.5" style={{ color: '#000' }} />
          </span>
        </button>
      )}

      {open && createPortal(
        <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center">
          <button
            onClick={() => { setOpen(false); navigate('/'); }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${GOLD}` }}
            aria-label="Close broadcast"
          >
            <X className="w-5 h-5" style={{ color: GOLD }} />
          </button>

          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid rgba(212,175,55,0.4)` }}>
            <img src={DNN_LOGO} alt="DNN" className="h-5 w-auto" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>LIVE</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
          </div>

          <video
            ref={fullRef}
            src={broadcast.videoUrl}
            autoPlay
            controls
            playsInline
            preload="auto"
            className="w-full h-full object-contain bg-black"
          />
        </div>,
        document.body
      )}
    </>
  );
}