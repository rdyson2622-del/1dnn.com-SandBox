import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Home, DollarSign, Users, ArrowRight } from 'lucide-react';

const GOLD = '#D4AF37';
const DNN_LOGO = "/assets/dyson-logo.png";

// The three pillars — pill expands to reveal these
const PILLARS = [
  {
    key: 'relocation',
    icon: Home,
    question: 'Where are you headed?',
    sub: 'Relocation Intelligence',
    color: GOLD,
    bg: 'rgba(212,175,55,0.12)',
    border: 'rgba(212,175,55,0.35)',
    description: 'AI-powered concierge guiding your move from city research to closing day.',
    cta: 'Start My Relocation Profile',
    href: '/relocation-intake',
  },
  {
    key: 'financial',
    icon: DollarSign,
    question: 'Need financing in your new city?',
    sub: 'Financial Services Network',
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    description: 'Vetted DNN lenders, DRE-compliant, in your destination market.',
    cta: 'Explore Lender Network',
    href: '/financial-services',
  },
  {
    key: 'agent',
    icon: Users,
    question: 'Are you a real estate agent?',
    sub: 'Agent Bureau Partnership',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.3)',
    description: "Join DNN's Bureau and receive co-branded relocation leads in your market.",
    cta: 'Explore Bureau Partnership',
    href: '/chat',
  },
];

export default function LandingLab() {
  const [expanded, setExpanded] = useState(false);
  const [activePillar, setActivePillar] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (expanded && inputRef.current) inputRef.current.focus();
  }, [expanded]);

  const handlePillClick = () => {
    setExpanded(true);
    setActivePillar(null);
  };

  const handlePillarClick = (p) => {
    setActivePillar(activePillar?.key === p.key ? null : p);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{ background: '#060606' }}>

      {/* Admin notice banner */}
      <div className="fixed top-0 left-0 right-0 z-50 text-center py-2 text-xs font-bold tracking-widest"
        style={{ background: 'rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
        🧪 LANDING LAB — SANDBOX ONLY · Not the live home page
      </div>

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mt-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img src={DNN_LOGO} alt="DNN" className="h-12 w-auto" />
          <div className="text-left">
            <p className="text-white font-black text-sm tracking-widest">DYSON & DYSON</p>
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: GOLD }}>Real Estate Concierge</p>
          </div>
        </div>

        {/* Headline */}
        {!expanded && (
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
              Your Move.<br />
              <span style={{ color: GOLD }}>Intelligently Guided.</span>
            </h1>
            <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
              DNN delivers daily real estate intelligence — and when you're ready to move, we handle everything.
            </p>
          </div>
        )}

        {/* THE PILL */}
        <div
          onClick={!expanded ? handlePillClick : undefined}
          className={`relative transition-all duration-500 ${!expanded ? 'cursor-pointer' : ''}`}
          style={{ width: expanded ? '100%' : 'auto' }}>

          {!expanded ? (
            /* Collapsed pill */
            <div className="flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold shadow-2xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
                border: '1px solid rgba(212,175,55,0.5)',
                color: '#fff',
                boxShadow: '0 0 40px rgba(212,175,55,0.15)',
              }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GOLD }} />
              <span>Where are you headed? Tell DNN.</span>
              <ChevronRight className="w-4 h-4" style={{ color: GOLD }} />
            </div>
          ) : (
            /* Expanded state */
            <div className="w-full space-y-4">
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.4)' }}>
                <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: GOLD }} />
                <input
                  ref={inputRef}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Type your destination city, or explore below..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                />
                {inputVal && (
                  <button className="shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold text-black"
                    style={{ background: GOLD }}>
                    Go <ArrowRight className="w-3 h-3 inline ml-1" />
                  </button>
                )}
              </div>

              {/* Three pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PILLARS.map(p => {
                  const Icon = p.icon;
                  const isActive = activePillar?.key === p.key;
                  return (
                    <div key={p.key}>
                      <button
                        onClick={() => handlePillarClick(p)}
                        className="w-full text-left p-4 rounded-xl transition-all"
                        style={{
                          background: isActive ? p.bg : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? p.border : 'rgba(255,255,255,0.07)'}`,
                        }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-4 h-4 shrink-0" style={{ color: p.color }} />
                          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: p.color }}>{p.sub}</span>
                        </div>
                        <p className="text-sm text-white font-semibold leading-snug">{p.question}</p>
                      </button>

                      {/* Expanded pillar detail */}
                      {isActive && (
                        <div className="mt-2 p-4 rounded-xl space-y-3"
                          style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                          <p className="text-sm text-white leading-relaxed">{p.description}</p>
                          <a href={p.href}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
                            style={{ background: p.color }}>
                            {p.cta} <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dismiss */}
              <button onClick={() => { setExpanded(false); setActivePillar(null); setInputVal(''); }}
                className="text-xs text-slate-700 hover:text-slate-500 transition-colors w-full text-center mt-1">
                ← Collapse
              </button>
            </div>
          )}
        </div>

        {/* Below-pill stats — only when collapsed */}
        {!expanded && (
          <div className="mt-12 flex items-center gap-8 text-center">
            {[
              { value: '35K+', label: 'Newsletter Subscribers' },
              { value: '55 YRS', label: 'Legacy Expertise' },
              { value: '21 AI', label: 'Specialized Assistants' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-lg font-black" style={{ color: GOLD }}>{s.value}</p>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* DNN feed teaser */}
        {!expanded && (
          <div className="mt-10 w-full max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GOLD }}>Live From DNN</span>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="text-xs text-slate-400 italic">"Today's intelligence brief is live — tap to read the market moves that matter to your relocation."</p>
              <a href="/dnn-news" className="inline-flex items-center gap-1 mt-2 text-xs font-bold" style={{ color: GOLD }}>
                Read Today's Brief <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}