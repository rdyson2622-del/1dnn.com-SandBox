import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { CheckCircle, ArrowRight } from 'lucide-react';

const GOLD = '#D4AF37';

const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)', color: '#fff' };

export default function PortalSubscribeForm({ portalName, source, roleKey, dest }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await appClient.functions.invoke('dnnSubscribe', {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        source,
      });
      const user = await appClient.auth.me();
      const assignedRole = user?.portal_role || roleKey;
      const assignedDest = {
        client: '/home', agent: '/find-agent', referral_agent: '/partner-benefits',
        vendor: '/search', hr: '/corporate-relo',
      }[assignedRole] || dest;
      if (!user?.portal_role) await appClient.auth.updateMe({ portal_role: roleKey });
      localStorage.setItem('dyson_portal', JSON.stringify({ roleKey: assignedRole, dest: assignedDest }));
      sessionStorage.setItem('dyson_role', assignedRole);
      window.dispatchEvent(new Event('dyson_role_change'));
      setDone(true);
    } catch (err) {
      setError(err?.message || 'We could not complete the subscription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `2px solid ${GOLD}` }}>
      <div className="px-6 py-4 text-center" style={{ background: GOLD }}>
        <p className="font-black text-lg tracking-wide" style={{ color: '#000' }}>Subscribe to the {portalName}</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.65)' }}>
          Subscribe once and this portal becomes your home page — you'll skip the landing page on every return visit.
        </p>
      </div>

      {done ? (
        <div className="px-6 py-10 text-center" style={{ background: '#111' }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#10b981' }} />
          <p className="font-black text-lg text-white mb-1">You're In!</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            This portal is now your home page. Click the D&amp;D logo in the upper left any time to return to the main landing page.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4" style={{ background: '#111' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Full Name *</label>
              <input required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Email *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>Phone (optional)</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="(555) 555-5555"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3.5 rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            <ArrowRight className="w-4 h-4" />
            {submitting ? 'Subscribing…' : `Subscribe & Make This My Portal`}
          </button>
          {error && <p role="alert" className="text-sm text-center text-red-300">{error}</p>}
        </form>
      )}
    </div>
  );
}
