import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Zap, Home, Play } from 'lucide-react';
import { appClient } from '@/api/appClient';
import FloatingCharlie from '@/components/charlie/FloatingCharlie';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

const FAQS = [
  {
    q: "What's the difference between a relocation manager and a standard real estate agent?",
    a: "A standard agent helps you buy or sell a property in their local market. A relocation manager like Dyson & Dyson coordinates the entire move — selling your current home, finding an agent in your destination city, managing escrow timelines across two markets simultaneously, handling utilities, schools, and logistics. We're the quarterback. The agents work for us on your behalf."
  },
  {
    q: "How does Dyson & Dyson handle a complex move involving two states?",
    a: "We assign a dedicated Relocation Manager who stays embedded in every transaction. We interview and select the best agents in both your origin and destination markets, monitor both escrows on a daily basis, and coordinate the timing so you're not carrying two mortgages or stuck in a hotel for weeks."
  },
  {
    q: "Is there really no cost to me as the buyer?",
    a: "Correct — our service is completely free to homebuyers and relocating families. We are funded through referral agreements with the agents and brokers we recommend. This is 100% compliant with California DRE regulations."
  },
  {
    q: "What if my deal is stuck or something is going wrong in escrow?",
    a: "That's exactly what the 'Solve My Story' tool is for. Describe your situation and a senior member of our team will review it personally. We specialize in rescuing transactions that are at risk of falling through."
  },
  {
    q: "How quickly can Dyson & Dyson start working my case?",
    a: "Immediately. Complete the relocation intake or talk to Charlie right now. Once we have your contact information and destination, we begin the agent search process within 24 hours."
  },
  {
    q: "What cities does Dyson & Dyson cover?",
    a: "We operate nationally. Our PRN (Private Referral Network) spans dozens of destination markets. If you're moving somewhere in the US, we have vetted agents there or we'll find the best ones specifically for your move profile."
  },
];

function FaqItem({ q, a, canPlay, onPlay }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ border: '1px solid rgba(212,175,55,0.3)', background: open ? '#1a1a1a' : '#111' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-bold text-sm leading-snug text-white">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
          : <ChevronDown className="w-4 h-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
        }
      </button>
      {open && (
        <div className="px-5 pb-5">
          {canPlay && (
            <button onClick={onPlay}
              className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full text-xs font-black tracking-wide transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              <Play className="w-3.5 h-3.5" /> Hear Bob Dyson answer this
            </button>
          )}
          <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Georgia, serif' }}>
            {a}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RealEstateAnswers() {
  const [clips, setClips] = useState([]);
  const [sequence, setSequence] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    appClient.entities.RealEstateQAClip.list()
      .then(setClips)
      .catch(() => {});
  }, []);

  const intro = clips.find(c => c.kind === 'intro');
  const outro = clips.find(c => c.kind === 'outro');
  const introReady = intro?.charlieStatus === 'completed' && intro?.charlieVideoUrl;

  const qaReady = (i) => {
    const qa = clips.find(c => c.kind === 'qa' && c.faqIndex === i);
    return qa?.charlieStatus === 'completed' && qa?.bobStatus === 'completed' && qa?.bobVideoUrl;
  };

  const playIntro = () => {
    if (!introReady) return;
    setSequence([{ src: intro.charlieVideoUrl, speaker: 'charlie' }]);
  };

  const playFaq = (i) => {
    const qa = clips.find(c => c.kind === 'qa' && c.faqIndex === i);
    if (!qa) return;
    const segs = [];
    if (qa.charlieVideoUrl) segs.push({ src: qa.charlieVideoUrl, speaker: 'charlie' });
    if (qa.bobVideoUrl) segs.push({ src: qa.bobVideoUrl, speaker: 'bob' });
    if (outro?.charlieVideoUrl) segs.push({ src: outro.charlieVideoUrl, speaker: 'charlie' });
    if (segs.length) setSequence(segs);
  };

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>

      {/* ── Q&A player overlay ── */}
      {sequence && (
        <QADuoPresenter segments={sequence} onClose={() => setSequence(null)} />
      )}

      {/* ── Charlie circle — in flow, upper right of the tan content area ── */}
      {introReady && !sequence && (
        <div className="w-full flex justify-end px-3 md:px-5 pt-20 md:pt-24">
          <button
            onClick={playIntro}
            aria-label="Hear Charlie explain this page"
            className="relative w-[126px] h-[126px] md:w-36 md:h-36 shrink-0 transition-all hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
              style={{ background: '#0d0d0d', border: `3px solid ${GOLD}` }}>
              <video
                src={intro.charlieVideoUrl}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
                className="w-full h-full object-cover pointer-events-none"
              />
            </span>
            <span className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: GOLD, border: '2px solid #0d0d0d' }}>
              <Play className="w-5 h-5 ml-0.5" style={{ color: '#000' }} />
            </span>
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="px-8 pt-4 pb-8 text-center">
        <p className="text-xs font-black tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>DYSON & DYSON</p>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', color: '#1a1a1a', letterSpacing: '0.12em' }}>
          REAL ESTATE ANSWERS
        </h1>
        <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: '#3a2f1e', fontFamily: 'Georgia, serif' }}>
          Complex moves. Stuck deals. Questions about what we actually do. This is where you get straight answers.
        </p>
      </div>

      {/* ── Quick Tools ── */}
      <div className="px-8 pb-10 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/solve-my-story"
          className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:scale-[1.02]"
          style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.35)' }}>
          <Home className="w-6 h-6 shrink-0" style={{ color: GOLD }} />
          <div>
            <p className="font-black text-sm text-white">Solve My Story</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Describe your situation — we'll solve it</p>
          </div>
        </Link>
        <Link to="/GeminiSession"
          className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:scale-[1.02]"
          style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.35)' }}>
          <Zap className="w-6 h-6 shrink-0" style={{ color: GOLD }} />
          <div>
            <p className="font-black text-sm text-white">Gemini Session</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Live 3-way session with AI + senior staff</p>
          </div>
        </Link>
      </div>

      {/* ── FAQ ── */}
      <div className="px-8 pb-16 max-w-2xl mx-auto">
        <p className="text-xs font-black tracking-[0.25em] uppercase mb-5" style={{ color: GOLD }}>COMMON QUESTIONS</p>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} canPlay={qaReady(i)} onPlay={() => playFaq(i)} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl px-7 py-8 text-center"
          style={{ background: '#111', border: `2px solid ${GOLD}` }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>STILL HAVE QUESTIONS?</p>
          <p className="text-white text-sm leading-relaxed mb-5" style={{ fontFamily: 'Georgia, serif' }}>
            Charlie is available 24/7. Or call us directly — a real human picks up.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/chat"
              className="px-8 py-3 rounded-full font-bold text-sm"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              Talk to Charlie →
            </Link>
            <a href="tel:+18583531200"
              className="px-8 py-3 rounded-full font-bold text-sm"
              style={{ background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD }}>
              (858) 353-1200
            </a>
          </div>
        </div>
      </div>

      <FloatingCharlie />
    </div>
  );
}