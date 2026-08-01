import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Check, Shield, DollarSign, FileText } from 'lucide-react';

const GOLD = '#D4AF37';
const TAN = '#ede0cc';

const COMPARISON = [
  { label: 'Client Type', boutique: 'Pre-vetted, high-intent relocation clients', bigbox: 'Cold, unqualified directory leads' },
  { label: 'Referral Fee', boutique: '25% goes to peer agent — fully protected', bigbox: '30–40% skimmed by corporate relo division' },
  { label: 'Territory', boutique: 'Exclusive per market — no competing PRN agent', bigbox: 'Shared with dozens of franchisees' },
  { label: 'Co-Marketing', boutique: 'Featured in DNN — broadcast to thousands', bigbox: 'No co-marketing infrastructure' },
  { label: 'Logistics', boutique: 'Full concierge: AI, escrow monitoring, city guides', bigbox: 'Cookie-cutter handoffs, no follow-through' },
];

export default function AdminPartnerBenefits() {
  return (
    <div className="min-h-screen px-6 py-10" style={{ background: TAN }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black tracking-[0.3em] mb-2" style={{ color: GOLD }}>PRN · SENDING AGENT PROGRAM</p>
          <h1 className="font-black text-4xl leading-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
            The Independent<br />Boutique Advantage.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#4a3a28', maxWidth: 560 }}>
            You shouldn't lose 40% to a corporate "Big Box" fee just to send a client out of state.
            We act as your back-office — protecting your commission while we handle everything else.
          </p>
        </div>

        {/* ── TRUTH 1: The Independent Advantage ── */}
        <div className="rounded-2xl p-7 mb-6" style={{ background: '#fff8ee', border: `2px solid ${GOLD}` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
              style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>1</div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: GOLD }} />
              <p className="font-black text-sm tracking-widest uppercase" style={{ color: GOLD }}>THE INDEPENDENT ADVANTAGE</p>
            </div>
          </div>
          <p className="text-lg font-black mb-3" style={{ color: '#1a1a1a', fontFamily: 'Cormorant Garamond, serif' }}>
            "You built your reputation without a franchise. Don't let one steal your referral fee."
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#4a3a28' }}>
            Big Box relocation firms charge the destination agent 30–40% in combined referral fees, then split most of it internally. As an independent, you have no corporate relo desk — so your out-of-state referrals have been walking out the door with no fee protection.
          </p>
          <p className="text-sm leading-relaxed font-semibold" style={{ color: '#1a1a1a' }}>
            Dyson & Dyson is your national relo department. We charge less, do more, and your 25% is always the priority.
          </p>
        </div>

        {/* ── TRUTH 2: The 25/10 Formula ── */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '2px solid rgba(212,175,55,0.5)' }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#0d0d0d' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
              style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>2</div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
              <p className="font-black text-sm tracking-widest uppercase" style={{ color: GOLD }}>THE 25/10 FORMULA</p>
            </div>
          </div>

          {/* Math Breakdown */}
          <div className="px-6 py-6" style={{ background: '#fff8ee' }}>
            <p className="text-sm mb-5" style={{ color: '#4a3a28' }}>
              On a <strong>$1,000,000 transaction</strong> at 3% gross commission ($30,000):
            </p>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Gross Commission (3%)', value: '$30,000', sub: 'Paid by buyer to Receiving Broker', color: '#1a1a1a', bg: 'rgba(212,175,55,0.07)' },
                { label: 'Your Referral Fee (25%)', value: '$7,500', sub: 'Secured & protected by Dyson — paid directly to you at closing', color: '#059669', bg: 'rgba(16,185,129,0.08)', bold: true },
                { label: 'Dyson Management Fee (10%)', value: '$3,000', sub: 'Earned by Dyson for vetting, logistics, escrow monitoring & reporting', color: GOLD, bg: 'rgba(212,175,55,0.1)' },
                { label: 'Total at Destination (35%)', value: '$10,500', sub: 'vs. 40–50% charged by corporate relo divisions', color: '#1a1a1a', bg: '#ede0cc', divider: true },
              ].map((row, i) => (
                <div key={i}>
                  {row.divider && <div className="border-t my-2" style={{ borderColor: 'rgba(212,175,55,0.3)' }} />}
                  <div className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: row.bg, border: `1px solid ${row.bold ? 'rgba(16,185,129,0.3)' : 'rgba(212,175,55,0.2)'}` }}>
                    <div>
                      <p className={`text-sm ${row.bold ? 'font-black' : 'font-semibold'}`} style={{ color: row.color }}>{row.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6b5c45' }}>{row.sub}</p>
                    </div>
                    <p className={`text-lg font-black shrink-0 ml-4 ${row.bold ? 'text-xl' : ''}`} style={{ color: row.color }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold px-4 py-3 rounded-xl" style={{ background: 'rgba(212,175,55,0.1)', color: '#4a3a28', border: '1px solid rgba(212,175,55,0.2)' }}>
              <strong style={{ color: GOLD }}>The key difference:</strong> Your 25% is the priority. Dyson's 10% is earned through active management — not skimmed off the top before you see a dime.
            </p>
          </div>
        </div>

        {/* ── TRUTH 3: The Hero CTA ── */}
        <div className="rounded-2xl p-7 mb-8" style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
              style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>3</div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: GOLD }} />
              <p className="font-black text-sm tracking-widest uppercase" style={{ color: GOLD }}>HOW IT WORKS — 3 STEPS</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { step: 'You send us the referral', detail: 'Your seller mentions they\'re moving out of state. You connect us. That\'s it — zero paperwork on your end.' },
              { step: 'We vet, manage & track everything', detail: 'Dyson vets the destination agent, manages the move logistics, monitors escrow milestones, and keeps you updated via the PRN portal.' },
              { step: 'You collect 25% at closing', detail: 'Dyson\'s compliance team ensures your 25% referral fee is documented, tracked, and paid broker-to-broker — protected by a signed agreement from day one.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5"
                  style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>{i + 1}</div>
                <div>
                  <p className="font-black text-sm" style={{ color: '#1a1a1a' }}>{item.step}</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#4a3a28' }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>BOUTIQUE vs. BIG BOX</p>
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
          <div className="grid grid-cols-3 px-4 py-3" style={{ background: '#0d0d0d' }}>
            <div />
            <p className="text-xs font-black text-center tracking-widest" style={{ color: GOLD }}>PRN BOUTIQUE</p>
            <p className="text-xs font-black text-center tracking-widest" style={{ color: '#666' }}>BIG BOX FRANCHISE</p>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} className="grid grid-cols-3 px-4 py-4 text-sm"
              style={{ background: i % 2 === 0 ? '#fff8ee' : 'rgba(212,175,55,0.04)', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
              <p className="font-black text-xs" style={{ color: '#1a1a1a' }}>{row.label}</p>
              <div className="flex items-start gap-1.5 px-2">
                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                <p className="text-xs leading-snug" style={{ color: '#2a1f0e' }}>{row.boutique}</p>
              </div>
              <div className="flex items-start gap-1.5 px-2">
                <X className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                <p className="text-xs leading-snug" style={{ color: '#6b5c45' }}>{row.bigbox}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Source of Truth Banner */}
        <div className="rounded-2xl px-6 py-4 mb-4 flex items-center justify-between gap-4"
          style={{ background: 'rgba(212,175,55,0.1)', border: `2px solid ${GOLD}` }}>
          <div>
            <p className="text-xs font-black tracking-widest uppercase mb-0.5" style={{ color: GOLD }}>LEGAL SOURCE OF TRUTH</p>
            <p className="text-sm" style={{ color: '#2a1f0e' }}>The 25/10 split is formalized in two signed agreements — one for each side of the transaction.</p>
          </div>
          <Link to="/admin/prn-agreements"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm tracking-wide shrink-0 transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            <FileText className="w-4 h-4" />
            View Agreements
          </Link>
        </div>

        {/* Hero CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: '#0d0d0d', border: `2px solid ${GOLD}` }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>READY TO PROTECT YOUR FEE?</p>
          <h2 className="font-black text-2xl text-white mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Submit a Managed Referral
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Sign the Sending Agent Opt-In Agreement and we'll take it from there — vetting, logistics, and fee protection included.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/admin/prn-agreements"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-black text-sm tracking-wide transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              <FileText className="w-4 h-4" />
              Download Referral Agreement
            </Link>
            <Link to="/admin/sending-agents"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-black text-sm tracking-wide transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <ArrowRight className="w-4 h-4" />
              Submit Managed Referral
            </Link>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}