import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { appClient } from '@/api/appClient';
import {
  CheckCircle2, ArrowRight, ChevronDown, ChevronUp,
  UserCheck, MapPin, Search, ClipboardCheck,
  FileText, Key, Truck, Sparkles, ArrowLeft,
  MessageCircle, Building2, Zap, GraduationCap, HeartPulse
} from 'lucide-react';

import { RoadmapPhasePlay, RoadmapPhasePlayBadge } from '@/components/roadmap/RoadmapQASection';
import RoadmapCharlieCircle from '@/components/roadmap/RoadmapCharlieCircle';

const GOLD = '#D4AF37';

const PHASES = [
  {
    number: 1,
    icon: UserCheck,
    title: 'Onboarding & Profile',
    status: 'active',
    tagline: 'You are here — Welcome aboard.',
    steps: [
      'Relocation profile submitted ✓',
      'Intro call with Bob\'s team scheduled',
      'Private Gemini session assigned',
      'Relocation plan begins building',
    ],
    dyson_role: 'We review your profile, assign your relocation manager, and schedule your private session.',
  },
  {
    number: 2,
    icon: UserCheck,
    title: 'Agent Match',
    status: 'upcoming',
    tagline: 'Your vetted local expert, hand-picked.',
    steps: [
      'Agent personality interview with you',
      'Top 20 local agents evaluated',
      'DRE records & production checked',
      '3–5 finalists presented — you choose',
    ],
    dyson_role: 'Bob\'s team personally vets every candidate. No cold handoffs. No "I love me" agents.',
  },
  {
    number: 3,
    icon: Search,
    title: 'Property Search & Selection',
    status: 'upcoming',
    tagline: 'AI-powered matching to your exact criteria.',
    steps: [
      'Active listings matched to your profile',
      'Virtual and in-person tours coordinated',
      'Market comp analysis for each property',
      'Offer strategy developed with your agent',
    ],
    dyson_role: 'Charlie surfaces listings daily. Your agent handles showings. We stay in the loop on every step.',
  },
  {
    number: 4,
    icon: MapPin,
    title: 'Community & Neighborhood Research',
    status: 'upcoming',
    tagline: 'Zeroing in on the right neighborhoods.',
    steps: [
      'AI-driven neighborhood research',
      'School district deep-dives',
      'Commute & lifestyle analysis',
      'Shortlist of 3–5 communities presented',
    ],
    dyson_role: 'Charlie and our team research your destination using your priorities — schools, commute, safety, lifestyle.',
  },
  {
    number: 5,
    icon: ClipboardCheck,
    title: 'Environmental & Property Due Diligence',
    status: 'upcoming',
    tagline: 'Know exactly what you\'re buying.',
    steps: [
      'Neighborhood & environmental research',
      'Property inspection coordination',
      'HOA & community review',
      'Flood, fire, and hazard zone analysis',
    ],
    dyson_role: 'We coordinate inspectors, review reports, and flag anything that deserves your attention before you commit.',
  },
  {
    number: 6,
    icon: FileText,
    title: 'Purchase Agreement Review & Selection of Service Providers',
    status: 'upcoming',
    tagline: 'Negotiate with confidence.',
    steps: [
      'Offer drafted with your agent',
      'Contingency strategy reviewed',
      'Counter-offer guidance',
      'Purchase agreement executed',
    ],
    dyson_role: 'Your agent leads negotiations. Bob\'s team provides strategy. You make the final call.',
  },
  {
    number: 7,
    icon: Key,
    title: 'Negotiating the Offer, Escrow & Closing',
    status: 'upcoming',
    tagline: 'The finish line — handled for you.',
    steps: [
      'Title company selected & engaged',
      'Escrow opened & timeline set',
      'Lending & appraisal coordinated',
      'Property inspection coordinated & scheduled',
      'Final walkthrough & close of escrow',
    ],
    dyson_role: 'We track every escrow milestone and make sure nothing falls through the cracks before you get your keys.',
  },
  {
    number: 8,
    icon: Truck,
    title: 'Upon Property Settlement — Complete All Move & Move-In Checklist Action Steps',
    status: 'upcoming',
    tagline: 'Arrive ready. Every detail handled.',
    steps: [
      'Moving company vetted & booked',
      'Utilities transferred & activated',
      'Internet, electric, gas, water — set up',
      'Travel & packing coordination',
    ],
    dyson_role: 'Charlie manages your moving checklist end-to-end. You arrive to a ready home.',
  },
];

