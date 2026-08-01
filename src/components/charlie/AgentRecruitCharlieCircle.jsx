import React, { useState, useRef, useCallback } from 'react';
import { appClient } from '@/api/appClient';
import { X, Play, RotateCcw, Volume2 } from 'lucide-react';

const GOLD = '#D4AF37';
const BOB_BLUE = '#60a5fa';

const SCRIPTS = [
  {
    speaker: 'charlie',
    label: 'CHARLIE · DYSON AI CONCIERGE',
    text: `If you're an independent real estate agent listening to this right now, this message is for you. Bob Dyson and I want to talk to you about something that doesn't exist anywhere else in this industry. But first, let me tell you who we're looking for. We've already used AI to identify a couple hundred agents across the country based on real production data. And here's the key: we're targeting independent brokerage firms. Not the big-box brands. Not the national franchises. Why? Because the big-box brands already have their own relocation plans — or at least they think they do. The independent brokerages are where the real talent lives. They make up about fifty-five percent of all brokerage firms in America, and they're the ones who actually know their markets.`,
  },
  {
    speaker: 'bob',
    label: 'BOB DYSON · 55 YEARS IN THE BUSINESS',
    text: `Charlie's exactly right. I've been in this business for fifty-five years, and I can tell you — the independent broker is the backbone of American real estate. They don't have a corporate relocation department handing them leads. They hustle for every deal. That's the kind of agent I want in my network. But here's what makes our selection process different from anything you've ever seen. We don't just look at your production numbers and call it a day. We verify boots on the ground. My team physically researches your market presence, your closed transactions, your neighborhood knowledge, your communication style. We interview you personally. We confirm your DRE license is clean. And only then — only after we've verified you're the real deal — do we invite you in.`,
  },
  {
    speaker: 'charlie',
    label: 'CHARLIE · THE BONUS PROGRAM',
    text: `Now here's the part that no other network offers. Once you're in, you're not just getting referral leads — though you'll get plenty of those. You're also participating in our monthly bonus program. Here's how it works: every month, the Dyson & Dyson network generates revenue from all the business produced that month by all the producers in the network — every agent, every market, every closing. A portion of that revenue pool is distributed back to the agents based on their production contribution. So you're not just earning on your own deals. You're earning on the overall company and network sales performance each month. In essence, you're adding a potentially big number to your bottom line every single month — just for being part of the network and contributing to the overall production.`,
  },
  {
    speaker: 'bob',
    label: 'BOB DYSON · WHY THIS IS UNIQUE',
    text: `This is the part I want every agent to understand. No big-box brand does this. No referral network does this. No franchise does this. They keep the revenue at the top. I share it with the people who produced it. When the network has a great month, you have a great month — even if your own closings were light. When the network grows, your bonus grows. That's not a referral fee. That's a revenue share. It's a partnership. And it only exists because I believe that the agents who build this network deserve to share in what they build. That's the Dyson difference.`,
  },
  {
    speaker: 'charlie',
    label: 'CHARLIE · YOUR NEXT STEP',
    text: `So if you're an independent agent — or you know one who should be in this network — this is your invitation. Boots on the ground verification. A monthly bonus program that pays you for the entire network's production. And a referral pipeline of vetted relocation clients who are already pre-qualified and ready to move. Talk to Bob. He'll walk you through the vetting process personally. And if you pass — and not everyone does — you'll be joining something that doesn't exist anywhere else. Welcome to Dyson & Dyson.`,
  },
];

export default function AgentRecruitCharlieCircle() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const audioRef = useRef(null);

  const playSegment = useCallback(async (segmentIdx) => {
    const seg = SCRIPTS[segmentIdx];
    if (!seg) { setEnded(true); setPlaying(false); return; }
    setLoading(true);
    setPlaying(true);
    setEnded(false);
    try {
      const res = await appClient.functions.invoke('charlieSpeak', { text: seg.text, speaker: seg.speaker });
      const { audio, mimeType } = res?.data || {};
      if (audio && audioRef.current) {
        const binary = atob(audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mimeType || 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setIdx(0);
    setEnded(false);
    setTimeout(() => playSegment(0), 200);
  };

  const handleAudioEnded = () => {
    if (idx < SCRIPTS.length - 1) {
      const next = idx + 1;
      setIdx(next);
      playSegment(next);
    } else {
      setEnded(true);
      setPlaying(false);
    }
  };

  const replay = () => {
    setIdx(0);
    setEnded(false);
    playSegment(0);
  };

  const seg = SCRIPTS[idx];
  const isBob = seg?.speaker === 'bob';
  const accent = isBob ? BOB_BLUE : GOLD;

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        aria-label="Hear Charlie and Bob explain the agent recruitment program"
        className="fixed top-20 right-4 md:top-24 md:right-6 z-40 w-[126px] h-[126px] md:w-36 md:h-36 transition-all hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
          style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
          <span className="w-full h-full flex items-center justify-center text-4xl">🎩</span>
        </span>
        <span className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: GOLD, border: '2px solid #0d0d0d' }}>
          <Play className="w-5 h-5 ml-0.5" style={{ color: '#000' }} />
        </span>
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: '#0d0d0d', color: GOLD, border: `1px solid ${GOLD}` }}>
          MEET CHARLIE
        </span>
      </button>
    );
  }

  return (
    <div className="fixed top-20 right-4 md:top-24 md:right-6 z-50">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: 150,
          background: '#1a1a1a',
          border: `2px solid ${accent}`,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          transition: 'border-color 0.4s ease',
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2"
          style={{ background: '#262626', borderBottom: `1px solid rgba(212,175,55,0.25)` }}>
          <p className="text-[9px] font-black tracking-[0.15em] uppercase truncate" style={{ color: accent }}>
            {seg?.label || 'CHARLIE'}
          </p>
          <button
            onClick={() => { setOpen(false); setPlaying(false); if (audioRef.current) audioRef.current.pause(); }}
            aria-label="Close"
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            style={{ color: accent }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video / avatar area */}
        <div className="relative flex items-center justify-center"
          style={{ height: 170, background: isBob ? '#0a0f1e' : '#0d0d0d' }}>
          <span className="text-6xl">{isBob ? '🎤' : '🎩'}</span>

          {(loading || playing) && (
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center animate-pulse"
              style={{ background: 'rgba(0,0,0,0.7)', border: `2px solid ${accent}` }}>
              <Volume2 className="w-4 h-4" style={{ color: accent }} />
            </div>
          )}

          {ended && (
            <button onClick={replay} aria-label="Replay"
              className="absolute inset-0 flex items-center justify-center transition-all hover:bg-black/30">
              <span className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.65)', border: `2px solid ${GOLD}` }}>
                <RotateCcw className="w-5 h-5" style={{ color: GOLD }} />
              </span>
            </button>
          )}

          {/* Progress dots */}
          <div className="absolute top-2 left-2 flex gap-1">
            {SCRIPTS.map((s, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: i <= idx
                    ? (s.speaker === 'bob' ? BOB_BLUE : GOLD)
                    : 'rgba(255,255,255,0.25)',
                }} />
            ))}
          </div>
        </div>

        {/* Footer controls bar */}
        <div className="flex items-center justify-center gap-3 px-3 py-2"
          style={{ background: '#262626', borderTop: `1px solid rgba(212,175,55,0.15)` }}>
          <button onClick={replay} aria-label="Replay"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ color: accent }}>
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <audio ref={audioRef} onEnded={handleAudioEnded} />
      </div>
    </div>
  );
}