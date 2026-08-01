import React, { useState } from 'react';
import { Copy, CheckCircle, MessageSquare, ArrowRight, Home, Clock, AlertCircle } from 'lucide-react';

const GOLD = '#D4AF37';
const TAN = '#ede0cc';

const TEMPLATES = {
  just_listed: (agentName, street) =>
    `Hi ${agentName || '[Agent Name]'}, congrats on the new listing on ${street || '[Street]'}. Since your sellers are heading out of town, I wanted to offer our National Vetting Desk. While you handle the listing, we vet the top 1% of agents at their destination and secure your 25% referral fee now. No cost to you, and we handle the move logistics so you don't have to. See our 'Boutique Plug-in' here: dysonrelo.com/partner-benefits`,

  in_escrow: (agentName, street) =>
    `Hi ${agentName || '[Agent Name]'}, saw ${street || '[Street]'} just went into escrow — congrats! Most independents don't have a relo department to handle the destination hand-off during a busy escrow. We can step in today as your 'De Facto Relo Desk' to vet their next agent and manage the move logistics. We protect your 25% fee and take the move-management off your plate. Quick look at the workflow: dysonrelo.com/partner-benefits`,
};

const TIPS = [
  { label: 'Who to target', body: 'Independent boutique agents who just listed in outflow markets (LA, SF, Seattle, Chicago). Exclude Compass, Coldwell, Sotheby\'s, KW, eXp.' },
  { label: 'When to send', body: 'Within 48 hours of a new listing or escrow opening. The "Just Listed" agent has time; the "In Escrow" agent needs rescue now — both are receptive.' },
  { label: 'How to find them', body: 'Pull new listings and new escrows from Zillow/Redfin in exodus zip codes. Filter for non-franchise listing agents. Check the Master Roster for existing status.' },
  { label: 'Follow-up', body: 'If no reply in 3 days: "Just checking — does your seller have a destination in mind?" Keep it peer-to-peer, never salesy.' },
];

const FEE_REBUTTAL = `"I totally get it. Here's the reality: That 35% is the standard corporate relocation rate — but instead of going to a big franchise HQ, we use it to fund your client's full move management. Your 25% is fixed and protected from day one. The extra 10% is paid by the receiving agent for a vetted, high-intent lead we've already prepared for them. You get the referral check, we do the 40 hours of logistics work, and the client gets a white-glove move. It's a win for everyone."`;

