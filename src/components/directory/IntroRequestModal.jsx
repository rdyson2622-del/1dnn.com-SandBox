import React, { useState } from 'react';
import { X } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

export default function IntroRequestModal({ agentName, city, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await appClient.entities.DnnSubscriber.create({
      full_name: form.name,
      email: form.email,
      phone: form.phone,
      source: `Directory — ${city} — ${agentName}`,
      notes: form.message || `Intro request for ${agentName} in ${city}`,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}
        style={{ background: '#fff8ee', border: `2px solid ${GOLD}` }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#0d0d0d' }}>
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>DYSON RELOCATION TEAM</p>
            <p className="text-white font-bold text-sm mt-0.5">Introduction Request · {agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-black text-lg mb-2" style={{ color: '#1a1a1a' }}>Request Received</p>
            <p className="text-sm leading-relaxed" style={{ color: '#3a2f1e', fontFamily: 'Georgia, serif' }}>
              Your introduction request for <strong>{agentName}</strong> in {city} is being processed. Our Relocation Team will contact you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <p className="text-sm leading-relaxed rounded-xl px-4 py-3"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#3a2f1e', fontFamily: 'Georgia, serif' }}>
              Introductions to <strong>{agentName}</strong> in {city} are handled by the Dyson Relocation Team. We'll screen the fit and make the introduction.
            </p>
            {[
              { key: 'name', placeholder: 'Your Full Name', required: true },
              { key: 'email', placeholder: 'Email Address', required: true },
              { key: 'phone', placeholder: 'Phone Number', required: false },
            ].map(({ key, placeholder, required }) => (
              <input key={key} required={required} placeholder={placeholder}
                value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.3)', color: '#1a1a1a' }} />
            ))}
            <textarea placeholder="Tell us about your move (optional)" rows={3}
              value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.3)', color: '#1a1a1a' }} />
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-full font-black text-sm tracking-wide transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              {loading ? 'Submitting…' : 'Submit to Dyson Team →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}