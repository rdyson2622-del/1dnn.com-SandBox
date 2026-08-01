import React from 'react';
import { Download, Table } from 'lucide-react';

const GOLD = '#D4AF37';
const fmt = (n) => '$' + n.toLocaleString();

// Benchmark rows: buy-side @ 2.5% gross
const PRICE_TIERS = [300000, 750000, 1000000, 2000000, 3000000].map(price => {
  const gross = price * 0.025;
  return {
    price,
    gross,
    referral25: gross * 0.25,
    mgmtLow: gross * 0.15,
    mgmtHigh: gross * 0.25,
  };
});

const MEMBERSHIP = [
  { tier: 'Producing Affiliate', criteria: 'Closed 1+ escrow that month', benefit: '5–10% of D&D management fees, split among producers — nationwide & worldwide' },
  { tier: 'Passive Affiliate', criteria: 'Signed network member, no closing that month', benefit: '1–3% of management fees on ALL network sales, split equally' },
  { tier: 'DNN Presenter (Coming)', criteria: 'Active affiliate + subscriber', benefit: 'Cloned as daily DNN Real Estate News presenter to your local audience & past clients' },
];

function downloadCSV() {
  const rows = [
    ['DYSON & DYSON RELOCATION NETWORK — AFFILIATE BENCHMARKS'],
    [],
    ['Sale Price', 'Buy-Side Gross (2.5%)', 'Your 25% Referral', 'D&D Mgmt Fee (15%)', 'D&D Mgmt Fee (25%)'],
    ...PRICE_TIERS.map(t => [t.price, t.gross, t.referral25, t.mgmtLow, t.mgmtHigh]),
    [],
    ['MEMBERSHIP TIERS'],
    ['Tier', 'Criteria', 'Benefit'],
    ...MEMBERSHIP.map(m => [m.tier, m.criteria, `"${m.benefit}"`]),
    [],
    ['EXAMPLE MONTH'],
    ['275 agents / 40 closings / $2M avg sale / 2.5% gross commission'],
    ['Realistic producing-agent bonus: $10,000+ that month, in addition to own referral'],
    ['Non-producing affiliates also receive an equal passive bonus share'],
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dyson-network-benchmarks.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function RecruitingBenchmarks() {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.3)' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4" style={{ color: GOLD }} />
          <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>BENCHMARKS TO JOINING D&D</p>
        </div>
        <button onClick={downloadCSV}
          className="px-4 py-2 rounded-full text-[11px] font-black flex items-center gap-2 transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
          <Download className="w-3.5 h-3.5" /> Download Spreadsheet (CSV)
        </button>
      </div>

      {/* Commission benchmarks */}
      <div className="overflow-x-auto rounded-xl mb-6" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'rgba(212,175,55,0.12)' }}>
              {['Sale Price', 'Buy-Side Gross (2.5%)', 'Your 25% Referral', 'D&D Mgmt Fee (15–25%)'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-black tracking-wide" style={{ color: GOLD }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICE_TIERS.map(t => (
              <tr key={t.price} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td className="px-4 py-2.5 font-bold text-white">{fmt(t.price)}</td>
                <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{fmt(t.gross)}</td>
                <td className="px-4 py-2.5 font-bold" style={{ color: GOLD }}>{fmt(t.referral25)}</td>
                <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{fmt(t.mgmtLow)} – {fmt(t.mgmtHigh)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Membership tiers */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {MEMBERSHIP.map(m => (
          <div key={m.tier} className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <p className="font-black text-sm mb-1" style={{ color: GOLD }}>{m.tier}</p>
            <p className="text-[11px] mb-2 italic" style={{ color: 'rgba(255,255,255,0.5)' }}>{m.criteria}</p>
            <p className="text-xs leading-relaxed text-white">{m.benefit}</p>
          </div>
        ))}
      </div>

      {/* Example month */}
      <div className="rounded-xl px-5 py-4" style={{ background: 'rgba(212,175,55,0.1)', border: `1px solid ${GOLD}` }}>
        <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2" style={{ color: GOLD }}>EXAMPLE MONTH</p>
        <p className="text-sm text-white leading-relaxed">
          275 agents close <strong>40 sales</strong> collectively at an average of <strong>$2,000,000</strong> per sale
          and <strong>2.5% gross commission</strong> — it's realistic that each producing agent/brokerage receives a bonus of
          <strong style={{ color: GOLD }}> over $10,000 that month</strong>, in addition to their own referral.
          Non-producing affiliates also receive a passive bonus share.
        </p>
      </div>
    </div>
  );
}