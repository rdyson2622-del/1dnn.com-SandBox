import React, { useState, useEffect } from 'react';
import { appClient } from '@/api/appClient';
import { CheckCircle, ArrowRight, Building2, Award, Mail } from 'lucide-react';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";
const DNN_LOGO = '/assets/dnn-logo.png';

const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' };

export default function AgentSubscribe() {
  const [form, setForm] = useState({
    agent_name: '', email: '', phone: '', brokerage: '', city: '', state: '',
    dre_number: '', markets: '', sms_consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pre = {};
    if (params.get('name')) pre.agent_name = decodeURIComponent(params.get('name'));
    if (params.get('email')) pre.email = decodeURIComponent(params.get('email'));
    if (params.get('phone')) pre.phone = decodeURIComponent(params.get('phone'));
    if (params.get('brokerage')) pre.brokerage = decodeURIComponent(params.get('brokerage'));
    if (params.get('city')) pre.city = decodeURIComponent(params.get('city'));
    if (params.get('state')) pre.state = decodeURIComponent(params.get('state'));
    if (Object.keys(pre).length) setForm(f => ({ ...f, ...pre }));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create DnnSubscriber record
      await appClient.entities.DnnSubscriber.create({
        full_name: form.agent_name,
        email: form.email,
        phone: form.phone,
        source: 'Agent Campaign',
        tier: 'tier1',
      });

      // Create PartnerAgent record
      await appClient.entities.PartnerAgent.create({
        agent_name: form.agent_name,
        email: form.email,
        phone: form.phone,
        brokerage: form.brokerage,
        state: form.state,
        markets: form.markets ? form.markets.split(',').map(m => m.trim()).filter(Boolean) : [],
        dre_number: form.dre_number,
        status: 'prospect',
        source: 'Agent Campaign',
      });

      const user = await appClient.auth.me();
      if (!user?.portal_role) await appClient.auth.updateMe({ portal_role: 'agent' });
      localStorage.setItem('dyson_portal', JSON.stringify({ roleKey: 'agent', dest: '/find-agent' }));
      sessionStorage.setItem('dyson_role', 'agent');
      window.dispatchEvent(new Event('dyson_role_change'));
      setDone(true);
    } catch (err) {
      console.error('Subscribe error:', err);
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10" style={{ background: '#0d0d0d' }}>
        <div className="flex items-center gap-8 mb-8">
          <img src={DNN_LOGO} alt="DNN" className="h-14 w-auto" />
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-14 w-auto" />
        </div>
        <div className="text-center max-w-lg">
          <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: '#10b981' }} />
          <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Welcome to the Network
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            You're now subscribed to the DNN Real Estate News broadcast — delivered to your inbox every morning.
            We'll be in touch about affiliation opportunities with the Dyson & Dyson Relocation Network.
          </p>
          <a href="/dnn-news"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            Watch Today's Broadcast <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="px-6 py-10 text-center" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex justify-center gap-8 mb-6">
          <img src={DNN_LOGO} alt="DNN" className="h-12 w-auto" />
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 w-auto" />
        </div>
        <p className="text-xs font-black tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>
          EXCLUSIVE AGENT INVITATION
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 max-w-2xl mx-auto"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          You've Been Selected to Join the Dyson Relocation Network
        </h1>
        <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Subscribe to receive the DNN Real Estate News broadcast every morning — for yourself and your clients —
          and learn about affiliation with the nation's premier independent-brokerage relocation network.
        </p>
      </div>

      {/* Value props */}
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Mail, title: 'Daily News Broadcast', desc: 'Charlie Simmons & Bob Dyson break down the day\'s top real estate stories every morning.' },
            { icon: Building2, title: 'National Referral Network', desc: 'Send your out-of-state clients to vetted agents in 50 states. Your 25% referral fee is protected.' },
            { icon: Award, title: 'Independent Brokerage Only', desc: 'No Compass, no franchises. We partner exclusively with boutique independent firms.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <Icon className="w-5 h-5 mb-2" style={{ color: GOLD }} />
                <p className="text-xs font-bold text-white mb-1">{item.title}</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl" style={{ background: '#111', border: `1px solid ${GOLD}40` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Full Name *</label>
              <input required value={form.agent_name} onChange={e => set('agent_name', e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Email *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@brokerage.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Phone *</label>
              <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="(555) 555-5555"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Brokerage Name *</label>
              <input required value={form.brokerage} onChange={e => set('brokerage', e.target.value)}
                placeholder="Your brokerage"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>City *</label>
              <input required value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="Primary city"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>State *</label>
              <input required value={form.state} onChange={e => set('state', e.target.value)}
                placeholder="CA"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>License #</label>
              <input value={form.dre_number} onChange={e => set('dre_number', e.target.value)}
                placeholder="DRE / license #"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Markets Served (comma-separated)</label>
            <input value={form.markets} onChange={e => set('markets', e.target.value)}
              placeholder="e.g. San Diego, La Jolla, Del Mar"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>

          {/* SMS consent */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={form.sms_consent} onChange={e => set('sms_consent', e.target.checked)}
              required className="mt-0.5" />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              I consent to receive SMS notifications about the DNN broadcast and network affiliation updates.
              Message & data rates may apply. Reply STOP to opt out.
            </span>
          </label>

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            <ArrowRight className="w-4 h-4" />
            {submitting ? 'Subscribing…' : 'Subscribe & Join the Network'}
          </button>
        </form>

        <p className="text-center text-[10px] mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Dyson & Dyson · 55 Years of Relocation Management · Independent Brokerage Network
        </p>
      </div>
    </div>
  );
}