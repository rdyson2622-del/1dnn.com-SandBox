import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, PanelLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import ClientStory from '@/components/landing/ClientStory';
import MobileTopBar from '@/components/home/MobileTopBar';
import ClientSidebar from '@/components/layout/ClientSidebar';
import PortalSubscribeForm from '@/components/portal/PortalSubscribeForm';
import CharliePagePresenter from '@/components/charlie/CharliePagePresenter';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

const QUICK_STARTS = [
  { label: "I'm moving and need a plan.", desc: "Relo Prong", link: "/relocation-intake" },
  { label: "I'm stuck in a deal.", desc: "Story-Solving / Escrow", link: "/chat" },
  { label: "I'm an Agent or Lender.", desc: "Enterprise Portal", link: "/portal" },
];

export default function Home() {
  const [pillFocused, setPillFocused] = useState(false);
  const [situation, setSituation] = useState('');
  const [story, setStory] = useState('');
  const [storySubmitted, setStorySubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // Always land clean — the sidebar never shows until the visitor clicks the Client Portal pill
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      sessionStorage.setItem('dyson_sidebar_expanded', String(!prev));
      return !prev;
    });
  };
  const [headingVisible, setHeadingVisible] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeadingVisible(true); },
      { threshold: 0.3 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    appClient.auth.me().then(u => { if (u?.role === 'admin') setIsAdmin(true); }).catch(() => {});
  }, []);

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
    <div className="flex min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Desktop Sidebar — hidden until the visitor engages via the Client Portal pill */}
      {sidebarOpen && (
        <div className="hidden md:flex">
          <ClientSidebar />
        </div>
      )}

      {/* D&D logo + Client Portal pill — top left */}
      <div className="fixed top-3 left-3 z-[10000] hidden md:flex flex-col items-center gap-2">
        <Link to="/?choose=1" title="Back to landing page">
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 w-auto transition-all hover:opacity-80" />
        </Link>
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 text-xs font-black tracking-[0.15em] px-4 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ background: '#0d0d0d', color: GOLD, border: '1px solid rgba(212,175,55,0.5)' }}
        >
          <PanelLeft className="w-4 h-4" />
          CLIENT PORTAL
        </button>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden">
          <MobileTopBar />
        </div>

        {/* Admin Toggle — fixed top right, always visible for admins */}
        {isAdmin && (
          <Link
            to="/admin"
            className="fixed top-3 right-3 z-[10000] hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}
          >
            Admin Panel
          </Link>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden md:pt-0 pt-11" style={{ background: 'transparent' }}>

        {/* ── DARK TOP SECTION: Logo + Title ── */}
        <div className="flex flex-col items-center justify-center px-8 pt-16 pb-12 text-center"
          style={{ background: '#0a0a0a' }}>

          {/* Logo */}
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-[70px] w-auto mb-6" />

          {/* Title */}
          <div style={{
            color: GOLD,
            fontSize: 'clamp(1.6rem, 4vw, 2.75rem)',
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            letterSpacing: '0.12em',
            lineHeight: 1.15
          }}>
            The Home Owner Management Ecosystem
          </div>
          <p className="font-black tracking-[0.3em] uppercase text-white mt-3" style={{ fontSize: '0.95rem' }}>
            ONE OF A KIND
          </p>
        </div>

        {/* ── TAN BOTTOM SECTION: Pill + Story ── */}
        <div className="relative flex flex-col items-center px-8 pt-6 pb-14 text-center" style={{ background: '#ede0cc' }}>

          {/* Charlie welcome — upper right of the page content, in flow so it never overlaps */}
          <div className="w-full flex justify-end mb-4">
            <div className="relative w-[126px] h-[126px] md:w-36 md:h-36 shrink-0">
              <CharliePagePresenter pageKey="client-home" inline positionClass="top-0 left-0" />
            </div>
          </div>

          {/* ── THE PILL ── */}
          <div className="w-full max-w-4xl">
            <div
              className="flex flex-row items-center rounded-lg px-3 py-2 gap-2 transition-all duration-300"
              style={{
                background: '#2a2a2a',
                border: `2px solid ${pillFocused ? GOLD : 'rgba(212,175,55,0.3)'}`,
                boxShadow: pillFocused ? `0 0 40px rgba(212,175,55,0.15)` : 'none',
              }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <Search className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                <div className="relative flex-1 min-w-0 overflow-hidden">
                {/* Scrolling placeholder shown when empty and not focused */}
                {!situation && !pillFocused && (
                  <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden">
                    <div className="whitespace-nowrap text-xs text-white opacity-100 animate-marquee">
                      Tell us your real estate issue or opportunity and we'll help you ASAP! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; We are pretty good at reducing stress! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; And...at no expense to you. Try us out! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Tell us your real estate issue or opportunity and we'll help you ASAP! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; We are pretty good at reducing stress! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; And...at no expense to you. Try us out! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  onFocus={() => setPillFocused(true)}
                  onBlur={() => setTimeout(() => setPillFocused(false), 200)}
                  placeholder=""
                  className="w-full bg-transparent text-white text-xs outline-none"
                  style={{ caretColor: GOLD }}
                />
                </div>
              </div>
              <Link to="/solve-my-story" className="shrink-0">
                <button
                  className="px-3 py-1.5 rounded-md text-[11px] font-black text-black shrink-0 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  style={{ 
                    background: `linear-gradient(135deg, #e8c84a, ${GOLD})`,
                    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Solve My Story
                </button>
              </Link>
            </div>

            {/* ── QUICK STARTS (appear on focus) ── */}
            <div className={`transition-all duration-300 overflow-hidden ${pillFocused ? 'max-h-60 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {QUICK_STARTS.map((qs, i) => (
                  <Link key={i} to={qs.link}
                    className="flex flex-col items-start px-4 py-3 rounded-xl text-left transition-all hover:border-yellow-400/60 group"
                    style={{ background: '#f0f0f0', border: '1px solid #000' }}>
                    <span className="text-gray-900 text-sm font-semibold group-hover:text-yellow-600 transition-colors leading-snug">{qs.label}</span>
                    <span className="text-[10px] mt-1 font-bold tracking-widest uppercase" style={{ color: GOLD }}>{qs.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── MARKETING BRIDGE ── */}
          <div className="w-full max-w-4xl mt-14 mb-2">
            <div className="rounded-2xl px-8 py-10 text-center"
              style={{ background: 'rgba(0,0,0,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <p className="font-black leading-tight mb-2"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(1.4rem, 3.5vw, 2.25rem)',
                  color: '#1a1a1a',
                  letterSpacing: '0.04em',
                }}>
                Moving is a Logistics Problem.<br />
                Selling is a Story Problem.<br />
                <span style={{ color: GOLD }}>We Solve Both.</span>
              </p>
              <p className="text-sm mt-4 mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: '#4a3a28', fontFamily: 'Georgia, serif' }}>
                Whether you need a full relocation managed end-to-end, or you're stuck in a deal that won't close — we have a path for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/relo-management"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: `1px solid ${GOLD}`,
                    color: GOLD,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.15)',
                  }}>
                  🏠 Explore Relocation Services
                </a>
                <a href="/real-estate-answers"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: `1px solid ${GOLD}`,
                    color: GOLD,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.15)',
                  }}>
                  💬 Get Real Estate Answers
                </a>
              </div>
            </div>
          </div>

          {/* ── CLIENT STORIES ── */}
          <div className="w-full max-w-4xl mt-12 text-left">

            <div
              ref={headingRef}
              className="mb-8"
              style={{
                opacity: headingVisible ? 1 : 0,
                transform: headingVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.9s ease, transform 0.9s ease',
              }}
            >
              <p className="display-heading mb-2" style={{ fontSize: 'clamp(1.3rem, 3.9vw, 1.82rem)', letterSpacing: '0.2em', color: '#1a1a1a' }}>
                REVIEW CLIENT STORIES &amp; SOLUTIONS
              </p>
              <p style={{ color: GOLD, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '2.29rem', animation: 'gentlePulse 3s ease-in-out infinite' }}>
                Tap any story to read or watch the full case study.
              </p>
            </div>

            {/* Story 1 — Windean Stratton */}
            <ClientStory
              label="4-State Relocation · Arizona → Arkansas"
              headline="The 4-State Farm Relocation: How We Moved a Family (and 13 Chickens) Without a Hitch."
              defaultOpen
            >
              {/* Windeans testimonial video */}
              <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#000', border: '1px solid rgba(212,175,55,0.3)' }}>
                <p className="text-xs font-black tracking-[0.25em] uppercase mb-3 px-4 pt-4" style={{ color: GOLD }}>▶ WATCH THE WINDEANS' STORY</p>
                <video
                  src="/assets/move-story-web.m4v"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full block"
                  style={{ aspectRatio: '16/9' }}
                />
              </div>
              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE SITUATION</p>
              <p className="text-white leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                Moving across town is stressful. Now imagine moving across four states, coordinating the sale of your current home, the purchase of a new one, managing two moving trucks, and transporting a cat and 13 chickens.
              </p>
              <p className="text-white leading-relaxed mb-8" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                That was the situation John and Windean faced when relocating from Apache Junction, Arizona, to Jonesboro, Arkansas. If the timing on either the sale or the purchase fell through, they wouldn't just be out of a home — they'd be stranded on the highway with a barnyard in the backseat.
              </p>
              <div className="h-px w-12 mb-8" style={{ background: `rgba(212,175,55,0.5)` }} />

              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE ECOSYSTEM SOLVE</p>
              <p className="text-white leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                At the Dyson Referral Group, we know that a cross-country move of this magnitude requires more than just luck — it requires an Ecosystem.
              </p>
              <p className="text-white leading-relaxed mb-8" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                We didn't just hand John and Windean a phone number. Bob Dyson personally vetted and selected the absolute top-tier real estate and escrow teams in both states. As Relocation Managers, the Dyson team stayed embedded in every text and email thread between the brokers, the title companies, and the clients from day one — monitoring progress, ensuring total transparency, and managing the moving parts so the Strattons could focus on the drive.
              </p>
              <div className="h-px w-12 mb-8" style={{ background: `rgba(212,175,55,0.5)` }} />

              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE CLIENT'S VOICE</p>
              <p className="text-white leading-relaxed mb-5" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                The result? What could have been a logistical nightmare became a total success. Here is the letter Windean sent us the moment they arrived in Arkansas:
              </p>
              <blockquote className="rounded-2xl px-6 py-6 mb-8 relative"
                style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid rgba(212,175,55,0.3)` }}>
                <span className="text-5xl absolute top-2 left-4 leading-none" style={{ color: GOLD, opacity: 0.25, fontFamily: 'Georgia, serif' }}>"</span>
                <p className="text-white leading-relaxed italic pt-3" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                  With two trucks full of our home's adornments en route, John, 13 chickens, one cat, and I have made it safely to our new home in Bono, Arkansas. Traveling across four states with all those animals was a true test of my endurance... but I just wanted to write a letter of gratitude for the most efficient and professional home buying experience of all time!
                </p>
                <p className="text-white leading-relaxed italic mt-4" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
                  Bob, you took the time to research and vet many people to find us the 'best of the best' on both ends of our move. With your extensive expertise, you made this a buttery-smooth transaction. I am certain this would have gone very differently had you not gone the distance. Thank you for making this so easy, so smooth, and so pleasurable.
                </p>
                <p className="mt-4 text-sm font-bold" style={{ color: GOLD }}>— Windean Stratton</p>
              </blockquote>
              <div className="h-px w-12 mb-8" style={{ background: `rgba(212,175,55,0.5)` }} />

              <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE LESSON</p>
              <p className="text-white leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem' }}>
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

            {/* ── CLIENT SUBSCRIBE — bottom of the scroll ── */}
            <div className="mt-12">
              <PortalSubscribeForm portalName="Client Concierge" source="Client Portal" roleKey="client" dest="/home" />
            </div>

          </div>
        </div>

        {/* ── DNN MORNING BRIEF CORNER CARD ── */}
        {brief && (
          <Link to="/dnn-news"
            className="hidden md:block fixed bottom-6 right-6 max-w-xs rounded-2xl px-4 py-3 transition-all hover:scale-105 z-40"
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
    </div>
  );
}
