import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import ClientStory from '@/components/landing/ClientStory';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

const QUICK_STARTS = [
  { label: "I'm moving and need a plan.", desc: "Relo Prong", link: "/relocation-intake" },
  { label: "I'm stuck in a deal.", desc: "Story-Solving / Escrow", link: "/chat" },
  { label: "I'm an Agent or Lender.", desc: "Enterprise Portal", link: "/find-agent" },
];

export default function AdminNewLandingPage() {
  const [pillFocused, setPillFocused] = useState(false);
  const [situation, setSituation] = useState('');
  const [story, setStory] = useState('');
  const [storySubmitted, setStorySubmitted] = useState(false);

  // Fetch latest DNN article for bottom corner card
  const { data: articles = [] } = useQuery({
    queryKey: ['landingDnnBrief'],
    queryFn: () => appClient.entities.DnnArticle.filter(
      { status: 'published' }, '-generated_date', 1
    ),
  });
  const brief = articles[0] || null;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#0a0a0a' }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: 'transparent' }}>

        {/* ── DARK TOP SECTION: Logo + Title ── */}
        <div className="flex flex-col items-center justify-center px-8 pt-16 pb-12 text-center"
          style={{ background: '#0a0a0a' }}>

          {/* Logo */}
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-14 w-auto mb-6" />

          {/* H.O.M.E. Title */}
          <div className="mb-1" style={{
            color: GOLD,
            fontSize: '4rem',
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            letterSpacing: '0.15em',
            lineHeight: 1
          }}>
            HOME
          </div>
          <p className="text-xs font-black tracking-[0.25em] uppercase text-white mb-0">
            Home Ownership Management Ecosystem
          </p>
        </div>

        {/* ── TAN BOTTOM SECTION: Pill + Story ── */}
        <div className="flex flex-col items-center px-8 py-14 text-center" style={{ background: '#ede0cc' }}>

          {/* ── THE PILL ── */}
          <div className="w-full max-w-2xl">
            <div
              className="flex items-center rounded-2xl px-5 py-4 gap-3 transition-all duration-300"
              style={{
                background: '#2a2a2a',
                border: `2px solid ${pillFocused ? GOLD : 'rgba(212,175,55,0.3)'}`,
                boxShadow: pillFocused ? `0 0 40px rgba(212,175,55,0.15)` : 'none',
              }}
            >
              <Search className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
              <input
                type="text"
                value={situation}
                onChange={e => setSituation(e.target.value)}
                onFocus={() => setPillFocused(true)}
                onBlur={() => setTimeout(() => setPillFocused(false), 200)}
                placeholder="What is your real estate situation?"
                className="flex-1 bg-transparent text-white text-base outline-none placeholder-white"
                style={{ caretColor: GOLD }}
              />
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-black text-black shrink-0 transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}
              >
                Solve My Story
              </button>
            </div>

            {/* ── QUICK STARTS (appear on focus) ── */}
            <div className={`transition-all duration-300 overflow-hidden ${pillFocused ? 'max-h-60 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {QUICK_STARTS.map((qs, i) => (
                  <Link key={i} to={qs.link}
                    className="flex flex-col items-start px-4 py-3 rounded-xl text-left transition-all hover:border-yellow-400/60 group"
                    style={{ background: '#f0f0f0', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <span className="text-gray-900 text-sm font-semibold group-hover:text-yellow-600 transition-colors leading-snug">{qs.label}</span>
                    <span className="text-[10px] mt-1 font-bold tracking-widest uppercase" style={{ color: GOLD }}>{qs.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── CLIENT STORIES ── */}
          <div className="w-full max-w-2xl mt-12 text-left">

            <p className="text-xs font-black tracking-[0.3em] uppercase mb-2" style={{ color: GOLD }}>
              CLIENT STORIES · RELOCATION MANAGEMENT
            </p>
            <p className="text-sm mb-6" style={{ color: 'rgba(26,26,26,0.5)', fontFamily: 'Georgia, serif' }}>
              Tap any story to read the full case study.
            </p>

            {/* Story 1 — Windean Stratton */}
            <ClientStory
              label="4-State Relocation · Arizona → Arkansas"
              headline="The 4-State Farm Relocation: How We Moved a Family (and 13 Chickens) Without a Hitch."
            >
              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE SITUATION</p>
              <p className="text-gray-900 leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                Moving across town is stressful. Now imagine moving across four states, coordinating the sale of your current home, the purchase of a new one, managing two moving trucks, and transporting a cat and 13 chickens.
              </p>
              <p className="text-gray-900 leading-relaxed mb-8" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                That was the situation John and Windean faced when relocating from Apache Junction, Arizona, to Jonesboro, Arkansas. If the timing on either the sale or the purchase fell through, they wouldn't just be out of a home — they'd be stranded on the highway with a barnyard in the backseat.
              </p>
              <div className="h-px w-12 mb-8" style={{ background: `rgba(212,175,55,0.5)` }} />

              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE ECOSYSTEM SOLVE</p>
              <p className="text-gray-900 leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                At the Dyson Referral Group, we know that a cross-country move of this magnitude requires more than just luck — it requires an Ecosystem.
              </p>
              <p className="text-gray-900 leading-relaxed mb-8" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                We didn't just hand John and Windean a phone number. Bob Dyson personally vetted and selected the absolute top-tier real estate and escrow teams in both states. As Relocation Managers, the Dyson team stayed embedded in every text and email thread between the brokers, the title companies, and the clients from day one — monitoring progress, ensuring total transparency, and managing the moving parts so the Strattons could focus on the drive.
              </p>
              <div className="h-px w-12 mb-8" style={{ background: `rgba(212,175,55,0.5)` }} />

              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE CLIENT'S VOICE</p>
              <p className="text-gray-900 leading-relaxed mb-5" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                The result? What could have been a logistical nightmare became a total success. Here is the letter Windean sent us the moment they arrived in Arkansas:
              </p>
              <blockquote className="rounded-2xl px-6 py-6 mb-8 relative"
                style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid rgba(212,175,55,0.3)` }}>
                <span className="text-5xl absolute top-2 left-4 leading-none" style={{ color: GOLD, opacity: 0.25, fontFamily: 'Georgia, serif' }}>"</span>
                <p className="text-gray-900 leading-relaxed italic pt-3" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                  With two trucks full of our home's adornments en route, John, 13 chickens, one cat, and I have made it safely to our new home in Bono, Arkansas. Traveling across four states with all those animals was a true test of my endurance... but I just wanted to write a letter of gratitude for the most efficient and professional home buying experience of all time!
                </p>
                <p className="text-gray-900 leading-relaxed italic mt-4" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                  Bob, you took the time to research and vet many people to find us the 'best of the best' on both ends of our move. With your extensive expertise, you made this a buttery-smooth transaction. I am certain this would have gone very differently had you not gone the distance. Thank you for making this so easy, so smooth, and so pleasurable.
                </p>
                <p className="mt-4 text-sm font-bold" style={{ color: GOLD }}>— Windean Stratton</p>
              </blockquote>
              <div className="h-px w-12 mb-8" style={{ background: `rgba(212,175,55,0.5)` }} />

              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE LESSON</p>
              <p className="text-gray-900 leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                At Dyson, our philosophy is simple: Proper planning, elite professionals, and relentless daily management are the ingredients of a stress-free relocation. You don't just need an agent — you need an enterprise managing the timeline.
              </p>
            </ClientStory>

            {/* ── Add more <ClientStory> blocks here as you collect them ── */}

            {/* CTA */}
            <div className="rounded-2xl px-7 py-8 text-center mt-10"
              style={{ background: '#111', border: `2px solid ${GOLD}` }}>
              <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>YOUR STORY IS NEXT</p>
              <p className="text-white leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: '1rem' }}>
                Every home has a story, and every move has a conflict. Are you planning a complex relocation, or is your current real estate transaction stuck in the mud?
              </p>
              <button
                onClick={() => window.location.href = '/solve-my-story'}
                className="px-10 py-4 rounded-full font-bold text-base tracking-wider transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}
              >
                Solve My Story →
              </button>
              <p className="text-xs mt-4 opacity-50 text-white">No sales pitch. Just a resolution. 55 years of relocation management experience.</p>
            </div>

          </div>
        </div>

        {/* ── DNN MORNING BRIEF CORNER CARD ── */}
        {brief && (
          <Link to="/dnn-news"
            className="fixed bottom-6 right-6 max-w-xs rounded-2xl px-4 py-3 transition-all hover:scale-105 z-40"
            style={{
              background: '#111',
              border: `1px solid rgba(212,175,55,0.3)`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
              <p className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>
                DNN Morning Brief · {today}
              </p>
            </div>
            <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{brief.headline}</p>
            <p className="text-[10px] mt-1.5 font-bold" style={{ color: GOLD }}>Read full brief →</p>
          </Link>
        )}

      </div>
    </div>
  );
}