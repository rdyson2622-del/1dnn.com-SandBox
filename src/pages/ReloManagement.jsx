import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, UserCheck, Building2, Truck, Zap, GraduationCap, HeartPulse, CheckCircle2, ArrowRight } from 'lucide-react';
import FloatingCharlie from '@/components/charlie/FloatingCharlie';
import CharliePagePresenter from '@/components/charlie/CharliePagePresenter';
import ReloManagementVideoBg from './ReloManagementVideoBg';

const GOLD = '#D4AF37';

export default function ReloManagement() {
  // Video pipeline mode: render only the clean 1920×1080 background, no chrome.
  const isVideoMode = new URLSearchParams(window.location.search).get('videoMode') === 'true';
  if (isVideoMode) {
    return <ReloManagementVideoBg />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#fff' }}>

      {/* ── Shard2: Charlie video presenter (upper-right, non-intrusive) ── */}
      <CharliePagePresenter pageKey="relocation-services" topOffsetClass="top-44 md:top-48" />

      {/* ── SLIDE 1: We Don't Send You a Map ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 py-20 text-center"
        style={{ background: '#ede0cc', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-6" style={{ color: GOLD }}>THE DYSON PROMISE</p>
        <h1 className="display-heading mb-4"
          style={{ fontSize: 'clamp(1.65rem, 4.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '0.12em', color: '#1a1a1a' }}>
          WE DON'T SEND YOU A MAP.
        </h1>
        <h2 className="display-heading mb-10"
          style={{ fontSize: 'clamp(1.36rem, 3.825vw, 2.55rem)', lineHeight: 1.1, letterSpacing: '0.12em', color: GOLD }}>
          WE MAKE THE JOURNEY WITH YOU.
        </h2>
        <div className="max-w-2xl space-y-5">
          <p className="text-lg leading-relaxed" style={{ color: '#1a1a1a' }}>
            We are <strong style={{ color: GOLD }}>Relocation Managers</strong>. Not Agents. Not a listing service. We help families and professionals sell their current home and find their next one, anywhere in the country. Every step below is something Charlie and your Dyson team actively execute on your behalf, all the way through close of escrow and beyond.
          </p>
          <p className="text-base italic leading-relaxed" style={{ color: '#4a4a4a' }}>
            We intentionally work with a limited number of families at any given time. This isn't exclusivity — it's commitment. Real relocation management requires deep local focus, market expertise, timeline coordination, and relentless attention to detail. We're not scaling a service. We're delivering one.
          </p>
        </div>
      </section>

      {/* ── SLIDE 2: Our Services ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 py-20"
        style={{ background: '#ede0cc', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-6 text-center" style={{ color: GOLD }}>WHAT WE HANDLE</p>
        <h1 className="display-heading text-center mb-12"
          style={{ fontSize: 'clamp(1.5rem, 3.75vw, 2.625rem)', letterSpacing: '0.12em', color: '#1a1a1a' }}>
          OUR SERVICES
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            { icon: MessageCircle, title: 'AI Concierge Chat', desc: 'Charlie is available 24/7 to answer every question' },
            { icon: MapPin, title: 'Neighborhood Research', desc: 'Deep-dive analysis of neighborhoods matching your lifestyle' },
            { icon: UserCheck, title: 'Agent Selection', desc: 'We interview agents on your behalf' },
            { icon: Building2, title: 'Home Search Strategy', desc: 'AI-powered property matching based on your criteria' },
            { icon: Truck, title: 'Moving Coordination', desc: 'From packing to delivery — complete logistics' },
            { icon: Zap, title: 'Utilities & Services', desc: 'Internet, electric, gas, water set up before arrival' },
            { icon: GraduationCap, title: 'School Enrollment', desc: 'District research, tours, and enrollment handled' },
            { icon: HeartPulse, title: 'Healthcare Setup', desc: 'Find top-rated doctors, dentists, specialists' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl flex flex-col items-center text-center gap-3"
              style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <s.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <p className="font-bold text-sm text-white">{s.title}</p>
              <p className="text-xs leading-relaxed text-white">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SLIDE 3: The Scope Is Real ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 py-20 text-center"
        style={{ background: '#ede0cc', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-6" style={{ color: GOLD }}>THE COMMITMENT</p>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.5rem, 3.75vw, 2.625rem)', letterSpacing: '0.12em', color: '#1a1a1a' }}>
          THE SCOPE IS EXTENSIVE
        </h1>
        <h2 className="display-heading mb-12"
          style={{ fontSize: 'clamp(1.19rem, 2.975vw, 2.04rem)', letterSpacing: '0.12em', color: GOLD }}>
          THAT'S WHY WE EXIST.
        </h2>
        <div className="max-w-2xl space-y-5 text-left">
          <p className="text-lg leading-relaxed text-center" style={{ color: '#1a1a1a' }}>
            Seeing the full scope of what's ahead can feel overwhelming.
          </p>
          <div className="rounded-2xl p-8" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
            <p className="text-xs font-black tracking-[0.3em] mb-4 text-center" style={{ color: GOLD }}>AFTER YOU COMMIT — THE GEMINI SESSION</p>
            <p className="text-base leading-relaxed mb-4 text-white">
              Once you've confirmed your contact information, we set up a private three-way live session — you, Google Gemini, and Senior Staff. This is a real conversation where we build your complete relocation profile together, in real time.
            </p>
            <p className="text-base leading-relaxed text-white">
              This session is <strong style={{ color: GOLD }}>by invitation only</strong> — we're selective about who we work with. No cost to you, ever.
            </p>
          </div>
        </div>
      </section>

      {/* ── SLIDE 4: Experienced Experts ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 py-20 text-center"
        style={{ background: '#ede0cc', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-6" style={{ color: GOLD }}>HUMAN + AI</p>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.5rem, 3.75vw, 2.625rem)', letterSpacing: '0.12em', color: '#1a1a1a' }}>
          EXPERIENCED EXPERTS,
        </h1>
        <h2 className="display-heading mb-12"
          style={{ fontSize: 'clamp(1.19rem, 2.975vw, 2.04rem)', letterSpacing: '0.12em', color: GOLD }}>
          POWERED BY AI.
        </h2>
        <div className="max-w-2xl space-y-6">
          <p className="text-lg leading-relaxed" style={{ color: '#1a1a1a' }}>
            AI handles data aggregation, comp analysis, document generation, and 24/7 availability. Real estate experts position you to make wise judgment calls, approve major decisions, and guide you through your entire relocation.
          </p>
          <p className="text-xl font-bold" style={{ color: GOLD }}>
            And it costs you absolutely nothing — we are funded by the selected Brokers and Agents.
          </p>
        </div>
      </section>

      {/* ── SLIDE 5: Your Agent. Your Choice. ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 py-20 text-center"
        style={{ background: '#ede0cc', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-6" style={{ color: GOLD }}>AGENT SELECTION</p>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.5rem, 3.75vw, 2.625rem)', letterSpacing: '0.12em', color: '#1a1a1a' }}>
          YOUR AGENT. YOUR CHOICE.
        </h1>
        <h2 className="display-heading mb-12"
          style={{ fontSize: 'clamp(1.19rem, 2.975vw, 2.04rem)', letterSpacing: '0.12em', color: GOLD }}>
          ZERO GUESSWORK.
        </h2>
        <div className="max-w-xl w-full space-y-3 text-left">
          <p className="text-base leading-relaxed mb-6 text-center" style={{ color: '#1a1a1a' }}>
            Most people find an agent through Zillow, a yard sign, or a friend — with no idea if they're any good. We eliminate that entirely.
          </p>
          {[
            'We profile your ideal agent before any names are shared',
            'Top 20 destination agents evaluated — production, DRE, personality',
            '3–5 personally vetted candidates presented for your review',
            'Your selection triggers immediate agent briefing & onboarding',
            'Zero cost to you as the buyer — always'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-xl text-sm"
              style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
              <span style={{ color: '#fff' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SLIDE 6: Ready for Your Fresh Start ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 py-20 text-center"
        style={{ background: '#ede0cc', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-6" style={{ color: GOLD }}>BEGIN YOUR JOURNEY</p>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.5rem, 3.75vw, 2.625rem)', letterSpacing: '0.12em', color: '#1a1a1a' }}>
          READY FOR YOUR
        </h1>
        <h2 className="display-heading mb-12"
          style={{ fontSize: 'clamp(1.19rem, 2.975vw, 2.04rem)', letterSpacing: '0.12em', color: GOLD }}>
          FRESH START?
        </h2>
        <div className="max-w-xl space-y-8">
          <p className="text-lg leading-relaxed" style={{ color: '#1a1a1a' }}>
            Talk to Charlie right now. Share where you're moving and we'll take it from there — your relocation manager, your Gemini session, your plan. No hidden fees. Always free.
          </p>
          <a 
           href="/relocation-intake"
           className="inline-block px-10 py-5 rounded-full font-black text-lg transition-all hover:scale-105 active:scale-95"
           style={{ 
             background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, 
             color: '#000',
             boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
             cursor: 'pointer',
             border: 'none',
             textDecoration: 'none',
             display: 'inline-block'
           }}
           onMouseEnter={e => e.target.style.boxShadow = '0 8px 28px rgba(212, 175, 55, 0.6)'}
           onMouseLeave={e => e.target.style.boxShadow = '0 4px 14px rgba(212, 175, 55, 0.3)'}
          >
           Let's Plan My Relocation Move
          </a>
        </div>
      </section>

      {/* ── For Employers strip ── */}
      <section className="px-8 md:px-16 py-12 text-center"
        style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>FOR EMPLOYERS</p>
        <p className="text-base leading-relaxed max-w-xl mx-auto mb-6 text-white">
          Managing relocations for your company? See how we eliminate corporate relocation management fees entirely.
        </p>
        <Link to="/corporate-relo"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
          Corporate Relo Services <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── SLIDE 7: The Dyson & Dyson Promise ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 md:px-16 py-20 text-center"
        style={{ background: '#ede0cc' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-6" style={{ color: GOLD }}>OUR COMMITMENT</p>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.5rem, 3.75vw, 2.625rem)', letterSpacing: '0.12em', color: '#1a1a1a' }}>
          THE DYSON &amp; DYSON PROMISE
        </h1>
        <h2 className="display-heading mb-12"
          style={{ fontSize: 'clamp(1.02rem, 2.55vw, 1.7rem)', letterSpacing: '0.12em', color: GOLD }}>
          LICENSED RELOCATION SERVICES
        </h2>
        <div className="space-y-4 max-w-md">
          <p className="text-base" style={{ color: '#1a1a1a' }}>The Dyson &amp; Dyson Companies, Inc.</p>
          <p className="text-base font-bold" style={{ color: GOLD }}>California Department of Real Estate #02303118</p>
          <p className="text-lg" style={{ color: '#1a1a1a' }}>Concierge Relocation Program • Free to Buyers</p>
          <p className="text-2xl font-black" style={{ color: GOLD }}>(858) 353-1200</p>
          <p className="text-sm mt-6" style={{ color: '#4a4a4a' }}>55 years of relocation management expertise.</p>
        </div>
      </section>

      <FloatingCharlie />
    </div>
  );
}