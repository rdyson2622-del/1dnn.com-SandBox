import React, { useState } from 'react';
import { Search, MapPin, Star, Clock, Shield, ChevronDown, ChevronUp, X, ArrowRight } from 'lucide-react';
import SendingAgentModal from '@/components/directory/SendingAgentModal';

const GOLD = '#D4AF37';

const CITIES = [
  {
    state: 'Tennessee',
    cities: [
      { city: 'Nashville', agents: [
        { name: 'Marcus Webb', brokerage: 'Compass Tennessee', transactions: 87, rating: 4.9, status: 'pending', markets: ['Nashville', 'Brentwood', 'Franklin'] },
        { name: 'Sarah Holloway', brokerage: 'Keller Williams Nashville', transactions: 112, rating: 4.8, status: 'active', markets: ['Nashville', 'Murfreesboro'] },
      ]},
    ]
  },
  {
    state: 'Idaho',
    cities: [
      { city: 'Boise', agents: [
        { name: 'Derek Paine', brokerage: 'Silvercreek Realty', transactions: 64, rating: 4.7, status: 'pending', markets: ['Boise', 'Meridian', 'Nampa'] },
      ]},
    ]
  },
  {
    state: 'Texas',
    cities: [
      { city: 'Austin', agents: [
        { name: 'Priya Nair', brokerage: 'Kuper Sotheby\'s', transactions: 95, rating: 4.9, status: 'active', markets: ['Austin', 'Round Rock', 'Cedar Park'] },
        { name: 'James Thornton', brokerage: 'Redfin Austin', transactions: 78, rating: 4.7, status: 'pending', markets: ['Austin', 'Georgetown'] },
      ]},
      { city: 'Dallas', agents: [
        { name: 'Lisa Monroe', brokerage: 'Dave Perry-Miller', transactions: 143, rating: 4.8, status: 'pending', markets: ['Dallas', 'Plano', 'Frisco'] },
      ]},
    ]
  },
  {
    state: 'Florida',
    cities: [
      { city: 'Tampa', agents: [
        { name: 'Carlos Diaz', brokerage: 'Smith & Associates', transactions: 71, rating: 4.6, status: 'pending', markets: ['Tampa', 'St. Pete', 'Clearwater'] },
      ]},
      { city: 'Orlando', agents: [
        { name: 'Rachel Kim', brokerage: 'Premier Sotheby\'s', transactions: 88, rating: 4.8, status: 'active', markets: ['Orlando', 'Winter Park', 'Lake Nona'] },
      ]},
    ]
  },
  {
    state: 'Arizona',
    cities: [
      { city: 'Phoenix / Scottsdale', agents: [
        { name: 'Tom Bradley', brokerage: 'HomeSmart', transactions: 102, rating: 4.7, status: 'pending', markets: ['Scottsdale', 'Tempe', 'Chandler'] },
      ]},
    ]
  },
  {
    state: 'North Carolina',
    cities: [
      { city: 'Charlotte', agents: [
        { name: 'Angela Foster', brokerage: 'Helen Adams Realty', transactions: 93, rating: 4.9, status: 'active', markets: ['Charlotte', 'Huntersville', 'Ballantyne'] },
      ]},
      { city: 'Raleigh / Durham', agents: [
        { name: 'Kevin Shaw', brokerage: 'Berkshire Hathaway NC', transactions: 67, rating: 4.7, status: 'pending', markets: ['Raleigh', 'Durham', 'Chapel Hill'] },
      ]},
    ]
  },
];

