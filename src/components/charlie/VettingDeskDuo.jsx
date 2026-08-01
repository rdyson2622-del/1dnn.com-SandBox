import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { appClient } from '@/api/appClient';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

const QUESTIONS = [
  {
    q: "What information should I include when I refer a client?",
    a: "Everything you can. Destination city, preferred timetable, price range, family situation, and anything special about the move. The more you give us up front, the faster and more precisely we vet the destination side.",
  },
  {
    q: "What happens to my client after I hand them off?",
    a: "We move with them — step by step through the entire relocation, as if we were moving right alongside them. Agent selection, escrow timelines, schools, utilities, healthcare, and a 30/60/90 day settle-in plan. And you stay in the loop the whole way.",
  },
  {
    q: "How do you match my client to a destination agent?",
    a: "Geography is only the starting point. We capture a voice and video interview with every candidate agent applying for the buyer representation — so your client hears each applicant's voice, answers, expressions, and personality, and picks the one they want to interview further.",
  },
  {
    q: "Do you have real relocation experience — personal and corporate?",
    a: "Both — with testimonials to prove it. Five decades of personal family moves and full corporate relocations. We've lived these moves ourselves, and we treat your client's move like it's our own.",
  },
  {
    q: "How do the referral fees and commissions work when I send you a client?",
    a: "Our referral agreement pays you 25% of the buy-side commission, through your broker arrangement. We collect an additional 15–25% as our management fee for the entire move. Will a receiving broker agree to 50% total? The sweat equity on a $300K home is the same as a $3M home — and we've never had a receiving agent decline.",
  },
  {
    q: "What bonuses do Dyson affiliate agents and brokers receive?",
    a: "Each month we allocate 5–10% of our management fee as a bonus pool for every affiliate who closed a transaction that month — nationwide and worldwide — plus 1–3% paid equally to passive affiliates. And soon: daily broadcast real estate news with YOU cloned as the presenter via DNN Real Estate News.",
  },
];

export default function VettingDeskDuo() {
  const [clips, setClips] = useState([]);
  const [sequence, setSequence] = useState(null);

  useEffect(() => {
    appClient.entities.VettingDeskClip.list()
      .then(setClips)
      .catch(() => {});
  }, []);

  const intro = clips.find(c => c.kind === 'intro');
  const outro = clips.find(c => c.kind === 'outro');
  const introReady = intro?.charlieStatus === 'completed' && intro?.charlieVideoUrl;

  const qaReady = (i) => {
    const qa = clips.find(c => c.kind === 'qa' && c.faqIndex === i);
    return qa?.charlieStatus === 'completed' && qa?.bobStatus === 'completed';
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
    <div className="px-6 py-16 max-w-3xl mx-auto">
      {sequence && (
        <QADuoPresenter segments={sequence} onClose={() => setSequence(null)} />
      )}

      <p className="text-xs font-black tracking-[0.3em] text-center mb-3" style={{ color: GOLD }}>
        THE DYSON NATIONAL VETTING DESK
      </p>
      <h2 className="text-center font-black text-2xl md:text-3xl text-white mb-4"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        Your Client. Our Full-Time Job.
      </h2>
      <p className="text-center text-sm leading-relaxed max-w-xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
        Tell us as much about your client as you can — where they're relocating to and their preferred
        timetable. From that moment on, we stay with them through the entire move, step by step, as if
        we were moving right alongside them. Tap any question below and hear Bob Dyson answer it himself.
      </p>

      {/* Charlie intro circle */}
      {introReady && (
        <div className="flex justify-center mb-10">
          <button onClick={playIntro} aria-label="Hear Charlie introduce the Vetting Desk"
            className="relative w-36 h-36 transition-all hover:scale-105 active:scale-95">
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
            <span className="absolute bottom-1 right-1 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: GOLD, border: '2px solid #0d0d0d' }}>
              <Play className="w-5 h-5 ml-0.5" style={{ color: '#000' }} />
            </span>
          </button>
        </div>
      )}

      {/* Q&A cards */}
      <div className="grid gap-4">
        {QUESTIONS.map((item, i) => (
          <div key={i} className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <p className="font-black text-sm text-white mb-2">{item.q}</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.a}</p>
            {qaReady(i) && (
              <button onClick={() => playFaq(i)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wide transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
                <Play className="w-3.5 h-3.5" /> Hear Bob Dyson answer this
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}