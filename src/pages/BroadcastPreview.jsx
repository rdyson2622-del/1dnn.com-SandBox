import React, { useState } from 'react';
import { Radio, User, Users, Monitor, Smartphone, Eye } from 'lucide-react';

const GOLD = '#D4AF37';
const STUDIO_BG = '/assets/studio-bg.png';
const DNN_LOGO = '/assets/dnn-logo.png';
const BOB_PHOTO = '/assets/dyson-logo.png';

const SAMPLE_HEADLINES = [
  'Federal Reserve Holds Rates Steady: What It Means for Relocation',
  'Migration Data Shows 12% Increase in Interstate Moves This Quarter',
  'New Tax Policy Impacts Corporate Relocation Packages for 2026',
];

export default function BroadcastPreview() {
  const [speaker, setSpeaker] = useState('charlie');
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [view, setView] = useState('desktop'); // 'desktop' | 'mobile'
  const [phase, setPhase] = useState('broadcast'); // 'broadcast' | 'endcard'

  const headline = SAMPLE_HEADLINES[headlineIdx];

  const cycleHeadline = () => setHeadlineIdx((headlineIdx + 1) % SAMPLE_HEADLINES.length);

  // 16:9 broadcast frame — what gets rendered as the final MP4
  const BroadcastFrame = () => (
    <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
      {/* Studio background */}
      <img src={STUDIO_BG} alt="DNN Studio" className="absolute inset-0 w-full h-full object-cover" />

      {/* DNN logo bug — top left */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg z-20"
        style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid rgba(212,175,55,0.4)`, backdropFilter: 'blur(4px)' }}>
        <img src={DNN_LOGO} alt="DNN" className="h-5 w-auto" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>DNN</span>
      </div>

      {/* LIVE indicator — top right */}
      <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg z-20"
        style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid rgba(212,175,55,0.4)`, backdropFilter: 'blur(4px)' }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: '#ef4444' }}>LIVE</span>
      </div>

      {/* Charlie — anchor desk, lower left (always visible) */}
      <div className="absolute z-10" style={{ bottom: '8%', left: '2%', width: '28%' }}>
        <div className="rounded-lg overflow-hidden"
          style={{
            border: `2px solid ${speaker === 'charlie' ? GOLD : 'rgba(255,255,255,0.25)'}`,
            boxShadow: speaker === 'charlie'
              ? `0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.5)`
              : '0 8px 40px rgba(0,0,0,0.7)',
            background: '#000',
          }}>
          {/* Placeholder for Charlie video — shows when no rendered clip available */}
          <div className="w-full flex items-center justify-center"
            style={{ aspectRatio: '3 / 4', background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)' }}>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid rgba(212,175,55,0.3)` }}>
                <User className="w-6 h-6" style={{ color: GOLD }} />
              </div>
              <span className="text-[8px] font-black tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                Charlie Clip
              </span>
            </div>
          </div>
          <div className="px-2 py-1 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #1a1a1a, #000)', borderTop: `1px solid rgba(212,175,55,0.5)` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: '#ef4444' }} />
            <span className="text-[9px] font-black tracking-[0.1em] uppercase truncate" style={{ color: GOLD }}>
              Charlie Simmons · Anchor
            </span>
          </div>
        </div>
      </div>

      {/* Bob — remote correspondent, lower right (visible when speaking) */}
      {speaker === 'bob' && (
        <div className="absolute z-10 animate-fadeIn" style={{ bottom: '8%', right: '2%', width: '28%' }}>
          <div className="rounded-lg overflow-hidden"
            style={{ border: `2px solid ${GOLD}`, boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.5)', background: '#000' }}>
            <div className="w-full overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
              <img src={BOB_PHOTO} alt="Bob Dyson" className="w-full h-full object-cover" style={{ transform: 'scale(1.2)', transformOrigin: 'center top' }} />
            </div>
            <div className="px-2 py-1 flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #1a1a1a, #000)', borderTop: `1px solid rgba(212,175,55,0.5)` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: '#ef4444' }} />
              <span className="text-[9px] font-black tracking-[0.1em] uppercase truncate" style={{ color: GOLD }}>
                Bob Dyson · Reporting
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lower third — headline ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-15">
        <div className="px-4 py-2.5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9) 30%)' }}>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shrink-0"
              style={{ background: GOLD, color: '#000' }}>
              {speaker === 'charlie' ? 'ANCHOR' : 'EXPERT'}
            </span>
            <p className="text-white font-bold text-xs md:text-sm leading-snug truncate">{headline}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // End card — shown at the end of every broadcast
  const EndCard = () => (
    <div className="relative w-full overflow-hidden bg-black flex flex-col items-center justify-center"
      style={{ aspectRatio: '16 / 9' }}>
      <img src={STUDIO_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <img src={DNN_LOGO} alt="DNN" className="h-16 md:h-20 w-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(212,175,55,0.4))' }} />
        <div>
          <p className="text-white font-bold text-lg md:text-2xl mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Daily Relocation Intelligence
          </p>
          <p className="text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Subscribe at <span className="font-black" style={{ color: GOLD }}>1DNN.com</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid rgba(212,175,55,0.4)` }}>
          <Radio className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>Free · Daily · Subscribe Now</span>
        </div>
        <p className="text-[10px] mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Dyson &amp; Dyson Real Estate · CA DRE #02303118
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(10,10,10,0.97)', borderBottom: `1px solid rgba(212,175,55,0.15)`, backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <img src={DNN_LOGO} alt="DNN" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>Broadcast Preview</p>
            <p className="text-[10px] tracking-widest uppercase text-slate-500">What LinkedIn &amp; Facebook Viewers See</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Speaker toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Speaker:</span>
            <button onClick={() => setSpeaker('charlie')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: speaker === 'charlie' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${speaker === 'charlie' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: speaker === 'charlie' ? GOLD : '#999',
              }}>
              <User className="w-3 h-3 inline mr-1" /> Charlie (Anchor)
            </button>
            <button onClick={() => setSpeaker('bob')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: speaker === 'bob' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${speaker === 'bob' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: speaker === 'bob' ? GOLD : '#999',
              }}>
              <Users className="w-3 h-3 inline mr-1" /> Bob (Expert)
            </button>
          </div>

          {/* Phase toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Phase:</span>
            <button onClick={() => setPhase('broadcast')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: phase === 'broadcast' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${phase === 'broadcast' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: phase === 'broadcast' ? GOLD : '#999',
              }}>
              Broadcast
            </button>
            <button onClick={() => setPhase('endcard')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: phase === 'endcard' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${phase === 'endcard' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: phase === 'endcard' ? GOLD : '#999',
              }}>
              End Card
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <button onClick={() => setView('desktop')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: view === 'desktop' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${view === 'desktop' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: view === 'desktop' ? GOLD : '#999',
              }}>
              <Monitor className="w-3 h-3 inline mr-1" /> Desktop
            </button>
            <button onClick={() => setView('mobile')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: view === 'mobile' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${view === 'mobile' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: view === 'mobile' ? GOLD : '#999',
              }}>
              <Smartphone className="w-3 h-3 inline mr-1" /> Mobile
            </button>
          </div>
        </div>

        {/* Headline cycler */}
        {phase === 'broadcast' && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Headline:</span>
            <button onClick={cycleHeadline}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
              Cycle Headline →
            </button>
            <span className="text-xs text-slate-400 truncate">{headline}</span>
          </div>
        )}

        {/* Preview frame — simulates social media video player */}
        <div className="flex justify-center">
          <div
            className="rounded-xl overflow-hidden shadow-2xl"
            style={{
              width: view === 'desktop' ? '100%' : '360px',
              border: `1px solid rgba(212,175,55,0.3)`,
              boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Simulated social media top bar */}
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-7 h-7 rounded-full" style={{ background: GOLD }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">DNN — Dyson News Network</p>
                <p className="text-[9px] text-slate-500">Sponsored · {view === 'desktop' ? 'LinkedIn Feed' : 'Facebook Mobile'}</p>
              </div>
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[9px] text-slate-600">1.2K</span>
            </div>

            {/* The actual broadcast / end card */}
            {phase === 'broadcast' ? <BroadcastFrame /> : <EndCard />}

            {/* Simulated social media bottom bar */}
            <div className="px-4 py-3" style={{ background: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full" style={{ background: GOLD }} />
                  <div>
                    <p className="text-xs font-bold text-white">DNN Intelligence Bureau</p>
                    <p className="text-[9px] text-slate-500">2 hours ago · 🌐</p>
                  </div>
                </div>
                <button className="px-3 py-1 rounded text-[10px] font-bold" style={{ background: GOLD, color: '#000' }}>
                  + Follow
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                📡 {headline} — Charlie Simmons and Bob Dyson break down what this means for your relocation.
                <br />
                <span style={{ color: GOLD }}>Subscribe for daily briefs: 1DNN.com</span>
              </p>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="text-[10px] flex items-center gap-1">👍 342</span>
                <span className="text-[10px] flex items-center gap-1">💬 28</span>
                <span className="text-[10px] flex items-center gap-1">↗ Share</span>
              </div>
            </div>
          </div>
        </div>

        {/* Design notes */}
        <div className="mt-8 rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Composition Notes</p>
          <div className="grid sm:grid-cols-2 gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <div>
              <p className="font-bold text-white mb-1">Charlie (Anchor)</p>
              <p>Lower-left box, 28% width, 3:4 aspect ratio. Gold border lights up when he's speaking. Name plate: "Charlie Simmons · Anchor".</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Bob (Expert)</p>
              <p>Lower-right box, same dimensions. Only appears during his segments. Name plate: "Bob Dyson · Reporting".</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">DNN Logo Bug</p>
              <p>Top-left corner, semi-transparent black background with gold border. Always visible during broadcast.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">LIVE Indicator</p>
              <p>Top-right corner, red pulse. Visible during broadcast phase only.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Lower Third</p>
              <p>Bottom gradient with role badge (ANCHOR/EXPERT) + headline text. Updates per segment.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">End Card</p>
              <p>DNN logo, "Daily Relocation Intelligence" headline, "Subscribe at 1DNN.com" CTA, DRE disclosure. Shown after last clip.</p>
            </div>
          </div>
        </div>

        {/* What still needs real assets */}
        <div className="mt-4 rounded-xl p-5" style={{ background: '#111', border: '1px solid rgba(251,191,36,0.2)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: '#fbbf24' }}>Assets Needed for Production</p>
          <ul className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24' }} /> Charlie HeyGen-rendered anchor clips (green-screen keyed)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24' }} /> Bob HeyGen-rendered expert clips (standard video, no chroma key)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24' }} /> Final composed MP4 (clips stitched + lower thirds burned in)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24' }} /> 9:16 vertical reformat for Reels/Shorts/TikTok</li>
          </ul>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.35s ease-out; transform-origin: bottom right; }
      `}</style>
    </div>
  );
}