export default function RelocationRoadmap({ clientName, destinationCity }) {
  const [expanded, setExpanded] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Agent portals (not client) get the lead-in script addressed to agents
  const isAgentPortal = (() => {
    try {
      const role = sessionStorage.getItem('dyson_role');
      return role && role !== 'client';
    } catch { return false; }
  })();
  const roadmapRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const city = destinationCity || urlParams.get('city') || '';

  useEffect(() => {
    const checkClient = async () => {
      try {
        const user = await appClient.auth.me();
        if (user?.email) {
          const clients = await appClient.entities.RelocationClient.filter({ email: user.email });
          if (clients.length > 0) {
            setClientId(clients[0].id);
          }
        }
      } catch (err) {
        console.error('Error checking client:', err);
      } finally {
        setLoading(false);
      }
    };
    checkClient();
  }, []);

  useEffect(() => {
    // Roadmap always visible
    setShowRoadmap(true);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>
      {/* Header with Back Button and Commit CTA */}
      <nav ref={roadmapRef} className="flex items-center justify-between px-6 md:px-14 py-4" style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <p className="hidden md:block text-xs font-bold tracking-[0.3em]" style={{ color: GOLD }}>YOUR ROADMAP</p>
            <Link to="/RelocationIntake">
              <button className="gold-btn px-4 py-2 rounded-full text-xs font-bold tracking-wide">
                Commit to Start
              </button>
            </Link>
          </nav>



      <div className="text-center px-6 md:pr-48 pt-10 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(212,175,55,0.15)', border: `2px solid ${GOLD}` }}>
            <Sparkles className="w-8 h-8" style={{ color: GOLD }} />
          </div>
          <p className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: GOLD }}>THE COMPLETE RELOCATION PROCESS</p>
          <h1 className="display-heading mb-3" style={{ fontSize: 'clamp(1.62rem, 3.6vw, 2.7rem)', letterSpacing: '0.18em', color: '#1a1a1a' }}>
            {city ? `Your ${city} Roadmap` : 'Your Relocation Roadmap'}
          </h1>
          {isAgentPortal && (
            <div className="rounded-xl p-4 max-w-2xl mx-auto mb-4" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD}44` }}>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: '#1a1a1a' }}>
                Following is how and why we establish a private session with a new relocating client. Their voices, personality, interests and objectives are all discussed so we and Gemini hear their desires live. Let me share how this works and why:
              </p>
            </div>
          )}
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#1a1a1a' }}>
            We are pleased to share our relocation map for all clients. Following is what they will hear and what they can expect. Take note of each of the steps since we keep the referring agent in the loop and we fully expect the receiving agents and their brokers to follow this commitment before they accept the client referral, all of which is in the management and referral agreement.
          </p>
        </motion.div>
      </div>

      {/* Charlie circle — replaces yellow banner, plays full roadmap briefing */}
      <RoadmapCharlieCircle />

      {/* Phases */}
      <div className="max-w-2xl mx-auto px-6 pb-10 space-y-3">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = phase.status === 'active';
          const isOpen = expanded === phase.number;

          return (
            <motion.div
             key={phase.number}
             initial={{ opacity: 0, y: 16 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.07, duration: 0.4 }}
             className="rounded-2xl overflow-hidden relative"
             style={{
               border: isActive ? `2px solid ${GOLD}` : '1px solid rgba(0,0,0,0.1)',
               background: '#1a1a1a',
               opacity: clientId ? 1 : 0.6,
             }}
            >
              {/* Phase Header */}
              <div
                role="button"
                tabIndex={0}
                className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer"
                onClick={() => {
                  if (phase.number === 1 && !clientId) {
                    navigate('/RelocationIntake');
                  } else {
                    setExpanded(isOpen ? null : phase.number);
                  }
                }}
              >
                {/* Number / Icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? GOLD : 'rgba(255,255,255,0.07)',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  }}>
                  {isActive
                    ? <Icon className="w-5 h-5" style={{ color: '#000' }} />
                    : <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{phase.number}</span>
                  }
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: isActive ? GOLD : '#fff' }}>
                      10{String.fromCharCode(64 + phase.number)} • Phase {phase.number}: {phase.title}
                    </span>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: GOLD, color: '#000' }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {phase.tagline}
                  </p>
                </div>

                {/* Bob explains this phase — plays the phase video */}
                <RoadmapPhasePlayBadge phaseNumber={phase.number} />

                {/* Chevron */}
                {isOpen
                  ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                }
              </div>

              {/* Lock overlay for Phase 1 only */}
              {!clientId && phase.number === 1 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl z-10">
                  <p className="text-xs font-bold text-center px-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Submit your info to unlock</p>
                </div>
              )}

              {/* Expanded Detail - Show content only if clientId exists OR if phase > 1 */}
              {isOpen && clientId && (
                <ExpandedPhaseContent phase={phase} isActive={isActive} GOLD={GOLD} />
              )}
              {isOpen && !clientId && phase.number > 1 && (
                <LockedPhaseContent phase={phase} isActive={isActive} GOLD={GOLD} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <div className="rounded-2xl p-8" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}` }}>
          <p className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: GOLD }}>YOUR NEXT STEP</p>
          <h3 className="text-xl font-bold mb-2 text-white">Ready to Start?</h3>
          <p className="text-sm mb-6 text-white">
            {clientId ? 'Your relocation profile is live. Bob\'s team will be in touch shortly to begin Phase 1. Meanwhile, Charlie is available 24/7 in your dashboard.' : 'Submit your information to unlock your complete roadmap and personalized relocation plan.'}
          </p>
          <Link to={clientId ? '/Dashboard' : '/RelocationIntake'}>
            <button className="gold-btn w-full py-3 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2">
              {clientId ? 'Go to My Dashboard' : 'Start Your Relocation'} <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      </div>
      );
      }

