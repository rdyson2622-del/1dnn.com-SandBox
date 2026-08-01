import React, { useState } from 'react';
import { Copy, CheckCircle, Mail, Save } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';
const TAN = '#ede0cc';

const DEFAULT = {
  receiving_agent: '',
  agent_name: '',
  client_name: '',
  destination_city: '',
  relocation_reason: '',
  move_by_date: '',
  specialized_assets: '',
  price_range: '',
  sending_broker: '',
};

function buildEmail(f) {
  return `To: ${f.receiving_agent || '[Receiving Agent Email]'}
Subject: Managed Referral: ${f.client_name || '[Client Name]'} ➔ ${f.destination_city || '[Destination City]'} (Dyson Private Referral Network)

Hi ${f.agent_name || '[Agent Name]'},

You have been selected as the preferred boutique partner for a high-priority relocation from our Private Referral Network.

THE CLIENT STORY:
We have completed the "Solve My Story" intake for ${f.client_name || '[Client Name]'}. This isn't just a move; it's a ${f.relocation_reason || '[Relocation Reason — e.g., Family Legacy / Corporate Transition]'}.

KEY LOGISTICS (THE DYSON ADVANTAGE):

Timeline: Needs to be in-home by ${f.move_by_date || '[Date]'}.

Specialized Assets: ${f.specialized_assets || '[e.g., Fine Art / Vehicle Collection / 13 Chickens]'}. Dyson & Dyson is managing the transport and logistics for these items.

Financials: Pre-vetted at ${f.price_range || '[Price Range]'}.

REFERRAL TERMS:
As part of our Managed Referral Ecosystem, this lead is subject to a 35% Total Referral/Management Fee (25% to ${f.sending_broker || '[Sending Broker]'} / 10% to Dyson & Dyson).

NEXT STEPS:

1. Click here to Accept Lead & Sign Agreement: dysonrelo.com/partner-benefits

2. Once signed, the full "Client Story Profile" and contact details will be released to your dashboard.

3. Initial contact must be made within 4 hours of acceptance.

We handle the move logistics; you handle the real estate. Let's get them home.

Robert Dyson
Dyson & Dyson Companies, Inc.
(858) 353-1200 · dysonrelo.com`;
}

export default function AdminLeadHandoff() {
  const [form, setForm] = useState(DEFAULT);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveHandoff = async () => {
    await appClient.entities.ReferralHandoff.create({ ...form, status: 'sent' });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const email = buildEmail(form);

  const handleCopy = async () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    await saveHandoff();
  };

  const handleMailto = async () => {
    await saveHandoff();
    const subject = encodeURIComponent(`Managed Referral: ${form.client_name || '[Client Name]'} ➔ ${form.destination_city || '[Destination City]'} (Dyson Private Referral Network)`);
    const body = encodeURIComponent(email);
    window.open(`mailto:${form.receiving_agent}?subject=${subject}&body=${body}`);
  };

  const FIELDS = [
    { key: 'receiving_agent',   label: 'Receiving Agent Email',   placeholder: 'agent@brokerage.com',         col: 2 },
    { key: 'agent_name',        label: 'Agent First Name',         placeholder: 'e.g. Marcus',                col: 1 },
    { key: 'client_name',       label: 'Client Full Name',         placeholder: 'e.g. The Henderson Family',  col: 1 },
    { key: 'destination_city',  label: 'Destination City',         placeholder: 'e.g. Nashville, TN',         col: 1 },
    { key: 'relocation_reason', label: 'Relocation Reason',        placeholder: 'e.g. Corporate Transition',  col: 1 },
    { key: 'move_by_date',      label: 'Move-By Date',             placeholder: 'e.g. August 1, 2026',        col: 1 },
    { key: 'price_range',       label: 'Pre-Vetted Price Range',   placeholder: 'e.g. $800K–$1.2M',           col: 1 },
    { key: 'specialized_assets',label: 'Specialized Assets',       placeholder: 'e.g. Fine Art, 13 Chickens', col: 2 },
    { key: 'sending_broker',    label: 'Sending Broker Name',      placeholder: 'e.g. Pacific Coast Realty',  col: 2 },
  ];

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: TAN }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.3em] mb-2" style={{ color: GOLD }}>PRN · MANAGED REFERRAL</p>
          <h1 className="font-black text-3xl leading-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
            Elite Lead Hand-off Generator
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#4a3a28' }}>
            Fill in the client details below. The full referral email will generate live — copy it or open directly in your email client.
          </p>
        </div>

        {/* Fields */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: `2px solid ${GOLD}` }}>
          <div className="px-5 py-4" style={{ background: '#0d0d0d' }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>STEP 1 — CLIENT DETAILS</p>
          </div>
          <div className="px-5 py-6 grid grid-cols-2 gap-4" style={{ background: '#fff8ee' }}>
            {FIELDS.map(({ key, label, placeholder, col }) => (
              <div key={key} className={col === 2 ? 'col-span-2' : 'col-span-1'}>
                <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>{label}</label>
                <input
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: `2px solid ${GOLD}` }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ background: '#0d0d0d' }}>
            <Mail className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>STEP 2 — LIVE EMAIL PREVIEW</p>
          </div>
          <div className="px-5 py-5" style={{ background: '#fff8ee' }}>
            <pre className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: '#2a1f0e', fontFamily: 'Georgia, serif' }}>
              {email}
            </pre>
          </div>
        </div>

        {/* Saved confirmation */}
        {saved && (
          <div className="mb-3 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#059669' }}>
            <Save className="w-4 h-4" /> Hand-off saved to database.
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleCopy}
            className="flex-1 py-3.5 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{
              background: copied ? 'rgba(16,185,129,0.15)' : `linear-gradient(135deg, #e8c84a, ${GOLD})`,
              color: copied ? '#059669' : '#000',
              border: copied ? '1px solid rgba(16,185,129,0.4)' : 'none',
            }}>
            {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Full Email</>}
          </button>
          <button onClick={handleMailto}
            className="flex-1 py-3.5 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{ background: '#0d0d0d', color: GOLD, border: `1px solid ${GOLD}` }}>
            <Mail className="w-4 h-4" /> Open in Email Client
          </button>
        </div>

        {/* Fee reminder */}
        <div className="mt-6 rounded-2xl px-5 py-4 text-xs" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
          <p className="font-black mb-1" style={{ color: GOLD }}>Referral Fee Reminder</p>
          <p style={{ color: '#4a3a28' }}>This hand-off triggers a <strong>35% total fee</strong> — 25% to the Sending Broker, 10% to Dyson & Dyson — embedded in escrow instructions before any client introduction is made. The Receiving Agent signs digitally via <a href="/admin/prn-agreements" className="underline" style={{ color: GOLD }}>PRN Agreements</a> before receiving contact details.</p>
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}