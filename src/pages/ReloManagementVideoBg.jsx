import React, { useEffect } from 'react';
import { MessageCircle, MapPin, UserCheck, Building2, Truck, Zap, GraduationCap, HeartPulse } from 'lucide-react';

const GOLD = '#D4AF37';

// Belt-and-suspenders: forcibly hide the dev PageNumberBadge from the captured DOM,
// regardless of any stray global mount. The badge is the only fixed element with
// a gold "16" pill; we target it by its distinctive title + position via JS on mount.
function useHideDevBadge() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'video-bg-hide-chrome';
    // Hide any fixed bottom-right pill badge that isn't part of this background.
    style.textContent = `[title*="(Client)"], [title*="(Admin)"] { display: none !important; }`;
    document.head.appendChild(style);
    return () => { document.getElementById('video-bg-hide-chrome')?.remove(); };
  }, []);
}

const SERVICES = [
  { icon: MessageCircle, title: 'AI Concierge Chat' },
  { icon: MapPin, title: 'Neighborhood Research' },
  { icon: UserCheck, title: 'Agent Selection' },
  { icon: Building2, title: 'Home Search Strategy' },
  { icon: Truck, title: 'Moving Coordination' },
  { icon: Zap, title: 'Utilities & Services' },
  { icon: GraduationCap, title: 'School Enrollment' },
  { icon: HeartPulse, title: 'Healthcare Setup' },
];

/**
 * ReloManagementVideoBg
 *
 * A purpose-built 1920x1080 (16:9) full-screen video background for the
 * Shard2 / HeyGen pipeline. NO app chrome: no sidebar, no top bar, no Back
 * button, no Dashboard label, no FloatingCharlie, no scrollbars.
 *
 * Routed OUTSIDE AppLayout so none of the portal UI is captured.
 * The top-right area is intentionally left clear for Ruben's avatar overlay.
 *
 * Captured by shard2CapturePageScreenshot at viewport 1920x1080.
 */
export default function ReloManagementVideoBg() {
  useHideDevBadge();
  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(120% 120% at 20% 0%, #1c1c1c 0%, #0d0d0d 55%, #080808 100%)',
        color: '#fff',
      }}
    >
      {/* Subtle gold frame line */}
      <div className="absolute inset-6 pointer-events-none rounded-3xl"
        style={{ border: '1px solid rgba(212,175,55,0.18)' }} />

      {/* ── Brand eyebrow ── */}
      <div className="px-20 pt-10">
        <p className="text-sm font-black tracking-[0.5em] uppercase" style={{ color: GOLD }}>
          DYSON &amp; DYSON · RELOCATION SERVICES
        </p>
        <div className="mt-3 h-[2px] w-40" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      </div>

      {/* ── Main headline block (left-weighted so top-right stays clear for the avatar) ── */}
      <div className="flex-1 flex flex-col justify-start pt-0 -mt-6 px-20 max-w-[64%]">
        <h1 className="display-heading"
          style={{ fontSize: '4rem', lineHeight: 1.02, letterSpacing: '0.1em', color: '#fff' }}>
          WE DON'T SEND
          <br />YOU A MAP.
        </h1>
        <h2 className="display-heading mt-4"
          style={{ fontSize: '2.6rem', lineHeight: 1.05, letterSpacing: '0.1em', color: GOLD }}>
          WE MAKE THE
          <br />JOURNEY WITH YOU.
        </h2>
        <p className="mt-6 text-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: '46rem' }}>
          A white-glove relocation management program — vetted agents, full
          logistics, escrow tracking, and a dedicated AI concierge guiding every
          step of your move.
        </p>
      </div>

      {/* ── Services strip across the bottom ── */}
      <div className="px-20 pb-16">
        <div className="grid grid-cols-8 gap-4">
          {SERVICES.map((s, i) => (
            <div key={i}
              className="rounded-2xl px-3 py-5 flex flex-col items-center text-center gap-3"
              style={{ background: 'rgba(26,26,26,0.85)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.35)' }}>
                <s.icon className="w-6 h-6" style={{ color: GOLD }} />
              </div>
              <p className="text-[13px] font-bold leading-tight text-white">{s.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}