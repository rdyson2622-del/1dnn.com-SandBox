import React, { useState } from 'react';
import { Copy, Check, Megaphone } from 'lucide-react';

const GOLD = '#D4AF37';

const MESSAGES = [
  {
    key: 'social',
    channel: 'SOCIAL MEDIA POST',
    body: `🏡 AGENTS & BROKERS: Your referral is worth more than 25%.

Join the Dyson & Dyson Relocation Network and here's what happens when you send us a relocating client:

✅ You keep your 25% buy-side referral — paid through your broker
✅ We manage the ENTIRE move — agent vetting, escrow, logistics
✅ Monthly bonus pool: 5–10% of our management fees split among producing affiliates — nationwide & worldwide
✅ Passive affiliates share another 1–3% on ALL closings, every month
✅ Coming soon: YOU as the on-camera presenter of daily DNN Real Estate News to your own audience

We've never had a receiving agent decline our referral. Not once.

Watch Bob Dyson explain it himself → [VIDEO LINK]

#RealEstate #Relocation #ReferralNetwork #DysonAndDyson`,
  },
  {
    key: 'recruit',
    channel: 'AGENT RECRUITING MESSAGE (SMS / DM)',
    body: `Hi [AGENT NAME] — Bob Dyson here with Dyson & Dyson Relocation. We sought you out based on your production, average sale price, and market performance — all of record.

Here's the short version: refer your relocating clients to us, keep your full 25% buy-side referral, and share in our monthly bonus pool (5–10% of management fees to producing affiliates + 1–3% to passive members on ALL network closings, worldwide).

Example month: 275 agents, 40 closings at $2M average — each producing agent could see $10,000+ in bonus, ON TOP of their own referral.

Watch my 2-minute explanation: [VIDEO LINK]

Reply YES and we'll send your affiliate agreement.`,
  },
  {
    key: 'email',
    channel: 'EMAIL CAMPAIGN',
    body: `Subject: You've been selected — Dyson & Dyson Relocation Network invitation

Dear [AGENT NAME],

You weren't chosen at random. We identified you based on your performance, production, and average sale price — all of record.

Here's how commissions work when you join our network and refer a relocating client:

1. YOUR REFERRAL — 25% of the buy-side commission, paid through your broker arrangement.
2. OUR MANAGEMENT FEE — an additional 15–25% for managing the entire move: agent vetting, escrow coordination, and full relocation logistics.
3. Will a receiving broker agree to 50% total? The sweat equity on a $300K home is the same as a $3M home — and we have NEVER had a receiving agent decline.

THE BONUS POOL — At month's end we allocate 5–10% of our management fees to every affiliate who closed a transaction that month, nationwide and worldwide. Another 1–3% is paid equally to passive affiliates on all network sales. In a typical month (275 agents, 40 closings at $2M average, 2.5% gross), each producing agent could receive $10,000+ — in addition to their own referral.

AND WE DON'T STOP THERE — We're approaching the point where we can clone you as the on-camera presenter of daily DNN Real Estate News, broadcast to your local audience, contact list, and past clients.

Hear it directly from Bob Dyson: [VIDEO LINK]
See the benchmark spreadsheet attached.

Join the network: [SIGNUP LINK]

— The Dyson & Dyson Relocation Team
(858) 353-1200`,
  },
];

export default function RecruitingMessages() {
  const [copied, setCopied] = useState(null);

  const copy = (m) => {
    navigator.clipboard.writeText(m.body);
    setCopied(m.key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.3)' }}>
      <div className="flex items-center gap-2 mb-5">
        <Megaphone className="w-4 h-4" style={{ color: GOLD }} />
        <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>RECRUITING MESSAGING — READY TO SEND</p>
      </div>
      <div className="space-y-4">
        {MESSAGES.map(m => (
          <div key={m.key} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'rgba(212,175,55,0.1)' }}>
              <span className="text-[10px] font-black tracking-[0.2em]" style={{ color: GOLD }}>{m.channel}</span>
              <button onClick={() => copy(m)}
                className="px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 transition-all hover:scale-105"
                style={{ background: '#000', border: `1px solid ${GOLD}`, color: GOLD }}>
                {copied === m.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === m.key ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap"
              style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'inherit', background: 'rgba(255,255,255,0.02)' }}>
              {m.body}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}