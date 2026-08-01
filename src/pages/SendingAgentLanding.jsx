import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Shield, DollarSign, Truck, ArrowRight, CheckCircle, Phone } from 'lucide-react';
import VettingDeskDuo from '@/components/charlie/VettingDeskDuo';
import PortalLeadInDuo from '@/components/portal/PortalLeadInDuo';

const GOLD = '#D4AF37';

const FEATURES = [
  {
    icon: Shield,
    number: '1',
    title: 'Zero Work on Your End',
    body: 'Send us the client name and destination state — we handle all destination vetting, agent selection, and logistics coordination.',
  },
  {
    icon: DollarSign,
    number: '2',
    title: 'Your 25% Fee — Protected',
    body: 'We guarantee your 25% referral fee is documented, tracked, and enforced through our compliance team. You get paid at closing.',
  },
  {
    icon: Truck,
    number: '3',
    title: 'Full Move Logistics',
    body: 'We provide everything your client needs — city guides, school research, utility setup, and a dedicated AI concierge at their side.',
  },
];

export default function SendingAgentLanding() {
  const [form, setForm] = useState({ agent_name: '', agent_email: '', client_name: '', destination_state: '', notes: '' });
  const [smsConsent, setSmsConsent] = useState(false);
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
    const user = await appClient.auth.me();
    if (!user?.portal_role) await appClient.auth.updateMe({ portal_role: 'referral_agent' });
    localStorage.setItem('dyson_portal', JSON.stringify({ roleKey: 'referral_agent', dest: '/partner-benefits' }));
    sessionStorage.setItem('dyson_role', 'referral_agent');
    window.dispatchEvent(new Event('dyson_role_change'));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>

      {/* Hero */}
      <div className="px-6 py-16 text-center" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex justify-center mb-8">
          <a href="/?choose=1" title="Back to landing page">
            <img
              src="/assets/dyson-logo.png"
              alt="Dyson & Dyson"
              className="h-20 w-auto"
            />
          </a>
        </div>
        <p className="text-xs font-black tracking-[0.3em] mb-4" style={{ color: GOLD }}>
          PRIVATE REFERRAL NETWORK · BOUTIQUE AGENT PROGRAM
        </p>
        <h1 className="font-black text-4xl md:text-5xl leading-tight text-white mb-6 max-w-3xl mx-auto"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Don't Leave Money on the Table<br />When Your Client Leaves the State.
        </h1>
        <p className="text-lg leading-relaxed max-w-xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
          You have the listing — but where are they moving? We handle the destination, protect your 25% referral fee, and manage the full move logistics.
        </p>
        <a href="#submit"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-base tracking-wide transition-all hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
          Submit a Referral <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      {/* How It Works */}
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-xs font-black tracking-[0.3em] text-center mb-10" style={{ color: GOLD }}>HOW IT WORKS</p>
        <div className="grid gap-6">
          {FEATURES.map(({ icon: Icon, number, title, body }) => (
            <div key={number} className="flex gap-5 rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-lg"
                style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
                {number}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" style={{ color: GOLD }} />
                  <p className="font-black text-base text-white">{title}</p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fee Callout */}
        <div className="mt-8 rounded-2xl p-6 text-center"
          style={{ background: 'rgba(212,175,55,0.08)', border: `2px solid ${GOLD}` }}>
          <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>THE FEE STRUCTURE</p>
          <p className="text-white text-sm leading-relaxed">
            On a <strong className="text-white">$1M transaction</strong> at 3% gross commission ($30,000):<br />
            <span style={{ color: '#10b981' }} className="font-black">Your 25% = $7,500</span> · Dyson Management 10% = $3,000 · Total at destination: 35%
          </p>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            vs. 40–50% skimmed by corporate relo divisions — with zero fee protection for you.
          </p>
        </div>
      </div>

      {/* Charlie & Bob — DNN strategy lead-in */}
      <PortalLeadInDuo />

      {/* National Vetting Desk — Charlie/Bob duo */}
      <VettingDeskDuo />

      {/* Submission Form */}
      <div id="submit" className="px-6 pb-20 max-w-2xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `2px solid ${GOLD}` }}>
          <div className="px-6 py-5 text-center" style={{ background: GOLD }}>
            <p className="font-black text-xl tracking-wide" style={{ color: '#000' }}>Submit Your Out-of-State Referral</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.65)' }}>We'll vet the destination agent and manage logistics. You collect your 25%.</p>
          </div>

          {submitted ? (
            <div className="px-6 py-14 text-center" style={{ background: '#111' }}>
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#10b981' }} />
              <p className="font-black text-xl text-white mb-2">Referral Submitted!</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Our team will reach out within 24 hours to begin the vetting process.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-8 space-y-4" style={{ background: '#111' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Your Name *</label>
                  <input required value={form.agent_name} onChange={e => set('agent_name', e.target.value)}
                    placeholder="Sending agent name"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }} />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Your Email *</label>
                  <input required type="email" value={form.agent_email} onChange={e => set('agent_email', e.target.value)}
                    placeholder="you@brokerage.com"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Client Name *</label>
                  <input required value={form.client_name} onChange={e => set('client_name', e.target.value)}
                    placeholder="Client full name"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }} />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widests uppercase block mb-1" style={{ color: GOLD }}>Destination State *</label>
                  <input required value={form.destination_state} onChange={e => set('destination_state', e.target.value)}
                    placeholder="e.g. Tennessee, Texas"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Notes (optional)</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Timeline, budget, any context..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' }} />
              </div>
              {/* SMS Consent Checkbox — required for Twilio A2P compliance */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={smsConsent}
                  onChange={e => setSmsConsent(e.target.checked)}
                  className="mt-1 shrink-0 w-4 h-4 accent-yellow-400"
                />
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  I agree to receive SMS updates from Dyson & Dyson regarding referral opportunities and transaction milestones. Msg &amp; data rates may apply. Reply STOP to unsubscribe. View our{' '}
                  <a href="/privacy" target="_blank" className="underline" style={{ color: GOLD }}>Privacy Policy</a>{' '}
                  and{' '}
                  <a href="/terms" target="_blank" className="underline" style={{ color: GOLD }}>Terms</a>.
                </span>
              </label>

              <button type="submit" disabled={submitting || !smsConsent}
                className="w-full py-3.5 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
                <ArrowRight className="w-4 h-4" />
                {submitting ? 'Submitting…' : 'Submit Out-of-State Referral'}
              </button>
            </form>
          )}
        </div>

        {/* Footer contact */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Questions? Call or text us directly.</p>
          <a href="tel:+18583531200" className="flex items-center justify-center gap-2 mt-2 font-black text-lg" style={{ color: GOLD }}>
            <Phone className="w-5 h-5" /> (858) 353-1200
          </a>
          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Dyson & Dyson Relocation Group · CalDRE #XXXXXXX · dysonanddyson.com
          </p>
        </div>
      </div>
    </div>
  );
}