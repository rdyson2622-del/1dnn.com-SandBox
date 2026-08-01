import React, { useState } from 'react';
import { Mic, ChevronDown, ChevronUp } from 'lucide-react';

const CHARLIE_COLOR = '#A78BFA';
const BOB_COLOR = '#D4AF37';

const BOB_PHOTO = '/assets/dyson-logo.png';

/**
 * InterviewSegment — renders a Charlie-asks / Bob-answers exchange
 * for a DNN article. Collapsed by default, expandable.
 *
 * Props:
 *   qa: Array<{ question: string, answer: string }>
 *   onListenBob: (text: string) => void  — triggers TalkingHead for Bob
 */
export default function InterviewSegment({ qa = [], onListenBob }) {
  const [open, setOpen] = useState(false);

  if (!qa || qa.length === 0) return null;

  // Build a single spoken script for Bob (answers only)
  const bobScript = qa.map(item => item.answer).join(' ... ');

  return (
    <div className="mt-3 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>

      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-all hover:opacity-80"
        style={{ background: 'rgba(167,139,250,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <Mic className="w-3.5 h-3.5" style={{ color: CHARLIE_COLOR }} />
          <span className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: CHARLIE_COLOR }}>
            Live Segment
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(167,139,250,0.15)', color: CHARLIE_COLOR }}>
            Charlie × Bob
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onListenBob && !open && (
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(167,139,250,0.6)' }}>
              tap to read
            </span>
          )}
          {open
            ? <ChevronUp className="w-3.5 h-3.5" style={{ color: CHARLIE_COLOR }} />
            : <ChevronDown className="w-3.5 h-3.5" style={{ color: CHARLIE_COLOR }} />}
        </div>
      </button>

      {open && (
        <div className="px-4 py-3 space-y-4">
          {qa.map((item, i) => (
            <div key={i} className="space-y-2">
              {/* Charlie question */}
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5"
                  style={{ background: `${CHARLIE_COLOR}22`, border: `1px solid ${CHARLIE_COLOR}44`, color: CHARLIE_COLOR }}>
                  C
                </div>
                <div className="flex-1 rounded-xl px-3 py-2 text-xs leading-relaxed"
                  style={{ background: `${CHARLIE_COLOR}10`, border: `1px solid ${CHARLIE_COLOR}20`, color: '#e2d9f3' }}>
                  <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: CHARLIE_COLOR }}>
                    Charlie
                  </span>
                  {item.question}
                </div>
              </div>

              {/* Bob answer */}
              <div className="flex items-start gap-2.5 ml-4">
                <div className="shrink-0 w-6 h-6 rounded-full overflow-hidden mt-0.5"
                  style={{ border: `1px solid ${BOB_COLOR}44` }}>
                  <img src={BOB_PHOTO} alt="Bob" className="w-full h-full object-cover object-top" />
                </div>
                <div className="flex-1 rounded-xl px-3 py-2 text-xs leading-relaxed"
                  style={{ background: `${BOB_COLOR}0d`, border: `1px solid ${BOB_COLOR}25`, color: '#f5f0e0' }}>
                  <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: BOB_COLOR }}>
                    Bob Dyson
                  </span>
                  {item.answer}
                </div>
              </div>
            </div>
          ))}

          {/* Listen to Bob's answers */}
          {onListenBob && (
            <button
              onClick={() => onListenBob(bobScript)}
              className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all hover:opacity-80"
              style={{ background: `${BOB_COLOR}18`, color: BOB_COLOR, border: `1px solid ${BOB_COLOR}35` }}
            >
              <Mic className="w-3 h-3" />
              Hear Bob's Answers
            </button>
          )}
        </div>
      )}
    </div>
  );
}