import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, MapPin, Users, Sparkles, Shield, Zap, Clock } from 'lucide-react';
import { appClient } from '@/api/appClient';
import IntroCallScheduler from '@/components/intake/IntroCallScheduler';
import RelocationRoadmap from '@/components/intake/RelocationRoadmap';

const SERVICE_AGREEMENTS = [
  'I understand this service is completely FREE to me as the buyer — agent compensation is handled separately.',
  'I agree to work exclusively with a Dyson & Dyson referred agent for my destination purchase.',
  'I consent to this conversation being recorded and summarized to build my relocation profile.',
  'I understand my profile will be reviewed by Dyson & Dyson staff to match me with the right agent.',
  'I agree that all official transaction communications will flow through the Dyson platform.',
];

const GOLD = '#D4AF37';
const DYSON_LOGO = "/assets/dyson-logo.png";

const BUDGET_OPTIONS = [
  { value: 'under_200k', label: 'Under $200K' },
  { value: '200k_400k', label: '$200K – $400K' },
  { value: '400k_600k', label: '$400K – $600K' },
  { value: '600k_800k', label: '$600K – $800K' },
  { value: '800k_1m', label: '$800K – $1M' },
  { value: 'over_1m', label: 'Over $1M' },
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1_3_months', label: '1–3 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: '6_12_months', label: '6–12 months' },
  { value: 'over_1_year', label: 'Over a year' },
  { value: 'just_exploring', label: 'Just exploring for now' },
];

const PRIORITY_OPTIONS = [
  'Schools', 'Commute', 'Walkability', 'Safety', 'Nature',
  'Healthcare', 'Religious Community', 'Nightlife', 'Shopping', 'Dining',
];

const STEPS = ['Your Info', 'Your Move', 'Priorities', 'Confirm', 'Phase 2: Agent Match', 'Phase 3: Property Search', 'Phase 4: Community Research', 'Phase 5: Due Diligence'];

const PHASE_STEPS = [
  { num: '2', title: 'Agent Match', desc: 'Your vetted local expert, hand-picked.' },
  { num: '3', title: 'Property Search & Selection', desc: 'AI-powered matching to your exact criteria.' },
  { num: '4', title: 'Community & Neighborhood Research', desc: 'Zeroing in on the right neighborhoods.' },
  { num: '5', title: 'Environmental & Property Due Diligence', desc: 'Know exactly what you\'re buying.' },
];

