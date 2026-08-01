import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';

const SERVICES = [
  {
    id: 'comms',
    icon: '💬',
    title: 'Communications Hub',
    tagline: 'Message your concierge team — we reply within 1 hour.',
    description: 'Send a message anytime and your Dyson & Dyson team will respond directly. Every conversation is threaded, organized, and tracked so nothing falls through the cracks.',
    highlight: 'Text-first · 1-hour response · Mon–Sat 9am–7pm PT',
    cta: 'Open Communications Hub',
    link: '/chat',
    preview: [
      { label: '💬 Direct Messaging', detail: 'Chat with your concierge team in real time' },
      { label: '📞 Call Our Dyson Relo Specialists Direct', detail: '(858) 353-1200 — Dyson Relo Line' },
      { label: '🎙️ Voice (Chrome Desktop)', detail: 'Speak to Charlie — works best in Chrome' },
    ],
  },
  {
    id: 'search',
    icon: '🔍',
    title: 'Search Homes',
    tagline: 'Find your next home before you land.',
    description: 'Browse active listings in your destination city. Filter by price, beds, neighborhood and lifestyle fit. Save favorites and share them with your concierge team.',
    highlight: 'Powered by real MLS data + Gemini neighborhood scoring',
    cta: 'Search Homes',
    link: '/search',
    preview: [
      { label: 'Scottsdale, AZ', detail: '4bd · 3ba · $689K · 87% fit' },
      { label: 'Gilbert, AZ', detail: '3bd · 2ba · $574K · 72% fit' },
      { label: 'Chandler, AZ', detail: '4bd · 2.5ba · $621K · 79% fit' },
    ],
  },
  {
    id: 'compare',
    icon: '🏠',
    title: 'Compare Homes',
    tagline: 'Tour homes. Save them here. We score every one.',
    description: 'After each tour, add the property to your comparison board. Our team runs deep Gemini research across 6 categories — schools, cost of living, healthcare, recreation, neighborhood, and local character.',
    highlight: '6-category research report per property',
    cta: 'See Compare Homes Tool',
    link: '/property-comparison',
    preview: [
      { label: '📍 Neighborhood', detail: 'Safety, walkability, HOA quality' },
      { label: '🏫 Schools', detail: 'District ratings, proximity, enrollment' },
      { label: '💰 Cost of Living', detail: 'Taxes, utilities, grocery index' },
    ],
  },
  {
    id: 'roadmap',
    icon: '🗺️',
    title: 'My Relocation Roadmap',
    tagline: 'Every step of your move, organized for you.',
    description: 'From the moment you commit to closing day and beyond — your 8-phase relocation plan is built around your timeline, family, and priorities. Never wonder "what\'s next."',
    highlight: '8 phases · 30/60/90-day milestones',
    cta: 'View My Roadmap',
    link: '/relocation-roadmap',
    preview: [
      { label: 'Phase 1', detail: 'Commitment & Profile Setup' },
      { label: 'Phase 2', detail: 'City Research & Neighborhood Shortlist' },
      { label: 'Phase 3', detail: 'Agent Match & Home Search' },
    ],
  },
  {
    id: 'agent',
    icon: '🤝',
    title: 'Vet Agents',
    tagline: 'We find the right agent for you — no swarm, no pressure.',
    description: 'Our network spans every major US city. We vet agents on performance, local knowledge, and client communication. You get introduced to 1–2 pre-screened candidates — we handle the rest.',
    highlight: '100% FREE to you — agent fees are paid at close',
    cta: 'See How Agent Vetting Works',
    link: '/find-agent',
    preview: [
      { label: 'Step 1', detail: 'We review your destination & priorities' },
      { label: 'Step 2', detail: 'We identify 2–3 top-performing local agents' },
      { label: 'Step 3', detail: 'You meet, select, and we facilitate the intro' },
    ],
  },
  {
    id: 'cityguide',
    icon: '📍',
    title: 'City Guide',
    tagline: 'Know your new city before you arrive.',
    description: 'Explore neighborhoods, restaurants, schools, parks, places of worship, sports leagues, healthcare, and community events in your destination city — all curated by our local research team.',
    highlight: 'Research-backed local intelligence',
    cta: 'Explore City Guide',
    link: '/city-guide',
    preview: [
      { label: '🍽️ Dining & Nightlife', detail: 'Top-rated spots near your shortlist' },
      { label: '⛪ Religious Community', detail: 'Congregations by denomination & area' },
      { label: '🏃 Sports & Recreation', detail: 'Leagues, parks, gyms, trails' },
    ],
  },
  {
    id: 'gemini',
    icon: '🎙️',
    title: 'Gemini AI Strategy Sessions Along with Dyson & Dyson',
    tagline: 'Gemini AI Strategy Sessions Along with Dyson & Dyson',
    taglineList: [
      'Live AI-assisted conversations with Bob Dyson.',
      '24/7 Support with Charlie, your personal AI assistant.',
    ],
    description: 'Book a free, no-obligation session where Bob Dyson himself walks you through our full concierge program — live, with Gemini AI assisting in real time. Ask anything. Get real answers.',
    highlight: 'Free · No commitment · 30 minutes',
    cta: 'Book My Gemini Session',
    link: '/gemini',
    preview: [
      { label: '✅ No paperwork upfront', detail: 'Just a conversation' },
      { label: '✅ Live AI research', detail: 'Gemini answers your questions in real time' },
      { label: '✅ Bob personally leads it', detail: '55 years of real estate experience' },
    ],
  },
];