// ── Intake Modal ──────────────────────────────────────────────────
function IntakeModal({ agentName, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}
        style={{ background: '#fff8ee', border: `2px solid ${GOLD}` }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#0d0d0d' }}>
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>DYSON RELOCATION TEAM</p>
            <p className="text-white font-bold text-sm mt-0.5">Inquiry for {agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-black text-lg mb-2" style={{ color: '#1a1a1a' }}>Request Received</p>
            <p className="text-sm leading-relaxed" style={{ color: '#3a2f1e', fontFamily: 'Georgia, serif' }}>
              Your inquiry for <strong>{agentName}</strong> is being processed by the Dyson Relocation Team. We'll be in touch within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="rounded-xl px-4 py-3 text-sm leading-relaxed" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#3a2f1e', fontFamily: 'Georgia, serif' }}>
              Inquiry for <strong>{agentName}</strong> is being processed by the Dyson Relocation Team.
            </div>
            {[
              { key: 'name', placeholder: 'Your Full Name', required: true },
              { key: 'email', placeholder: 'Email Address', required: true },
              { key: 'phone', placeholder: 'Phone Number', required: false },
            ].map(({ key, placeholder, required }) => (
              <input key={key} required={required} placeholder={placeholder}
                value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.3)', color: '#1a1a1a' }}
              />
            ))}
            <textarea placeholder="Brief description of your situation (optional)" rows={3}
              value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.3)', color: '#1a1a1a' }}
            />
            <button type="submit"
              className="w-full py-3 rounded-full font-black text-sm tracking-wide transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              Submit to Dyson Team →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Agent Profile Card ────────────────────────────────────────────
function AgentCard({ agent }) {
  const [showIntake, setShowIntake] = useState(false);
  const isPending = agent.status === 'pending';

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between gap-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.05)' }}>
          <div>
            <p className="font-black text-base" style={{ color: '#1a1a1a' }}>{agent.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6b5c45' }}>{agent.brokerage}</p>
          </div>
          {/* Vetting Badge */}
          {isPending ? (
            <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#b45309', border: '1px solid rgba(251,191,36,0.4)' }}>
              <Clock className="w-3 h-3" /> Vetting: Pending Final Approval
            </span>
          ) : (
            <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.35)' }}>
              <Shield className="w-3 h-3" /> Dyson Vetted
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="px-5 py-4 flex items-center gap-6">
          <div className="text-center">
            <p className="font-black text-lg" style={{ color: GOLD }}>{agent.transactions}</p>
            <p className="text-[10px] font-semibold" style={{ color: '#9b8a70' }}>Transactions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: GOLD }} />
              <p className="font-black text-lg" style={{ color: GOLD }}>{agent.rating}</p>
            </div>
            <p className="text-[10px] font-semibold" style={{ color: '#9b8a70' }}>Rating</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold mb-1" style={{ color: '#9b8a70' }}>Markets Served</p>
            <div className="flex flex-wrap gap-1">
              {agent.markets.map(m => (
                <span key={m} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(212,175,55,0.12)', color: '#6b5c45', border: '1px solid rgba(212,175,55,0.2)' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-4 flex flex-col gap-2">
          <button onClick={() => setShowIntake(true)}
            className="w-full py-2.5 rounded-xl font-black text-sm tracking-wide transition-all hover:scale-[1.01]"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            Contact Agent via Dyson Team
          </button>
          <p className="text-center text-[11px]" style={{ color: '#9b8a70' }}>
            Are you {agent.name}?{' '}
            <a href="/portal" className="font-black underline" style={{ color: GOLD }}>
              Claim your profile & view pending referrals →
            </a>
          </p>
        </div>
      </div>

      {showIntake && <IntakeModal agentName={agent.name} onClose={() => setShowIntake(false)} />}
    </>
  );
}

// ── City Group ────────────────────────────────────────────────────
function CityGroup({ entry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.25)', background: '#fff8ee' }}>
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:bg-yellow-50">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4" style={{ color: GOLD }} />
          <div>
            <p className="font-black text-base" style={{ color: '#1a1a1a' }}>{entry.city}</p>
            <p className="text-xs" style={{ color: '#9b8a70' }}>{entry.agents.length} Performance Partner{entry.agents.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4" style={{ color: GOLD }} />
          : <ChevronDown className="w-4 h-4" style={{ color: GOLD }} />
        }
      </button>
      {expanded && (
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="md:col-span-2 pt-4" />
          {entry.agents.map((agent, i) => <AgentCard key={i} agent={agent} />)}
        </div>
      )}
    </div>
  );
}

