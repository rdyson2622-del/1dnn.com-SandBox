import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import {
  DollarSign, Shield, Star, Clock, CheckCircle,
  ChevronDown, ChevronUp, BookOpen, Award, Search, FileCheck, UserCheck,
  Mic, Volume2
} from 'lucide-react';
import LenderDuo from '@/components/charlie/LenderDuo';

const GOLD = '#D4AF37';
const DNN_LOGO = "/assets/dyson-logo.png";

// ─── Lender vetting steps ───────────────────────────────────────────────────
const LENDER_VETTING_STEPS = [
  { icon: Search, title: 'NMLS Verification', detail: 'Every lender\'s NMLS license is verified as current and in good standing with no regulatory complaints or suspensions.' },
  { icon: FileCheck, title: 'Production Audit', detail: 'We review annual loan volume, close-time performance (target: under 30 days), and loan type depth relevant to relocation buyers.' },
  { icon: Award, title: 'Rate Competitiveness', detail: 'We benchmark their rate offerings against current market — we will not refer lenders whose pricing creates unnecessary long-term cost for our clients.' },
  { icon: UserCheck, title: 'Relocation Fit Interview', detail: 'We interview specifically for relocation scenarios: bridge loans, cross-state licensing, VA, jumbo, and speed-of-close capability.' },
  { icon: Shield, title: 'Fiduciary Agreement', detail: 'Every bureau lender signs an agreement that protects our client\'s equity position and prohibits upselling harmful loan products.' },
];