// Phase content when user has completed intake
function ExpandedPhaseContent({ phase, isActive, GOLD }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="px-5 pb-5 space-y-4"
    >
      <RoadmapPhasePlay phaseNumber={phase.number} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>WHAT HAPPENS</p>
          <ul className="space-y-2">
            {phase.steps.map((step, j) => (
              <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: isActive ? GOLD : 'rgba(255,255,255,0.3)' }} />
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid rgba(212,175,55,0.15)` }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>DYSON & DYSON'S ROLE</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {phase.dyson_role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Locked phase content for users who haven't completed Phase 1
function LockedPhaseContent({ phase, isActive, GOLD }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="px-5 pb-5 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>WHAT HAPPENS</p>
          <ul className="space-y-2">
            {phase.steps.map((step, j) => (
              <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: isActive ? GOLD : 'rgba(255,255,255,0.3)' }} />
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid rgba(212,175,55,0.15)` }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>DYSON & DYSON'S ROLE</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {phase.dyson_role}
          </p>
        </div>
      </div>
      <div className="rounded-xl p-4 border-l-2" style={{ background: 'rgba(212,175,55,0.08)', borderColor: GOLD }}>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>UNLOCK THIS PHASE</p>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
          You've seen what Phase {phase.number} involves. Return to Phase 1 and submit your information to unlock the full roadmap.
        </p>
        <Link to="/RelocationIntake">
          <button className="w-full px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all hover:opacity-90" style={{ background: GOLD, color: '#000' }}>
            Return to Phase 1
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

// REMOVED - content moved to /relo-management page
function ReloManagementContent_UNUSED() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#fff' }}>
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
    </div>
  );
}