const EXODUS_CITIES = ['Los Angeles', 'San Francisco', 'Seattle', 'Chicago', 'New York', 'San Diego', 'Oakland', 'Portland'];

// ── Exodus City Pitch Banner ───────────────────────────────────────
function ExodusPitchBanner({ city }) {
  const [show, setShow] = useState(false);
  if (!EXODUS_CITIES.some(c => c.toLowerCase() === city.toLowerCase())) return null;
  return (
    <div className="mt-4 rounded-2xl px-5 py-4"
      style={{ background: '#0d0d0d', border: `1px solid rgba(212,175,55,0.4)` }}>
      <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-1" style={{ color: GOLD }}>TOP {city.toUpperCase()} AGENT?</p>
      <p className="text-sm text-white leading-snug mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        Don't send your clients to a random referral. Let Dyson manage the destination logistics so your fee is secured.
      </p>
      <button onClick={() => setShow(true)}
        className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-full transition-all hover:scale-105"
        style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
        I Am a Sending Agent <ArrowRight className="w-3.5 h-3.5" />
      </button>
      {show && <SendingAgentModal onClose={() => setShow(false)} />}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function NationalVettedDirectory() {
  const [search, setSearch] = useState('');
  const [showSendingModal, setShowSendingModal] = useState(false);

  const filtered = CITIES.map(stateGroup => ({
    ...stateGroup,
    cities: stateGroup.cities.filter(c =>
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      stateGroup.state.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => s.cities.length > 0);

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>

      {/* Header */}
      <div className="px-8 pt-12 pb-8 text-center" style={{ background: '#0d0d0d' }}>
        <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>DYSON & DYSON · PRN</p>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', color: '#fff', letterSpacing: '0.12em' }}>
          NATIONAL VETTED DIRECTORY
        </h1>
        <p className="text-sm max-w-xl mx-auto leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Georgia, serif' }}>
          Dyson-curated Performance Partners across top US relocation markets. All contact inquiries are processed by our Relocation Team first.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 py-3 rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid rgba(212,175,55,0.4)` }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
          <input
            type="text"
            placeholder="Search city or state…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
          />
        </div>

        {/* Sending Agent CTA */}
        <div className="mt-6">
          <button onClick={() => setShowSendingModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            I Am a Sending Agent — Request Destination Vetting <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Protect your 25% referral fee. We vet the boots-on-the-ground for you.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <Shield className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
            Dyson Vetted — Active PRN Member
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            Pending Final Approval
          </div>
        </div>
      </div>

      {/* Directory */}
      <div className="px-6 py-10 max-w-4xl mx-auto space-y-8">
        {filtered.map(stateGroup => (
          <div key={stateGroup.state}>
            <p className="text-xs font-black tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>
              {stateGroup.state}
            </p>
            <div className="space-y-3">
              {stateGroup.cities.map((entry, i) => (
                <div key={i}>
                  <CityGroup entry={entry} />
                  <ExodusPitchBanner city={entry.city} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {showSendingModal && <SendingAgentModal onClose={() => setShowSendingModal(false)} />}

        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-2xl mb-2">🗺️</p>
            <p className="font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>No results for "{search}"</p>
            <p className="text-sm" style={{ color: '#6b5c45' }}>Try searching Nashville, Boise, Austin, or Dallas.</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-2xl px-6 py-5 text-center"
          style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#6b5c45', fontFamily: 'Georgia, serif' }}>
            All agents listed as "Pending Final Approval" are currently under review by the Dyson vetting team. Performance data is sourced from public MLS records and third-party analytics. Contact inquiries are routed through Dyson & Dyson prior to agent introduction.
          </p>
        </div>
      </div>
    </div>
  );
}