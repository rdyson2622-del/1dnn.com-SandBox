import React, { useState, useRef, useEffect } from 'react';
import { DNN_STING_URL } from '@/components/dnn/DnnStingVideo';

const GOLD = '#D4AF37';
const STORAGE_KEY = 'dnn_site_intro_seen';

/**
 * DnnSiteIntro — full-screen DNN logo sting that plays once per browser session
 * before the landing page is revealed. Uses sessionStorage so returning visitors
 * within the same session don't see it again.
 */
export default function DnnSiteIntro({ children }) {
  const [showSting, setShowSting] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Only play once per session
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, '1');
    setShowSting(true);

    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (v) {
        v.muted = false;
        v.play().catch(() => {
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => setShowSting(false);

  if (!showSting) return children;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: '#000' }}>
        <video
          ref={videoRef}
          src={DNN_STING_URL}
          autoPlay
          playsInline
          onEnded={dismiss}
          className="max-w-full max-h-full"
          style={{ objectFit: 'contain' }}
        />
        <button
          onClick={dismiss}
          className="absolute bottom-6 right-6 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all hover:scale-105"
          style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${GOLD}`, color: GOLD }}
        >
          Skip Intro
        </button>
      </div>
    </>
  );
}