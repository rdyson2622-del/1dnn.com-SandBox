import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Shield, DollarSign, Truck, ArrowRight, CheckCircle } from 'lucide-react';

const GOLD = '#D4AF37';
const TAN = '#ede0cc';

const FEATURES = [
  {
    icon: Shield,
    number: '1',
    title: 'Zero Work',
    body: 'Send us the client name and destination state — we handle all destination vetting, agent selection, and logistics coordination.',
  },
  {
    icon: DollarSign,
    number: '2',
    title: 'Fee Protection',
    body: 'We guarantee your 25% referral fee is documented, tracked, and enforced through our compliance team. You get paid at closing.',
  },
  {
    icon: Truck,
    number: '3',
    title: 'Logistics Hub',
    body: 'We provide the full move-management your client needs — city guides, school research, utility setup, and a dedicated AI concierge.',
  },
];

export default function AdminExodusPitch() {
  const [form, setForm] = useState({ agent_name: '', agent_email: '', client_name: '', destination_state: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await appClient.entities.DnnSubscriber.create({
      full_name: form.client_name,
      source: 'Sending Agent Portal',
      referral_status: 'new',
      notes: `Sending Agent: ${form.agent_name} (${form.agent_email}) | Destination: ${form.destination_state} | Notes: ${form.notes}`,
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: TAN }}>
      <div className="max-w-3xl mx-auto">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/assets/dyson-logo.png"
            alt="Dyson & Dyson"
            className="h-20 w-auto"
          />
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black tracking-[0.3em] mb-2" style={{ color: GOLD }}>PRIVATE REFERRAL NETWORK (PRN) · EXODUS MARKET PROGRAM</p>
          <h1 className="font-black text-4xl leading-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
            Don't Leave Money on the Table<br />When Your Client Leaves the State.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#4a3a28', maxWidth: 560 }}>
            You have the listing — but where are they moving? If your client is leaving the state, you typically lose that connection, that referral fee, and that relationship. We fix that.
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-4 mb-10">
          {FEATURES.map(({ icon: Icon, number, title, body }) => (
            <div key={number} className="flex gap-5 rounded-2xl p-6"
              style={{ background: '#0d0d0d', border: '1px solid rgba(212,175,55,0.3)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-lg"
                style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
                {number}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" style={{ color: GOLD }} />
                  <p className="font-black text-sm tracking-wide" style={{ color: '#fff' }}>{title}</p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `2px solid ${GOLD}` }}>
          <div className="px-6 py-4" style={{ background: '#0d0d0d' }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>SUBMIT OUT-OF-STATE REFERRAL</p>
            <p className="text-white text-sm mt-0.5">We'll vet the destination agent and manage the logistics. You collect your 25%.</p>
          </div>

          {submitted ? (
            <div className="px-6 py-10 text-center" style={{ background: '#fff8ee' }}>
              <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#10b981' }} />
              <p className="font-black text-lg mb-1" style={{ color: '#1a1a1a' }}>Referral Submitted!</p>
              <p className="text-sm" style={{ color: '#6b5c45' }}>Our team will reach out within 24 hours to begin the vetting process.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4" style={{ background: '#fff8ee' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Your Name *</label>
                  <input required value={form.agent_name} onChange={e => set('agent_name', e.target.value)}
                    placeholder="Sending agent name"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Your Email *</label>
                  <input required type="email" value={form.agent_email} onChange={e => set('agent_email', e.target.value)}
                    placeholder="you@brokerage.com"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Client Name *</label>
                  <input required value={form.client_name} onChange={e => set('client_name', e.target.value)}
                    placeholder="Client full name"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Destination State *</label>
                  <input required value={form.destination_state} onChange={e => set('destination_state', e.target.value)}
                    placeholder="e.g. Tennessee, Texas"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Timeline, budget, any context..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
                <ArrowRight className="w-4 h-4" />
                {submitting ? 'Submitting…' : 'Submit Out-of-State Referral'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}