export default function RelocationIntake() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const clientName = searchParams.get('name');
  const destination = searchParams.get('destination');
  const openBookingCalendar = searchParams.get('book') === '1';
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showScheduler, setShowScheduler] = useState(openBookingCalendar);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreedItems, setAgreedItems] = useState([]);
  const [signTiming, setSignTiming] = useState(null); // 'now' or 'after'
  const [scheduledCall, setScheduledCall] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_city: '',
    destination_city: '',
    move_date: '',
    budget: '',
    family_size: '',
    priorities: [],
    notes: '',
    agent_preferences: '',
    property_preferences: '',
    neighborhood_notes: '',
    due_diligence_notes: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const togglePriority = (p) => {
    setForm(f => ({
      ...f,
      priorities: f.priorities.includes(p)
        ? f.priorities.filter(x => x !== p)
        : [...f.priorities, p],
    }));
  };

  const canNext = () => {
    if (step === 0) return form.full_name.trim() && form.email.trim();
    if (step === 1) return form.destination_city.trim() && form.budget && form.move_date;
    return true;
  };

  const toggleAgreement = (item) => {
    setAgreedItems(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const allAgreed = agreedItems.length === SERVICE_AGREEMENTS.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await appClient.functions.invoke('submitRelocationIntake', {
        form,
        scheduled_call: scheduledCall,
        sign_timing: signTiming || 'now',
      });
      const result = response?.data ?? response;
      if (!result?.success) throw new Error(result?.error || 'The agreement could not be saved.');

      setSubmitting(false);
      navigate('/RelocationRoadmap?name=' + encodeURIComponent(form.full_name) + '&destination=' + encodeURIComponent(form.destination_city));
    } catch (e) {
      console.error('Intake submit error:', e);
      setSubmitting(false);
      setSubmitError('We could not save your agreement. Please try again or call Bob at (858) 353-1200.');
    }
  };



  if (showAgreement && !signTiming) {
    return (
      <div className="min-h-screen" style={{ background: '#ede0cc' }}>
        <nav className="flex items-center justify-between px-6 md:px-14 py-4" style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <Link to="/Home">
            <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto" />
          </Link>
          <button onClick={() => { setShowAgreement(false); setShowScheduler(true); setAgreedItems([]); }} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2" style={{ color: GOLD }}>
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold tracking-[0.3em]">BEFORE WE BEGIN</span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              You have two options — sign now and keep the momentum going, or sign after our call when you've had a chance to chat with the Dyson team. Both are totally fine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.button
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             onClick={() => setSignTiming('now')}
             className="rounded-2xl p-6 border-2 transition-all text-left"
             style={{ background: '#1a1a1a', borderColor: GOLD }}>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5" style={{ color: GOLD }} />
                <span className="font-bold" style={{ color: GOLD }}>Sign Now</span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Review and sign the agreement right now. You'll be all set before we talk.
              </p>
            </motion.button>

            <motion.button
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             onClick={() => setSignTiming('after')}
             className="rounded-2xl p-6 border-2 transition-all text-left hover:border-slate-500"
             style={{ background: '#1a1a1a', borderColor: 'rgba(0,0,0,0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                <span className="font-bold" style={{ color: '#fff' }}>Sign After Our Call</span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                We'll send it to you after we chat — gives you time to process everything.
              </p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (showAgreement && signTiming === 'after') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: '#ede0cc' }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(212,175,55,0.15)', border: `2px solid ${GOLD}` }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: GOLD }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#1a1a1a' }}>You're All Set!</h2>
          <p className="mb-4" style={{ color: '#1a1a1a' }}>
            We'll send you the service agreement and a thank you message after your call. For now, head to your roadmap to get started.
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-full text-sm font-bold tracking-wide gold-btn disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Continue to My Roadmap'}
          </button>
        </div>
      </motion.div>
    );
  }

  if (showAgreement && signTiming === 'now') {
    return (
      <div className="min-h-screen" style={{ background: '#ede0cc' }}>
        <nav className="flex items-center justify-between px-6 md:px-14 py-4" style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <Link to="/Home">
            <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto" />
          </Link>
          <button onClick={() => { setSignTiming(null); setAgreedItems([]); }} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2" style={{ color: GOLD }}>
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold tracking-[0.3em]">BEFORE WE BEGIN</span>
            </div>
            <p className="text-sm" style={{ color: '#1a1a1a' }}>
              Sign now and you're locked in. We'll have everything ready for your call.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-8"
            style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6" style={{ color: GOLD }} />
              <h2 className="text-2xl font-bold text-white">Service Agreement</h2>
            </div>
            <p className="text-sm mb-6 text-white">Please check each item to confirm you understand</p>

            <div className="space-y-3 mb-8">
              {SERVICE_AGREEMENTS.map((item, i) => {
                const checked = agreedItems.includes(item);
                return (
                  <button
                    key={i}
                    onClick={() => toggleAgreement(item)}
                    className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                    style={{
                      background: checked ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${checked ? GOLD : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
                      style={{
                        background: checked ? GOLD : 'transparent',
                        border: `2px solid ${checked ? GOLD : 'rgba(255,255,255,0.3)'}`,
                      }}>
                      {checked && <CheckCircle2 className="w-3 h-3" style={{ color: '#000' }} />}
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: checked ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!allAgreed || submitting}
              className="w-full py-4 rounded-xl text-base font-bold tracking-wider flex items-center justify-center gap-2 transition-all"
              style={{
                background: allAgreed ? 'linear-gradient(135deg, #e8c84a 0%, #D4AF37 50%, #b8920a 100%)' : 'rgba(255,255,255,0.08)',
                color: allAgreed ? '#000' : 'rgba(255,255,255,0.3)',
                cursor: allAgreed ? 'pointer' : 'not-allowed',
                border: allAgreed ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {submitting ? 'Processing...' : allAgreed ? 'I Agree — Start My Session' : `Check all ${SERVICE_AGREEMENTS.length - agreedItems.length} remaining items`}
              {allAgreed && <Zap className="w-4 h-4" />}
            </button>

            {submitError && (
              <p role="alert" className="text-sm text-center mt-4" style={{ color: '#fca5a5' }}>
                {submitError}
              </p>
            )}

            <p className="text-xs text-center mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              By proceeding you agree to Dyson & Dyson's terms of service and privacy policy.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showScheduler && !showAgreement) {
    return (
      <div className="min-h-screen" style={{ background: '#ede0cc' }}>
        <nav className="flex items-center justify-between px-6 md:px-14 py-4" style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <Link to="/Home"><img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto" /></Link>
          <button onClick={() => setShowScheduler(false)} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <p className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: GOLD }}>ALMOST THERE</p>
            <h1 className="display-heading mb-2" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', letterSpacing: '0.18em', color: '#1a1a1a' }}>
              Meet Us Before You Commit
            </h1>
            <p className="text-sm" style={{ color: '#1a1a1a' }}>
              Schedule a quick 15-minute intro call so you can put a real voice to the name.
            </p>
          </motion.div>
          <IntroCallScheduler
            form={form}
            standalone={openBookingCalendar}
            onBack={() => setShowScheduler(false)}
            onScheduled={(callInfo) => {
              setScheduledCall(callInfo);
              setShowScheduler(false);
              setShowAgreement(true);
            }}
          />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div>
        <nav className="flex items-center justify-between px-6 md:px-14 py-4 sticky top-0 z-50" style={{ background: '#000', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <Link to="/Home"><img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto" /></Link>
          <Link to="/Home" className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </nav>
        <RelocationRoadmap clientName={form.full_name} destinationCity={form.destination_city} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-14 py-4" style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <Link to="/Home">
          <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-10 w-auto" />
        </Link>
        <Link to="/Home" className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
         <p className="text-xs font-bold tracking-[0.3em] mb-3" style={{ color: GOLD }}>DYSON & DYSON CONCIERGE</p>
         <h1 className="display-heading mb-3" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', letterSpacing: '0.18em', color: '#1a1a1a' }}>
           Let's Plan Your Move
         </h1>
         <p className="text-sm" style={{ color: '#1a1a1a', fontSize: '1.12rem' }}>
           In order for our AI and Human teams to provide a deep learning model for you, we first need to understand your objectives in all areas of your residential relocation. Please tell us about your plans to move and we'll build your personalized plan — completely free.
         </p>
          <p className="text-sm mt-4" style={{ color: '#D4AF37', fontSize: '1.05rem', fontStyle: 'italic' }}>
            Our Best Practices seems like we are actually moving with you and ahead of you every step of the way, all the way through close of escrow and beyond.
          </p>
          </motion.div>

        {/* Insulation Factor — shown before form */}
        <div className="rounded-2xl p-6 mb-10" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.35)' }}>
          <p className="text-base font-bold mb-3" style={{ color: '#D4AF37' }}>Why We Hand-Select Your Local Team</p>
          <p className="text-sm leading-relaxed mb-4 text-white">
            We know that not every real estate experience has been a great one. Too often, buyers find themselves working with an agent who is more focused on closing a deal than truly understanding their needs. At Dyson & Dyson, we do things differently because we know that you need highly educated "boots on the ground" in your intended market.
          </p>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#D4AF37' }}>TO ENSURE YOU HAVE THE ELITE REPRESENTATION YOU DESERVE:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold shrink-0" style={{ color: '#D4AF37' }}>Personal Evaluation:</span>
              <span className="text-sm leading-relaxed text-white">Our Relocation specialists and AI Assistants collect & evaluate every agent in our network — reviewing their DRE license history, production records, and professional reputation.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold shrink-0" style={{ color: '#D4AF37' }}>Strategic Intelligence:</span>
              <span className="text-sm leading-relaxed text-white">We select candidates based on their deep-rooted local knowledge and their ability to act as your eyes and ears before you even arrive.</span>
              </div>
              <div className="flex items-start gap-3">
              <span className="text-sm font-bold shrink-0" style={{ color: '#D4AF37' }}>A Protective Shield:</span>
              <span className="text-sm leading-relaxed text-white">You will never be handed off to an unvetted stranger. Every agent we recommend has been screened and approved to insulate you from the "typical" industry experience.</span>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: i <= step ? GOLD : 'rgba(255,255,255,0.1)',
                    color: i <= step ? '#000' : 'rgba(255,255,255,0.4)',
                  }}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-sm hidden sm:block" style={{ color: i === step ? GOLD : 'rgba(255,255,255,0.4)' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mb-5" style={{ background: i < step ? GOLD : 'rgba(255,255,255,0.15)', maxWidth: '60px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
         key={step}
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.25 }}
         className="rounded-2xl p-8"
         style={{ background: '#1a1a1a', border: `1px solid rgba(212,175,55,0.25)` }}
        >
          {/* STEP 0 — Your Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>About You</h2>
              </div>
              <Field label="Full Name *" value={form.full_name} onChange={v => set('full_name', v)} placeholder="Jane Smith" />
              <Field label="Email Address *" value={form.email} onChange={v => set('email', v)} placeholder="jane@email.com" type="email" />
              <Field label="Phone Number" value={form.phone} onChange={v => set('phone', v)} placeholder="(555) 123-4567" type="tel" />
              <Field label="Current City" value={form.current_city} onChange={v => set('current_city', v)} placeholder="San Diego, CA" />
              <Field label="Family Size" value={form.family_size} onChange={v => set('family_size', v)} placeholder="e.g. 4" type="number" />
            </div>
          )}

          {/* STEP 1 — Your Move */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>Your Relocation</h2>
              </div>
              <Field label="Destination City *" value={form.destination_city} onChange={v => set('destination_city', v)} placeholder="Austin, TX" />

              <div>
                <label className="block text-sm font-bold tracking-wider mb-2" style={{ color: GOLD }}>Moving Timeline *</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIMELINE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => set('move_date', opt.value)}
                      className="px-3 py-2.5 rounded-xl text-base font-medium text-left transition-all"
                      style={{
                        background: form.move_date === opt.value ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${form.move_date === opt.value ? GOLD : 'rgba(255,255,255,0.1)'}`,
                        color: form.move_date === opt.value ? GOLD : 'rgba(255,255,255,0.7)',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold tracking-wider mb-2" style={{ color: GOLD }}>Home Budget *</label>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGET_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => set('budget', opt.value)}
                      className="px-3 py-2.5 rounded-xl text-base font-medium text-left transition-all"
                      style={{
                        background: form.budget === opt.value ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${form.budget === opt.value ? GOLD : 'rgba(255,255,255,0.1)'}`,
                        color: form.budget === opt.value ? GOLD : 'rgba(255,255,255,0.7)',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Priorities */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>What Matters Most?</h2>
              </div>
              <p className="text-base mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>Select all that apply — this helps us find the right neighborhoods and agent for you.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {PRIORITY_OPTIONS.map(p => (
                  <button key={p} onClick={() => togglePriority(p)}
                    className="px-4 py-2 rounded-full text-base font-medium transition-all"
                    style={{
                      background: form.priorities.includes(p) ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${form.priorities.includes(p) ? GOLD : 'rgba(255,255,255,0.1)'}`,
                      color: form.priorities.includes(p) ? GOLD : 'rgba(255,255,255,0.6)',
                    }}>
                    {p}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold tracking-wider mb-2" style={{ color: GOLD }}>Anything Else We Should Know?</label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Special circumstances, must-haves, deal-breakers..."
                  rows={4}
                  className="w-full rounded-xl px-4 py-3 text-base resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>Confirm Your Profile</h2>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Name', value: form.full_name },
                  { label: 'Email', value: form.email },
                  { label: 'Phone', value: form.phone || '—' },
                  { label: 'Moving From', value: form.current_city || '—' },
                  { label: 'Moving To', value: form.destination_city },
                  { label: 'Timeline', value: TIMELINE_OPTIONS.find(t => t.value === form.move_date)?.label || '—' },
                  { label: 'Budget', value: BUDGET_OPTIONS.find(b => b.value === form.budget)?.label || '—' },
                  { label: 'Family Size', value: form.family_size || '—' },
                  { label: 'Priorities', value: form.priorities.join(', ') || 'None selected' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-sm font-bold tracking-wider shrink-0" style={{ color: GOLD }}>{label}</span>
                    <span className="text-base text-right" style={{ color: '#fff' }}>{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                By submitting, you agree to be contacted by the Dyson & Dyson team. This service is always free to buyers.
              </p>
            </div>
          )}

          {/* STEP 4 — Phase 2: Agent Match */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>Agent Match Preferences</h2>
              </div>

              <p className="text-base mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>Now, tell us a little about the type of agent personality that would work best for you:</p>
              <textarea value={form.agent_preferences} onChange={e => set('agent_preferences', e.target.value)} placeholder="e.g., Direct communicator, detail-oriented, patient with first-time buyers..." rows={4} className="w-full rounded-xl px-4 py-3 text-base resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>
          )}

          {/* STEP 5 — Phase 3: Property Search */}
          {step === 5 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>Property Search Criteria</h2>
              </div>
              <p className="text-base mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>Beyond budget, any specific property features or deal-breakers?</p>
              <textarea value={form.property_preferences} onChange={e => set('property_preferences', e.target.value)} placeholder="e.g., Must have updated kitchen, 3+ bedrooms, yard for dogs..." rows={4} className="w-full rounded-xl px-4 py-3 text-base resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>
          )}

          {/* STEP 6 — Phase 4: Community Research */}
          {step === 6 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>Neighborhood Research</h2>
              </div>
              <p className="text-base mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>Any neighborhoods you're already considering? Any you want to avoid?</p>
              <textarea value={form.neighborhood_notes} onChange={e => set('neighborhood_notes', e.target.value)} placeholder="e.g., Interested in suburbs near good schools, avoid downtown noise..." rows={4} className="w-full rounded-xl px-4 py-3 text-base resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>
          )}

          {/* STEP 7 — Phase 5: Due Diligence */}
          {step === 7 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5" style={{ color: GOLD }} />
                <h2 className="font-bold text-2xl" style={{ color: '#fff' }}>Due Diligence Priorities</h2>
              </div>
              <p className="text-base mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>What inspections or research are most important to you?</p>
              <textarea value={form.due_diligence_notes} onChange={e => set('due_diligence_notes', e.target.value)} placeholder="e.g., Foundation inspection, radon test, flood zone check, solar potential..." rows={4} className="w-full rounded-xl px-4 py-3 text-base resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
         <div className="flex items-center justify-between mt-6">
           {step > 0 ? (
             <button onClick={() => setStep(s => s - 1)}
               className="flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-semibold transition-all"
               style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <ArrowLeft className="w-4 h-4" /> Back
             </button>
           ) : <div />}

           {step < STEPS.length - 1 ? (
             <button
               onClick={() => setStep(s => s + 1)}
               disabled={!canNext()}
               className="gold-btn px-7 py-2.5 rounded-full text-base font-bold tracking-wide flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
               Continue <ArrowRight className="w-4 h-4" />
             </button>
           ) : (
             <button
               onClick={() => setShowScheduler(true)}
               className="gold-btn px-7 py-2.5 rounded-full text-base font-bold tracking-wide flex items-center gap-2">
               Schedule Intro Call <ArrowRight className="w-4 h-4" />
             </button>
           )}
         </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-bold tracking-wider mb-1.5" style={{ color: '#D4AF37' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-base"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
      />
    </div>
  );
}