// ─── Vetting Process Component ──────────────────────────────────────────────
function VettingProcess({ steps, label, color = GOLD, fontSize = "text-xs" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#0d0d0d', border: `1px solid ${color}30` }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color }} />
          <p className={`${fontSize} font-black tracking-[0.2em] uppercase`} style={{ color }}>{label}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color }} /> : <ChevronDown className="w-4 h-4" style={{ color }} />}
      </button>
      {!open && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                <Icon className="w-3 h-3" style={{ color }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{s.title}</span>
              </div>
            );
          })}
        </div>
      )}
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: `${color}15` }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-start gap-3 pt-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="font-bold text-white mb-0.5" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', letterSpacing: '0.03em' }}>Step {i + 1}: {s.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.detail}</p>
                </div>
              </div>
            );
          })}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              "This is not a directory — it's a guarantee." — Bob Dyson
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lender Profile Card ────────────────────────────────────────────────────
function LenderCard({ name, company, nmls, email, phone, badges = [], bio, accentColor = GOLD }) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = async (e) => {
    e.stopPropagation();
    setSpeaking(true);
    await appClient.functions.invoke('charlieSpeak', { text: `${name} at ${company}. ${bio || ''}` }).catch(() => {});
    setSpeaking(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-4 px-5 py-4 text-left">
        <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center"
          style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25` }}>
          <span className="text-xl font-black" style={{ color: accentColor }}>{name?.[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-white">{name}</p>
            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Shield className="w-2.5 h-2.5" /> DNN VERIFIED
            </span>
          </div>
          {company && <p className="text-xs mt-0.5 font-semibold" style={{ color: accentColor }}>{company}</p>}
          {nmls && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>NMLS #{nmls}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleSpeak} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
            {speaking ? <Volume2 className="w-3.5 h-3.5 animate-pulse" style={{ color: '#4ade80' }} /> : <Mic className="w-3.5 h-3.5" style={{ color: accentColor }} />}
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex flex-wrap gap-2 pt-4">
            {badges.map(b => (
              <span key={b} className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}25` }}>
                <CheckCircle className="w-2.5 h-2.5" /> {b}
              </span>
            ))}
          </div>
          {bio && <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem' }}>{bio}</p>}
          <div className="flex flex-col gap-2">
            {phone && <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm font-semibold text-white hover:text-yellow-400"><DollarSign className="w-4 h-4 shrink-0" style={{ color: accentColor }} />{phone}</a>}
            {email && <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-white hover:text-yellow-400"><Shield className="w-4 h-4 shrink-0" style={{ color: accentColor }} />{email}</a>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lender Enrollment Form ────────────────────────────────────────────────
function LenderEnrollmentForm({ onRequestVetting }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    lender_name: '',
    company: '',
    email: '',
    phone: '',
    nmls_number: '',
    state: '',
    markets: '',
    loan_types: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await appClient.entities.VettedLender.create({
      ...form,
      markets: form.markets.split(',').map(m => m.trim()),
      loan_types: form.loan_types.split(',').map(t => t.trim()),
      status: 'prospect',
      featured_tier: 'bronze',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (!open) {
    return (
      <div className="space-y-3">
        <button onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all hover:opacity-80"
          style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: '#60a5fa' }} />
            <p className="text-sm font-bold text-white">Lender Enrollment — Advertising & Vetting</p>
          </div>
          <p className="text-xs" style={{ color: '#60a5fa' }}>Apply Now →</p>
        </button>

        <button onClick={onRequestVetting}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all hover:opacity-80"
          style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" style={{ color: '#D4AF37' }} />
            <p className="text-sm font-bold text-white">Request Lender Vetting for My Market</p>
          </div>
          <p className="text-xs" style={{ color: '#D4AF37' }}>Get Matched →</p>
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
        <p className="text-sm font-bold text-white mb-1">Application Submitted!</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Our vetting team will review your application and contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4" style={{ color: '#60a5fa' }} />
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: '#60a5fa' }}>Lender Enrollment Program</p>
      </div>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Join the DNN Vetted Lender Network. Get featured in our platform, white-labeled rate briefs, and qualified buyer referrals. We earn a nominal subscription fee — never a transaction kickback.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required value={form.lender_name} onChange={e => set('lender_name', e.target.value)} placeholder="Your full name"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input required value={form.company} onChange={e => set('company', e.target.value)} placeholder="Lending company / bank name"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input required value={form.nmls_number} onChange={e => set('nmls_number', e.target.value)} placeholder="NMLS License Number"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input required value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" type="email"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State of NMLS license"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input value={form.markets} onChange={e => set('markets', e.target.value)} placeholder="Markets/states (comma-separated)"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input value={form.loan_types} onChange={e => set('loan_types', e.target.value)} placeholder="Loan types (conventional, FHA, VA, jumbo, etc.)"
          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
          By applying, you agree to the DNN Lender Partnership Agreement and fiduciary standards. All applicants undergo full vetting before approval.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-xs text-white hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2 rounded-lg text-xs font-black transition-all"
            style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', color: '#fff' }}>
            {submitting ? 'Submitting...' : 'Apply to DNN Lender Network'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Pending Card ──────────────────────────────────────────────────────────
function PendingLenderCard() {
  return (
    <div className="rounded-2xl p-7 text-center space-y-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
        style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)' }}>
        <DollarSign className="w-6 h-6" style={{ color: '#60a5fa' }} />
      </div>
      <div>
        <h2 className="serif-heading text-white mb-1.5" style={{ fontSize: '1.2rem' }}>
          Your Lender Match Is Being Identified
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem' }}>
          We're identifying the best DNN-vetted lender for your destination market, loan needs, and timeline. You'll be notified when your match is confirmed.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#60a5fa' }}>
        <Clock className="w-3.5 h-3.5" />
        <span>Typically matched within 24 hours of intake</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function FinancialServices() {
  const [requestingVetting, setRequestingVetting] = useState(false);

  const { data: lenders = [] } = useQuery({
    queryKey: ['vettedLendersActive'],
    queryFn: () => appClient.entities.VettedLender.filter({ status: 'active' }, '-created_date', 50),
  });

  return (
    <div className="min-h-screen p-6 md:pr-48" style={{ background: '#ede0cc' }}>
      <LenderDuo />
      <div className="max-w-6xl mx-auto">

        {/* Tan Background Section */}
        <div className="rounded-3xl p-8 mb-8" style={{ background: '#ede0cc' }}>
          {/* Header */}
          <div className="mb-6">
            <h1 className="display-heading" style={{ fontSize: 'clamp(1rem, 2.75vw, 1.85rem)', letterSpacing: '0.12em', lineHeight: 1.1, color: '#1a1a1a' }}>
              BENEFITS OF CHOOSING A DYSON & AI VETTED LENDER
            </h1>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#4a4a4a', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem' }}>
              Every lender below has passed the Dyson & Dyson leadership team's personal 5-step vetting process. Zero shortcuts. Your referral is always free — and our deep AI vetting process increases your odds of a great lender relationship.
            </p>
          </div>

          {/* Vetted vs Unvetted Callout */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.35)' }}>
            <p className="text-base font-bold mb-3" style={{ color: '#D4AF37' }}>Why DNN Vets Every Lender</p>
            <p className="text-sm leading-relaxed mb-4 text-white">
              Most buyers shop for rates on comparison sites — that compare lenders with zero vetting. Rates are cheaper because corners are cut: slower closings, hidden costs, loan products designed to hurt you long-term. DNN's vetted lenders compete on fairness, speed, and service — not race-to-the-bottom pricing.
            </p>
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#D4AF37' }}>OUR VETTING PROTECTS YOU:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}><strong>Speed Guarantee:</strong> Target close in under 30 days. Failed timelines cost you money.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}><strong>Rate Transparency:</strong> No hidden fees. No loan products designed to hurt you. Fiduciary-aligned.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}><strong>Relocation Ready:</strong> Bridge loans, cross-state licensing, jumbo, VA — all specialties we vet for.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── LENDERS SECTION ── */}
         <div>
           <VettingProcess steps={LENDER_VETTING_STEPS} label="THE DYSON & DYSON 5-Step Lender Vetting Process" color={GOLD} fontSize="text-base" />

           {/* Pending Match Card — shown after user requests vetting */}
           {requestingVetting && (
             <div className="mb-6">
               <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
                 <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                   style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)' }}>
                   <DollarSign className="w-6 h-6" style={{ color: '#60a5fa' }} />
                 </div>
                 <div>
                   <h2 className="serif-heading text-white mb-1.5" style={{ fontSize: '1.2rem' }}>
                     Your Lender Match Is Being Identified
                   </h2>
                   <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem' }}>
                     We're identifying the best DNN-vetted lender for your destination market, loan needs, and timeline. You'll be notified when your match is confirmed.
                   </p>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#60a5fa' }}>
                   <Clock className="w-3.5 h-3.5" />
                   <span>Typically matched within 24 hours of intake</span>
                 </div>
               </div>
             </div>
           )}

           {lenders.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
                <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>The DNN Vetted Lender Network</p>
                <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
              </div>
              <div className="space-y-3">
                {lenders.map(l => (
                  <LenderCard key={l.id}
                    name={l.lender_name}
                    company={l.company}
                    nmls={l.nmls_number}
                    email={l.email}
                    phone={l.phone}
                    bio={l.bio}
                    badges={['NMLS Verified', 'Production Screened', 'Fiduciary Agreement']}
                  />
                ))}
              </div>
            </div>
          )}

          {lenders.length === 0 && (
            <PendingLenderCard />
          )}

          <div className="mt-6">
             <LenderEnrollmentForm onRequestVetting={() => setRequestingVetting(true)} />
           </div>
          </div>
          </div>

          </div>
          );
          }