export default function DashboardServicePreviews({ clientId, heading }) {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 space-y-6">
      {/* Section header */}
      <div className="text-center mb-8">
        <div className="h-px w-24 mx-auto mb-6" style={{ background: `rgba(212,175,55,0.4)` }} />
        <p className="text-xs font-bold tracking-[0.25em] mb-2" style={{ color: GOLD }}>EVERYTHING INCLUDED IN YOUR CONCIERGE PROGRAM</p>
         <h2 className="display-heading" style={{ fontSize: 'clamp(1.1rem, 6vw, 2rem)', color: '#000' }}>{heading || 'Your Full-Service Dashboard'}</h2>
         <p className="text-sm mt-2" style={{ color: '#1a1a1a' }}>
           Seven integrated tools — all working together, all managed by our team.
         </p>
      </div>

      {SERVICES.map((svc, i) => (
        <motion.div
          key={svc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="grid sm:grid-cols-2 gap-0">
            {/* Left: info */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{svc.icon}</span>
                  <div>
                    <p className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>{svc.id === 'gemini' ? 'YOUR COMMUNICATION HUB' : svc.title.toUpperCase()}</p>
                    {svc.taglineList ? (
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">{svc.tagline}</p>
                        <ul className="mt-1 space-y-0.5">
                          {svc.taglineList.map((line, i) => (
                            <li key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-white leading-tight">{svc.tagline}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {svc.description}
                </p>
                <div className="inline-block text-xs px-3 py-1 rounded-full mb-4"
                  style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, border: '1px solid rgba(212,175,55,0.2)' }}>
                  {svc.highlight}
                </div>
              </div>
              <Link to={svc.link}>
                <button className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: GOLD, color: '#000' }}>
                  {svc.cta} →
                </button>
              </Link>
            </div>

            {/* Right: preview list */}
            <div className="p-6 flex flex-col justify-center space-y-3"
              style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>WHAT'S INSIDE</p>
              {svc.preview.map((item, j) => (
                <div key={j} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: GOLD }} />
                  <div>
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Bottom CTA for non-clients */}
      {!clientId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-8 text-center mt-8"
          style={{ background: 'linear-gradient(145deg, #1a1a1a, #000)', border: `2px solid ${GOLD}` }}>
          <p className="text-xs font-bold tracking-[0.25em] mb-2" style={{ color: GOLD }}>READY TO UNLOCK ALL OF THIS?</p>
          <h3 className="text-xl font-bold text-white mb-3">Start with a Free Conversation with Bob</h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            No paperwork. No commitment. Just 30 minutes with Bob Dyson to see if our program is right for you.
          </p>
          <Link to="/gemini">
            <button className="px-10 py-3 rounded-full font-bold text-sm tracking-wider"
              style={{ background: GOLD, color: '#000' }}>
              Book My Free Session with Bob →
            </button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}