import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Users, Mic, DollarSign, Handshake, TrendingUp, Play, Scale } from 'lucide-react';
import { appClient } from '@/api/appClient';
import QADuoPresenter from '@/components/charlie/QADuoPresenter';

const GOLD = '#D4AF37';

const POINTS = [
  {
    icon: DollarSign,
    title: 'The Client Pays Nothing',
    body: "Unlike corporate relo companies, our service is completely free to the relocating family. We're funded through referral agreements with the agents and brokers we recommend — 100% compliant with DRE regulations. Your client arrives grateful, not nickel-and-dimed.",
  },
  {
    icon: Users,
    title: 'You Get DIRECT Access to the Client',
    body: "No corporate gatekeeper standing between you and the buyer. Because you're participating in our corporate or private relocation process — and abide by our strict guidelines — you work directly with the client from the first introduction. You represent them; we manage the move around you.",
  },
  {
    icon: Mic,
    title: 'The Client Chooses YOU',
    body: 'We capture a voice and video interview from every candidate agent. The client hears your voice, your answers, your personality — and selects the agent they want. You win the representation on merit, not on a rotation list.',
  },
  {
    icon: Handshake,
    title: 'A Fee Structure That Works',
    body: "Our referral and management fee totals 50% of the buy-side commission — 25% to the sending agent, 15–25% to us for managing the entire move. Remember: the sweat equity of selling a $300K home is the same as a $3M home. We've never had a receiving agent decline.",
  },
  {
    icon: Scale,
    title: 'The Sweat Equity Test — How We Vet Your Mindset',
    body: "This is the conversation no agent wants to have — and that's exactly why we have it. Does it take the same time, skill, and effort to sell a $300K home as a $3M home? The answer is yes. The sweat equity is identical. Yet for 75 years this industry has clung to a percentage-based formula that punishes affordability. When we bring up our referral fee, we're watching and listening: if an agent's tone shifts, if their eyes narrow, if they start calculating their percentage instead of focusing on the qualified client we're handing them — we know immediately. The wrong candidate reveals themselves in their voice and their face. The right agent? They see income, not percentage. They see a managed pipeline of corporate relocation clients delivered to their door. We never have to guess who's who.",
  },
  {
    icon: ShieldCheck,
    title: 'We Quarterback Everything Else',
    body: 'Escrow coordination across two markets, timetables, utilities, schools, healthcare, and a 30/60/90 day settle-in plan. You focus on finding the home — we handle the logistics that usually kill deals.',
  },
  {
    icon: TrendingUp,
    title: 'Monthly Affiliate Bonus Pool',
    body: 'As a network member, you share in 5–10% of our management fees each month you close — nationwide and worldwide — plus 1–3% paid equally to passive affiliates on all network sales.',
  },
];

export default function ReceivingAgentModal({ onClose }) {
  const [clips, setClips] = useState([]);
  const [segments, setSegments] = useState(null);

  useEffect(() => {
    appClient.entities.ReceivingAgentClip.list().then(setClips).catch(() => {});
  }, []);

  const introClip = clips.find(c => c.kind === 'intro' && c.charlieStatus === 'completed');
  const qaClip = (i) => clips.find(c => c.kind === 'qa' && c.faqIndex === i
    && c.charlieStatus === 'completed' && c.bobStatus === 'completed');

  const playIntro = () => {
    if (!introClip) return;
    setSegments([{ src: introClip.charlieVideoUrl, speaker: 'charlie' }]);
  };

  const playQA = (i) => {
    const clip = qaClip(i);
    if (!clip) return;
    setSegments([
      { src: clip.charlieVideoUrl, speaker: 'charlie' },
      { src: clip.bobVideoUrl, speaker: 'bob' },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#0d0d0d', border: '1px solid rgba(212,175,55,0.4)', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
          <div>
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>
              Referral Receiving Agent
            </p>
            <p className="text-white font-bold text-sm mt-0.5">Why Dyson &amp; Dyson Is Different</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Not another corporate relo company. Here's what changes when the referral comes from us.
            </p>
            {introClip && (
              <button
                onClick={playIntro}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide"
                style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}`, color: GOLD }}
              >
                <Play className="w-3 h-3" /> WATCH THE INTRO
              </button>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 hover:opacity-70 shrink-0" style={{ color: GOLD }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-3 overflow-y-auto">
          {POINTS.map(({ icon: Icon, title, body }, i) => {
            const hasVideo = !!qaClip(i);
            return (
              <div key={title} className="flex gap-3.5 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}` }}>
                  <Icon className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm text-white mb-1">{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{body}</p>
                  {hasVideo && (
                    <button
                      onClick={() => playQA(i)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide"
                      style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}`, color: GOLD }}
                    >
                      <Play className="w-3 h-3" /> HEAR IT FROM BOB
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* CTA */}
          <div className="rounded-xl px-5 py-4 text-center" style={{ background: 'rgba(212,175,55,0.1)', border: `1px solid ${GOLD}` }}>
            <p className="text-sm text-white leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Want to receive vetted, move-managed referrals in your market? Talk to us directly.
            </p>
            <a href="tel:+18583531200"
              className="inline-block px-8 py-2.5 rounded-full font-black text-sm"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              Call (858) 353-1200
            </a>
          </div>
        </div>
      </div>

      {segments && <QADuoPresenter segments={segments} onClose={() => setSegments(null)} />}
    </div>
  );
}