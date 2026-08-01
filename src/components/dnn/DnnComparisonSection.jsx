import React from 'react';
import { Check, X, Globe, Video, Users, Wrench, MapPin, Bell } from 'lucide-react';
import DnnComparisonCircle from '@/components/dnn/DnnComparisonCircle';

const GOLD = '#D4AF37';

const COMPETITORS = [
  { name: 'HousingWire', type: 'Industry News' },
  { name: 'Inman News', type: 'Industry News' },
  { name: 'Bisnow', type: 'CRE News + Events' },
  { name: 'Redfin News', type: 'Brokerage Research' },
  { name: 'NAR Research', type: 'Data & Reports' },
  { name: 'Sirva', type: 'Relocation Service' },
];

const CAPABILITIES = [
  { label: 'News Reporting', icon: Globe, dyson: true, comps: [true, true, true, true, false, false] },
  { label: 'Solution Framework (What to DO)', icon: Wrench, dyson: true, comps: ['partial', false, false, 'partial', false, true] },
  { label: 'Client-Specific Solutions', icon: Users, dyson: true, comps: [false, false, false, 'partial', false, true] },
  { label: 'Agent-Specific Solutions', icon: Users, dyson: true, comps: [true, true, false, false, true, false] },
  { label: 'Vendor-Specific Solutions', icon: Wrench, dyson: true, comps: [false, false, false, false, false, false] },
  { label: 'AI Video Presenters', icon: Video, dyson: true, comps: [false, false, false, false, false, false] },
  { label: 'Local + National Scope', icon: MapPin, dyson: true, comps: [false, false, true, false, true, true] },
  { label: 'Relocation Focus', icon: Bell, dyson: true, comps: [false, false, false, false, false, true] },
];

function renderCell(val) {
  if (val === true) return <Check className="w-4 h-4" style={{ color: '#4ade80' }} />;
  if (val === false) return <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />;
  if (val === 'partial') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>PARTIAL</span>;
  return null;
}

export default function DnnComparisonSection() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-16">
      {/* Section Header — text + video circle side by side */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs font-black tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>
            Why DNN Is Different
          </p>
          <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', letterSpacing: '0.12em', color: '#1a1a1a' }}>
            The Only News Network That Solves Problems
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#4a4a4a', maxWidth: '640px' }}>
            HousingWire reports the news. Inman covers the industry. Sirva moves your boxes.
            Nobody does what DNN does — report market-moving news AND deliver tailored solutions
            to clients, agents, and vendors through AI video presenters. Here's the proof.
          </p>
        </div>
        <div className="shrink-0">
          <DnnComparisonCircle />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl overflow-hidden mb-10" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}>
        {/* Table Header */}
        <div className="grid items-center px-4 py-4" style={{ gridTemplateColumns: '2fr 1fr repeat(6, 0.8fr)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Capability</p>
          <div className="text-center">
            <p className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>DNN</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Dyson & Dyson</p>
          </div>
          {COMPETITORS.map(c => (
            <div key={c.name} className="text-center px-1">
              <p className="text-[10px] font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.name}</p>
              <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{c.type}</p>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {CAPABILITIES.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.label}
              className="grid items-center px-4 py-3"
              style={{
                gridTemplateColumns: '2fr 1fr repeat(6, 0.8fr)',
                borderBottom: idx < CAPABILITIES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: cap.label.includes('AI Video') || cap.label.includes('Vendor') ? 'rgba(212,175,55,0.04)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <p className="text-xs font-semibold" style={{ color: '#ffffff' }}>{cap.label}</p>
              </div>
              <div className="flex justify-center">
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}40` }}>
                  <Check className="w-4 h-4" style={{ color: GOLD }} />
                </span>
              </div>
              {cap.comps.map((val, i) => (
                <div key={i} className="flex justify-center">{renderCell(val)}</div>
              ))}
            </div>
          );
        })}
      </div>

      {/* The Dyson Difference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(212,175,55,0.12)', border: `1px solid ${GOLD}30` }}>
            <Users className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <p className="text-sm font-black text-white mb-2">Three Audiences, One Brief</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Every DNN brief delivers separate, actionable solutions for <span style={{ color: GOLD }}>clients</span> (what to do), <span style={{ color: GOLD }}>agents</span> (what to say), and <span style={{ color: GOLD }}>vendors</span> (lenders, movers, title). Nobody else does this.
          </p>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(212,175,55,0.12)', border: `1px solid ${GOLD}30` }}>
            <Video className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <p className="text-sm font-black text-white mb-2">AI Video Presenters</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Charlie Simmons and Bob Dyson deliver every brief on camera — not text on a page. A real news anchor experience powered by AI, available 24/7.
          </p>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(212,175,55,0.12)', border: `1px solid ${GOLD}30` }}>
            <MapPin className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <p className="text-sm font-black text-white mb-2">National + Local</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            DNN covers national market-moving stories AND localizes intelligence to the specific markets you're moving to — not generic national data, not one-city-only coverage.
          </p>
        </div>
      </div>

      {/* Why Subscribe CTA */}
      <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', border: `1px solid ${GOLD}30` }}>
        <p className="text-xs font-black tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>
          The Bottom Line
        </p>
        <p className="text-lg leading-relaxed mb-6" style={{ color: '#ffffff', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
          Every other news source tells you <span style={{ color: GOLD }}>what happened</span>.
          DNN tells you what happened, <span style={{ color: GOLD }}>what it means for your move</span>,
          and <span style={{ color: GOLD }}>exactly what to do about it</span> — delivered by AI presenters who make it feel personal.
        </p>
        <p className="text-sm font-bold" style={{ color: GOLD }}>
          That's why you should subscribe. That's why DNN exists.
        </p>
      </div>
    </div>
  );
}