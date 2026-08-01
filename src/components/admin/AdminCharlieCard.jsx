import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronRight } from 'lucide-react';

const GOLD = '#D4AF37';
const PURPLE = '#A78BFA';

const CAPABILITIES = [
  { emoji: '📋', text: 'Create/update client records via natural language' },
  { emoji: '✅', text: 'Assign roadmap tasks conversationally' },
  { emoji: '📊', text: 'Pull live pipeline reports instantly' },
  { emoji: '✉️', text: 'Draft SMS scripts & comms on demand' },
  { emoji: '⚡', text: 'Execute entity operations — create, update, query' },
];

const EXAMPLES = [
  '"Pull all clients with no agent assigned"',
  '"Mark Windean\'s status as Under Contract"',
  '"Generate an outreach SMS for San Diego batch"',
  '"What tasks are overdue this week?"',
  '"Add John Smith as a new lead moving to Austin"',
];

export default function AdminCharlieCard() {
  const [expanded, setExpanded] = useState(false);

  const openCharlie = () => {
    // Trigger the floating AdminCharliePanel by simulating a click on its toggle button
    const btn = document.querySelector('[data-charlie-toggle]');
    if (btn) btn.click();
  };

  return (
    <div className="mx-3 mt-2 mb-1 rounded-xl overflow-hidden shrink-0"
      style={{ border: '1px solid rgba(167,139,250,0.35)', background: 'rgba(167,139,250,0.06)' }}>

      {/* Header */}
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-center justify-between px-3 py-3 group"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: PURPLE }} />
          </div>
          <div className="text-left">
            <p className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: PURPLE }}>Admin Charlie</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>AI Command Interface</p>
          </div>
        </div>
        {expanded
          ? <ChevronDown className="w-3 h-3" style={{ color: PURPLE }} />
          : <ChevronRight className="w-3 h-3" style={{ color: PURPLE }} />
        }
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3">

          {/* What Charlie can do */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(167,139,250,0.7)' }}>What Charlie Can Do</p>
            <div className="space-y-1.5">
              {CAPABILITIES.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[11px] shrink-0">{c.emoji}</span>
                  <span className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Example commands */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(167,139,250,0.7)' }}>Example Commands</p>
            <div className="space-y-1">
              {EXAMPLES.map((ex, i) => (
                <p key={i} className="text-[9px] italic px-2 py-1 rounded-lg leading-tight"
                  style={{ background: 'rgba(167,139,250,0.08)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(167,139,250,0.15)' }}>
                  {ex}
                </p>
              ))}
            </div>
          </div>

          {/* Open Charlie button */}
          <button
            onClick={openCharlie}
            className="w-full py-2 rounded-xl text-xs font-black tracking-wider transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #A78BFA)', color: '#fff' }}>
            ⚡ Open Admin Charlie
          </button>
        </div>
      )}
    </div>
  );
}