export default function AdminExodusOutreach() {
  const [trigger, setTrigger] = useState('just_listed');
  const [agentName, setAgentName] = useState('');
  const [street, setStreet] = useState('');
  const [copied, setCopied] = useState(null); // 'sms' | 'rebuttal'

  const message = TEMPLATES[trigger](agentName, street);

  const handleCopy = (type, text) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: TAN }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.3em] mb-2" style={{ color: GOLD }}>PRN · TARGETING</p>
          <h1 className="font-black text-3xl leading-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
            Exodus Agent Outreach
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#4a3a28' }}>
            Target independent listing agents at the exact moment of their logistics pain — choose the right trigger for maximum impact.
          </p>
        </div>

        {/* Trigger Toggle */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: `2px solid ${GOLD}` }}>
          <div className="px-5 py-4" style={{ background: '#0d0d0d' }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>STEP 1 — SELECT YOUR TRIGGER</p>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3" style={{ background: '#fff8ee' }}>
            {/* Just Listed */}
            <button
              onClick={() => setTrigger('just_listed')}
              className="flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-all"
              style={{
                background: trigger === 'just_listed' ? 'rgba(212,175,55,0.15)' : '#ede0cc',
                border: trigger === 'just_listed' ? `2px solid ${GOLD}` : '2px solid transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: trigger === 'just_listed' ? GOLD : 'rgba(212,175,55,0.2)' }}>
                  <Home className="w-3.5 h-3.5" style={{ color: trigger === 'just_listed' ? '#000' : GOLD }} />
                </div>
                <span className="font-black text-sm" style={{ color: '#1a1a1a' }}>Just Listed</span>
              </div>
              <p className="text-xs leading-snug" style={{ color: '#6b5c45' }}>Strategic prep play. They have time. You offer to handle the destination homework.</p>
            </button>

            {/* In Escrow */}
            <button
              onClick={() => setTrigger('in_escrow')}
              className="flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-all"
              style={{
                background: trigger === 'in_escrow' ? 'rgba(239,68,68,0.1)' : '#ede0cc',
                border: trigger === 'in_escrow' ? '2px solid rgba(239,68,68,0.5)' : '2px solid transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: trigger === 'in_escrow' ? '#dc2626' : 'rgba(239,68,68,0.15)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: trigger === 'in_escrow' ? '#fff' : '#dc2626' }} />
                </div>
                <span className="font-black text-sm" style={{ color: '#1a1a1a' }}>In Escrow</span>
              </div>
              <p className="text-xs leading-snug" style={{ color: '#6b5c45' }}>Transaction rescue. High pressure. They need a relo desk now, not next week.</p>
            </button>
          </div>

          {/* Trigger Context Banner */}
          <div className="mx-5 mb-5 rounded-xl px-4 py-3 text-xs"
            style={{
              background: trigger === 'in_escrow' ? 'rgba(239,68,68,0.08)' : 'rgba(212,175,55,0.08)',
              border: `1px solid ${trigger === 'in_escrow' ? 'rgba(239,68,68,0.25)' : 'rgba(212,175,55,0.25)'}`,
              color: '#4a3a28'
            }}>
            {trigger === 'just_listed'
              ? '🏠 They have time. Position yourself as a proactive partner who starts the destination vetting before they even ask.'
              : '⏱ High urgency. They\'re managing inspections, disclosures, and a stressed seller. You\'re the lifesaver who takes the out-of-state problem off their plate today.'}
          </div>
        </div>

        {/* Personalizer */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: `2px solid ${GOLD}` }}>
          <div className="px-5 py-4" style={{ background: '#0d0d0d' }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>STEP 2 — PERSONALIZE YOUR MESSAGE</p>
          </div>
          <div className="px-5 py-5 space-y-4" style={{ background: '#fff8ee' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Agent First Name</label>
                <input value={agentName} onChange={e => setAgentName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Property Street Address</label>
                <input value={street} onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. 4821 Maple Ave"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
              </div>
            </div>

            {/* Message Preview */}
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-2" style={{ color: GOLD }}>
                <MessageSquare className="w-3 h-3 inline mr-1" />
                {trigger === 'just_listed' ? 'Strategic Preparation Script' : 'Transaction Rescue Script'}
              </label>
              <div className="rounded-xl px-4 py-4 text-sm leading-relaxed"
                style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.3)', color: '#2a1f0e', fontFamily: 'Georgia, serif' }}>
                {message}
              </div>
            </div>

            <button onClick={() => handleCopy('sms', message)}
              className="w-full py-3 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: copied === 'sms' ? 'rgba(16,185,129,0.15)' : `linear-gradient(135deg, #e8c84a, ${GOLD})`,
                color: copied === 'sms' ? '#059669' : '#000',
                border: copied === 'sms' ? '1px solid rgba(16,185,129,0.4)' : 'none'
              }}>
              {copied === 'sms' ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Message</>}
            </button>
          </div>
        </div>

        {/* Fee Pushback Rebuttal */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid rgba(212,175,55,0.4)' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ background: '#0d0d0d' }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>HANDLING THE "35% IS TOO HIGH" OBJECTION</p>
          </div>
          <div className="px-5 py-5" style={{ background: '#fff8ee' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#6b5c45' }}>When an agent pushes back on the fee structure, use this rebuttal:</p>
            <div className="rounded-xl px-4 py-4 text-sm leading-relaxed mb-4"
              style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.3)', color: '#2a1f0e', fontFamily: 'Georgia, serif' }}>
              {FEE_REBUTTAL}
            </div>
            <button onClick={() => handleCopy('rebuttal', FEE_REBUTTAL)}
              className="w-full py-2.5 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: copied === 'rebuttal' ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)',
                color: copied === 'rebuttal' ? '#059669' : GOLD,
                border: `1px solid ${copied === 'rebuttal' ? 'rgba(16,185,129,0.4)' : 'rgba(212,175,55,0.4)'}`
              }}>
              {copied === 'rebuttal' ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Fee Rebuttal</>}
            </button>
          </div>
        </div>

        {/* Tips */}
        <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>OUTREACH STRATEGY</p>
        <div className="space-y-3 mb-8">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex gap-4 rounded-2xl px-5 py-4"
              style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black text-xs mt-0.5"
                style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>
                {i + 1}
              </div>
              <div>
                <p className="font-black text-sm mb-0.5" style={{ color: '#1a1a1a' }}>{tip.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#4a3a28' }}>{tip.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Roster */}
        <div className="rounded-2xl px-6 py-5 flex items-center justify-between"
          style={{ background: '#0d0d0d', border: `1px solid ${GOLD}` }}>
          <div>
            <p className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: GOLD }}>Filter Independent Agents</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Use the "Independent Only" toggle in the Master Roster to generate your outreach list.</p>
          </div>
          <a href="/admin/roster"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm shrink-0 ml-4 transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            Roster <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Compliance Footer */}
        <div className="rounded-2xl px-6 py-5 mt-6 space-y-2" style={{ background: '#0d0d0d', border: '1px solid rgba(16,185,129,0.4)' }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-3" style={{ color: '#10b981' }}>✅ CARRIER COMPLIANCE STATUS — A2P 10DLC REGISTERED</p>
          <div className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <p>📵 <strong style={{ color: '#fff' }}>Opt-Out:</strong> Every initial message must include "Reply STOP to opt-out."</p>
            <p>🔗 <strong style={{ color: '#fff' }}>Transparency:</strong> All links must lead to dysonrelo.com (verified).</p>
            <p>🔒 <strong style={{ color: '#fff' }}>Privacy:</strong> No mobile data is shared with 3rd parties per our <a href="/privacy" target="_blank" className="underline" style={{ color: GOLD }}>Privacy Policy</a>.</p>
          </div>
          <div className="mt-4 pt-4 rounded-xl px-4 py-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: GOLD }}>FIRST TOUCH SAFE TEMPLATE (USE WHILE CAMPAIGN IS PENDING)</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Georgia, serif' }}>
              "Hi [Agent Name], this is Dyson & Dyson. We have an out-of-state referral for [Street Address] and want to secure a 25% fee for you. See the workflow and our privacy terms at dysonrelo.com/partner-benefits. Reply STOP to opt-out."
            </p>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}