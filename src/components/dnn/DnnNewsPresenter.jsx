import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { appClient } from '@/api/appClient';
import DnnNewsBroadcastPlayer from '@/components/dnn/DnnNewsBroadcastPlayer';

const GOLD = '#D4AF37';

/**
 * Extract 3-5 concise bullet points from Bob's spoken script.
 * Splits on sentence boundaries, filters out filler, and trims to key points.
 */
function extractBullets(script) {
  if (!script) return [];
  // Split on sentence boundaries
  const sentences = script
    .replace(/\n+/g, ' ')
    .match(/[^.!?]+[.!?]+/g) || [script];
  // Clean up and filter out short/filler sentences
  const cleaned = sentences
    .map(s => s.trim())
    .filter(s => s.length > 25 && !/^(so|well|you know|now|okay|great|thanks|absolutely)[,.\s]/i.test(s));
  // Take up to 5, strip trailing punctuation for display
  return cleaned.slice(0, 5).map(s => s.replace(/[.!?]+$/, ''));
}

/**
 * DnnNewsPresenter — Charlie + Bob duo presentation for the DNN National Desk.
 *
 * Charlie opens by introducing the national real estate news service,
 * then hands off to Bob who explains the unique "News + Solution" model.
 */
export default function DnnNewsPresenter() {
  const [segments, setSegments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-open when arriving from the landing page News pill
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoplay') === '1') {
      setOpen(true);
    }
    appClient.entities.DnnNewsClip.list(undefined, 200)
      .then((clips) => {
        // Group by article headline, sort each group by faqIndex
        const byArticle = {};
        for (const c of clips) {
          const key = c.question || 'Other';
          if (!byArticle[key]) byArticle[key] = [];
          byArticle[key].push(c);
        }
        // Only keep articles where all clips have BOTH expected video URLs present
        const segs = [];
        const contentSegs = [];
        for (const headline of Object.keys(byArticle)) {
          const articleClips = byArticle[headline].sort((a, b) => (a.faqIndex || 0) - (b.faqIndex || 0));
          // Every clip must have Charlie's video; Q&A clips must also have Bob's video
          const allReady = articleClips.every(c =>
            c.charlieVideoUrl && (!c.bobScript || c.bobVideoUrl)
          );
          if (!allReady) continue;
          for (const c of articleClips) {
            if (c.kind === 'qa') {
              if (c.bobVideoUrl) {
                contentSegs.push({
                  src: c.bobVideoUrl,
                  speaker: 'bob',
                  title: c.question,
                  bullets: extractBullets(c.bobScript),
                });
              }
            } else {
              contentSegs.push({ src: c.charlieVideoUrl, speaker: 'charlie' });
            }
          }
        }
        // Only build the full segment list if there are actual content clips ready
        if (contentSegs.length > 0) {
          segs.push(...contentSegs);
          setSegments(segs);
        } else {
          setSegments([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Pause & mute the preview video whenever the full-screen player is open
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

  if (!loaded) return null;
  if (segments.length === 0) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-dnn-news-trigger
          aria-label="Hear Charlie explain DNN National Desk"
          className="relative w-16 h-16 md:w-20 md:h-20 transition-all hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
            style={{ background: '#0d0d0d', border: `2px solid ${GOLD}` }}>
            <video
              ref={previewRef}
              src={segments[0].src}
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
        <DnnNewsBroadcastPlayer segments={segments} onClose={() => { setOpen(false); navigate('/'); }} />,
        document.body
      )}
    </>
  );
}