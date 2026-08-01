import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { appClient } from '@/api/appClient';
import SolveMyStoryPresenter from '@/components/charlie/SolveMyStoryPresenter';

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

const SITUATION_TYPES = [
  "I'm planning a relocation and need a concierge team",
  "My current deal is stuck — escrow, title, or financing issue",
  "I need to sell my home and buy in a new city simultaneously",
  "I'm an agent or lender looking to refer a client",
  "I have a complex situation that doesn't fit a standard box",
];

export default function SolveMyStory() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    situation_type: '',
    story: '',
    subscribe: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.story) return;
    setLoading(true);
    setSubmitted(true);
    // Send data in background without waiting
    appClient.entities.DnnSubscriber.create({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      source: 'Solve My Story - Landing Page',
      tier: 'tier1',
      notes: `SITUATION: ${form.situation_type}\n\nSTORY: ${form.story}${form.subscribe ? '\n\n✅ OPTED IN to free DNN news & messaging' : ''}`,
      is_hot_lead: true,
      unsubscribed: !form.subscribe,
    }).catch(err => console.error('DnnSubscriber create error:', err));
    appClient.integrations.Core.SendEmail({
      to: 'bob@dysondyson.com',
      subject: `🔴 New "Solve My Story" Request — ${form.full_name}`,
      body: `
<h2>New Story Submission</h2>
<p><strong>Name:</strong> ${form.full_name}</p>
<p><strong>Email:</strong> ${form.email}</p>
<p><strong>Phone:</strong> ${form.phone || 'Not provided'}</p>
<p><strong>Situation Type:</strong> ${form.situation_type || 'Not selected'}</p>
<hr/>
<p><strong>Their Story:</strong></p>
<p>${form.story}</p>
      `,
    }).catch(err => console.error('SendEmail error:', err));
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center"
        style={{ background: '#ede0cc' }}>
        <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-[57.6px] w-auto mb-8" />
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ border: `2px solid ${GOLD}` }}>
          <CheckCircle className="w-8 h-8" style={{ color: GOLD }} />
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '2rem',
          fontWeight: 600,
          color: '#fff',
          marginBottom: '1rem'
        }}>
          Story Received.
        </h2>
        <p className="text-base mb-2" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px' }}>
          Our team has your submission and will reach out within 24 hours with a resolution — no pitch, just answers.
        </p>
        <p className="text-sm mt-6 font-bold tracking-widest uppercase" style={{ color: GOLD }}>
          Dyson & Dyson · 55 Years of Relocation Management
        </p>
      </div>
    );
  }

  return (
     <div className="min-h-screen" style={{ background: '#ede0cc' }}>
       <SolveMyStoryPresenter />

       {/* Header */}
       <div className="relative flex flex-col items-center pt-14 pb-10 text-center px-6 md:pr-48"
         style={{ background: '#ede0cc' }}>
        <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-[57.6px] w-auto mb-6" />
        <p className="text-xs font-black tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>
          DYSON &amp; DYSON · RELOCATION MANAGEMENT
        </p>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 600,
          color: '#000',
          lineHeight: 1.2,
          maxWidth: '640px'
        }}>
          Tell Us Your Story. We'll Solve It.
        </h1>
        <p className="mt-4 text-base" style={{ color: '#1a1a1a', maxWidth: '520px' }}>
          In 55 years, we've seen every real estate situation imaginable. Give us the details and our team will respond with a clear, actionable resolution — no sales pitch.
        </p>
      </div>

      {/* Form */}
      <div className="flex justify-center px-6 pb-20">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">

          {/* Situation Type */}
          <div className="rounded-2xl px-6 py-7"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>
              WHAT BEST DESCRIBES YOUR SITUATION?
            </p>
            <div className="space-y-2">
              {SITUATION_TYPES.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, situation_type: s })}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: form.situation_type === s ? 'rgba(212,175,55,0.15)' : '#1a1a1a',
                    border: form.situation_type === s ? `1.5px solid ${GOLD}` : '1.5px solid rgba(255,255,255,0.08)',
                    color: form.situation_type === s ? GOLD : 'rgba(255,255,255,0.8)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Story */}
          <div className="rounded-2xl px-6 py-7"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>
              TELL US YOUR STORY *
            </p>
            <textarea
              required
              value={form.story}
              onChange={e => setForm({ ...form, story: e.target.value })}
              rows={7}
              placeholder="Give us as much detail as you'd like. Where are you moving from and to? What's the challenge? What's at stake? The more we know, the better we can help."
              className="w-full px-4 py-4 rounded-xl text-sm text-white outline-none resize-none leading-relaxed"
              style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Georgia, serif',
                caretColor: GOLD
              }}
            />
          </div>

          {/* Contact Info */}
          <div className="rounded-2xl px-6 py-7 space-y-4"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>
              We will need your contact info so we can get solutions back to you ASAP
            </p>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', caretColor: GOLD }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', caretColor: GOLD }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(858) 555-0000"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', caretColor: GOLD }}
                />
              </div>
            </div>

            {/* Free subscribe opt-in */}
            <label className="flex items-start gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all"
              style={{
                background: form.subscribe ? 'rgba(212,175,55,0.12)' : '#1a1a1a',
                border: form.subscribe ? `1.5px solid ${GOLD}` : '1.5px solid rgba(255,255,255,0.1)',
              }}>
              <input
                type="checkbox"
                checked={form.subscribe}
                onChange={e => setForm({ ...form, subscribe: e.target.checked })}
                className="mt-0.5 w-4 h-4 shrink-0 accent-[#D4AF37]"
              />
              <span>
                <span className="block text-sm font-bold" style={{ color: form.subscribe ? GOLD : '#fff' }}>
                  Yes — subscribe me for FREE
                </span>
                <span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Get the Dyson News Network morning brief, real estate alerts, and solutions delivered at 6 AM. No cost, unsubscribe anytime.
                </span>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl font-black text-base tracking-wider flex items-center justify-center gap-3 transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}
          >
            {loading ? 'Sending Your Story...' : <>Submit My Story <ArrowRight className="w-4 h-4" /></>}
          </button>
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No sales pitch. No obligation. Just a resolution from 55 years of experience.
          </p>

        </form>
      </div>
    </div>
  );
}