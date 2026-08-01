import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import {
  Shield, Phone, Mail, MapPin, Star, Clock, CheckCircle, Globe,
  ChevronRight, ChevronDown, ChevronUp, BookOpen, Award, Search,
  FileCheck, UserCheck, Mic, Volume2, DollarSign,
  XCircle, Video, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import VettedAgentDuo from '@/components/charlie/VettedAgentDuo';

const GOLD = '#D4AF37';
const DNN_LOGO = "/assets/dyson-logo.png";

// ─── Charlie speak ──────────────────────────────────────────────────────────
async function speakText(text) {
  try {
    const res = await appClient.functions.invoke('charlieSpeak', { text });
    if (res?.data?.audio_url) new Audio(res.data.audio_url).play();
  } catch {}
}

// ─── Vetted vs Unvetted Comparison ──────────────────────────────────────────
function VettedVsUnvetted() {
  const [open, setOpen] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const pitch = `Here's what most people don't realize. When you search for an agent on Zillow or Google, you're looking at a paid directory. Anyone who pays $300 a month gets listed. There is zero vetting. No license check. No production review. No personality screening. The DNN Agent Bureau is fundamentally different. Every single agent has been personally reviewed by Bob Dyson — 54 years in the business. DRE verified. Production screened. Personally interviewed. The data is clear: buyers working with a truly vetted, buyer-aligned agent close successfully at a far higher rate, with fewer surprises, fewer failed escrows, and more money in their pocket.`;

  const handleSpeak = async (e) => {
    e.stopPropagation();
    setSpeaking(true);
    await speakText(pitch);
    setSpeaking(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden mb-5" style={{ background: 'linear-gradient(135deg, #0d0d0d, #111)', border: '1px solid rgba(212,175,55,0.25)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full px-5 py-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: GOLD }} />
          <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>Vetted vs. Unvetted — Why It Matters</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSpeak}
            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(212,175,55,0.1)', color: speaking ? '#4ade80' : GOLD, border: '1px solid rgba(212,175,55,0.2)' }}>
            {speaking ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Mic className="w-3 h-3" />}
            {speaking ? 'Speaking...' : 'Hear This'}
          </button>
          {open ? <ChevronUp className="w-4 h-4" style={{ color: GOLD }} /> : <ChevronDown className="w-4 h-4" style={{ color: GOLD }} />}
        </div>
      </button>

      {/* Always-visible teaser stat */}
      {!open && (
        <div className="px-5 pb-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
            <span className="text-xs text-white font-semibold">DNN Bureau agents: <strong className="text-green-400">~91% successful close rate</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-white font-semibold">Unvetted directory agents: <strong className="text-red-400">~67% successful close rate</strong></span>
          </div>
        </div>
      )}

      {open && (
        <div className="px-5 pb-5 border-t space-y-5" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
          {/* Side by side */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-red-400">Unvetted Directory Agent</p>
              {[
                'Paid placement — no screening',
                'License status unknown',
                'No production minimum',
                'No personality fit check',
                'Incentivized by their own commission',
                '~67% clean close rate',
                'Failed escrows cost you time & money',
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{item}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-green-400">DNN Bureau Agent</p>
              {[
                'Personally reviewed by Bob Dyson',
                'DRE license verified & current',
                '12+ closings/yr minimum',
                'Personality & communication screened',
                'Bureau Agreement protects YOUR interests',
                '~91% clean close rate',
                'Always free to buyers',
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The math */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: GOLD }}>The Real Cost of a Bad Agent Match</p>
            <p className="leading-relaxed" style={{ color: '#fff', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic' }}>
              A failed escrow on a $600,000 home costs an average of $4,200 in lost inspection fees, appraisal costs, and moving expenses — plus 45–90 days of your life. A misaligned lender can cost you $800–$2,400 more per year in unnecessary rate premium. The DNN Bureau exists to eliminate both risks, at zero cost to you.
            </p>
          </div>

          <p className="italic text-center" style={{ color: '#fff', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem' }}>
            "I've seen what happens when buyers get matched with the wrong agent. That's exactly why I built this bureau." — Bob Dyson, 55 years industry experience
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Vetting Process (agents) ────────────────────────────────────────────────
const AGENT_VETTING_STEPS = [
  { icon: Search, title: 'Market Research', detail: 'We identify the top 20 active agents in your destination market by production volume, DOM performance, and neighborhood specialization.' },
  { icon: FileCheck, title: 'DRE Verification', detail: 'Every agent\'s DRE license is verified as current, in good standing, and free of disciplinary actions.' },
  { icon: Award, title: 'Production Screening', detail: 'Minimum 12 closings/yr, buyer-side experience verified, price point alignment to your budget confirmed.' },
  { icon: UserCheck, title: 'Personality Interview', detail: 'Bob Dyson\'s team conducts a direct interview. Communication style, responsiveness, and cultural fit evaluated personally — not by algorithm.' },
  { icon: Shield, title: 'Bureau Agreement', detail: 'Every agent signs our Bureau Partnership Agreement — protecting your referral and ensuring they receive no fee until you close.' },
];

const LENDER_VETTING_STEPS = [
  { icon: Search, title: 'NMLS Verification', detail: 'Every lender\'s NMLS license is verified as current and in good standing with no regulatory complaints or suspensions.' },
  { icon: FileCheck, title: 'Production Audit', detail: 'We review annual loan volume, close-time performance (target: under 30 days), and loan type depth relevant to relocation buyers.' },
  { icon: Award, title: 'Rate Competitiveness', detail: 'We benchmark their rate offerings against current market — we will not refer lenders whose pricing creates unnecessary long-term cost for our clients.' },
  { icon: UserCheck, title: 'Relocation Fit Interview', detail: 'We interview specifically for relocation scenarios: bridge loans, cross-state licensing, VA, jumbo, and speed-of-close capability.' },
  { icon: Shield, title: 'Fiduciary Agreement', detail: 'Every bureau lender signs an agreement that protects our client\'s equity position and prohibits upselling harmful loan products.' },
];

function VettingProcess({ steps, label, color = GOLD, fontSize = "text-xs" }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#0d0d0d', border: `1px solid ${color}30` }}>
      <div className="w-full flex items-center px-5 py-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" style={{ color }} />
          <p className={`${fontSize} font-black tracking-[0.2em] uppercase`} style={{ color, fontSize: '1.1rem' }}>{label}</p>
        </div>
      </div>
      <div className="px-5 pb-6 space-y-4 border-t" style={{ borderColor: `${color}15` }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-start gap-4 pt-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div>
                <p className="font-bold text-white mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', letterSpacing: '0.03em' }}>Step {i + 1}: {s.title}</p>
                <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem' }}>{s.detail}</p>
              </div>
            </div>
          );
        })}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="italic leading-relaxed" style={{ color: GOLD, fontSize: '1.575rem' }}>
            "This is not a directory — it's a guarantee." — Bob Dyson
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Card (agent or lender) ─────────────────────────────────────────
function ProfileCard({ name, subtitle, badge, markets, phone, email, bio, photo, accentColor = GOLD, badgeLabel = 'DNN VERIFIED', badges = [], sealText, dre, type = 'agent' }) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = async (e) => {
    e.stopPropagation();
    setSpeaking(true);
    await speakText(`${name}${subtitle ? `, with ${subtitle}.` : '.'} ${bio || ''}`);
    setSpeaking(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-4 px-5 py-4 text-left">
        <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25` }}>
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" />
            : <span className="text-xl font-black" style={{ color: accentColor }}>{name?.[0]}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-white">{name}</p>
            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Shield className="w-2.5 h-2.5" /> {badgeLabel}
            </span>
          </div>
          {subtitle && <p className="text-xs mt-0.5 font-semibold" style={{ color: accentColor }}>{subtitle}</p>}
          {markets?.length > 0 && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <MapPin className="w-3 h-3 inline mr-1" />{markets.join(', ')}
            </p>
          )}
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
          {dre && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}><FileCheck className="w-3.5 h-3.5 inline mr-1" style={{ color: accentColor }} />{dre}</p>}
          {bio && <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem' }}>{bio}</p>}
          <div className="flex flex-col gap-2">
            {phone && <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm font-semibold text-white hover:text-yellow-400"><Phone className="w-4 h-4 shrink-0" style={{ color: accentColor }} />{phone}</a>}
            {email && <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-white hover:text-yellow-400"><Mail className="w-4 h-4 shrink-0" style={{ color: accentColor }} />{email}</a>}
          </div>
          {sealText && (
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: `${accentColor}07`, border: `1px solid ${accentColor}18` }}>
              <img src={DNN_LOGO} alt="DNN" className="h-4 w-auto opacity-50 mt-0.5 shrink-0" />
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{sealText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pending card ─────────────────────────────────────────────────────────────
function PendingCard({ type }) {
  const isLender = type === 'lender';
  return (
    <div className="rounded-2xl p-7 text-center space-y-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
        style={{ background: isLender ? 'rgba(96,165,250,0.1)' : 'rgba(212,175,55,0.1)', border: `1px solid ${isLender ? 'rgba(96,165,250,0.25)' : 'rgba(212,175,55,0.25)'}` }}>
        {isLender ? <DollarSign className="w-6 h-6" style={{ color: '#60a5fa' }} /> : <Star className="w-6 h-6" style={{ color: GOLD }} />}
      </div>
      <div>
        <h2 className="serif-heading text-white mb-1.5" style={{ fontSize: '1.2rem' }}>
          {isLender ? 'Your Lender Match Is Being Identified' : 'Your Agent Match Is Pending'}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem' }}>
          {isLender
            ? 'We\'re identifying the best DNN-vetted lender for your destination market, loan needs, and timeline. You\'ll be notified when your match is confirmed.'
            : 'Your concierge is identifying your ideal vetted agent based on your destination market, priorities, and personality fit. Typically confirmed within 24 hours.'}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs" style={{ color: isLender ? '#60a5fa' : GOLD }}>
        <Clock className="w-3.5 h-3.5" />
        <span>Typically matched within 24 hours of intake</span>
      </div>
      <Link to="/chat"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
        style={{ background: isLender ? 'linear-gradient(135deg,#60a5fa,#3b82f6)' : `linear-gradient(135deg, #e8c84a, ${GOLD})` }}>
        Ask Charlie for an Update <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Story Submission Form ────────────────────────────────────────────────────
function StorySubmitForm({ submitterType }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ story_title: '', story_body: '', client_first_name: '', origin_city: '', destination_city: '', outcome: '', video_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await appClient.entities.BureauStory.create({
      ...form,
      submitter_type: submitterType,
      submitter_name: 'Bureau Member',
      status: 'submitted',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all hover:opacity-80"
        style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4" style={{ color: '#818cf8' }} />
          <p className="text-base font-bold text-white" style={{ fontSize: '1.75rem' }}>Share a Client Success Story</p>
        </div>
        <p className="text-xs" style={{ color: '#818cf8' }}>Submit for DNN Campaign →</p>
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
        <p className="text-sm font-bold text-white mb-1">Story Submitted!</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Our editorial team will review and white-label your story for the DNN campaign. You'll be credited as a DNN Bureau partner.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <div className="flex items-center gap-2 mb-4">
         <Video className="w-4 h-4" style={{ color: '#fff' }} />
         <p className="text-sm font-black tracking-widest uppercase" style={{ color: '#fff' }}>Share a Client Success Story</p>
       </div>
       <p className="text-sm leading-relaxed mb-4" style={{ color: '#fff' }}>
         We white-label your stories and publish them as DNN Bureau case studies — protecting client privacy while amplifying your expertise. Stories may also be selected for our video campaign series.
       </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required value={form.story_title} onChange={e => set('story_title', e.target.value)} placeholder="Story headline (e.g. 'From Austin to San Diego in 22 Days')"
          className="w-full px-3 py-2 rounded-lg text-base text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <textarea required value={form.story_body} onChange={e => set('story_body', e.target.value)} rows={4}
          placeholder="Tell the full story — the challenge, how you helped, the timeline, and the outcome..."
          className="w-full px-3 py-2 rounded-lg text-base text-white focus:outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.client_first_name} onChange={e => set('client_first_name', e.target.value)} placeholder="Client first name (optional)"
            className="px-3 py-2 rounded-lg text-base text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <input value={form.outcome} onChange={e => set('outcome', e.target.value)} placeholder="Key outcome (e.g. closed in 18 days)"
            className="px-3 py-2 rounded-lg text-base text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <input value={form.origin_city} onChange={e => set('origin_city', e.target.value)} placeholder="Moved from..."
            className="px-3 py-2 rounded-lg text-base text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <input value={form.destination_city} onChange={e => set('destination_city', e.target.value)} placeholder="Moved to..."
            className="px-3 py-2 rounded-lg text-base text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <input value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="Video link (Loom, YouTube) — optional"
          className="w-full px-3 py-2 rounded-lg text-base text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#fff' }}>
          Your story will be reviewed and white-labeled by our editorial team. Client names are protected. You're credited as a DNN Bureau partner. Video submissions may be selected for the DNN Solve My Story campaign.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-white hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2 rounded-lg text-sm font-black transition-all"
            style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', color: '#fff' }}>
            {submitting ? 'Submitting...' : 'Submit Story for DNN Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}



// ─── Charlie teaser ───────────────────────────────────────────────────────────
function CharlieTeaser() {
  return (
    <div className="rounded-xl p-4 mt-5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <Globe className="w-4 h-4" style={{ color: '#818cf8' }} />
        </div>
        <div className="flex-1">
          <p className="serif-heading mb-1" style={{ fontSize: '2.25rem', color: GOLD }}>Have questions about your matches?</p>
          <p className="leading-relaxed mb-3" style={{ color: '#ffffff', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.65rem' }}>
            Charlie can explain the vetting process, help you prepare questions for your first agent or lender call, and walk you through what to expect in your relocation timeline.
          </p>
          <Link to="/chat"
            className="inline-flex items-center gap-1.5 font-bold px-4 py-2 rounded-lg"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', fontSize: '1.05rem' }}>
            Chat with Charlie <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyAgent() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => appClient.auth.me() });

  const { data: clients = [] } = useQuery({
    queryKey: ['myClientRecord', user?.email],
    queryFn: () => appClient.entities.RelocationClient.filter({ email: user.email }, '-created_date', 1),
    enabled: !!user?.email,
  });
  const client = clients[0];

  const { data: agents = [] } = useQuery({
    queryKey: ['partnerAgentsActive'],
    queryFn: () => appClient.entities.PartnerAgent.filter({ status: 'active' }, '-created_date', 50),
  });

  const myAgent = agents.find(a => a.agent_name === client?.agent_name || a.email === client?.assigned_agent);
  const bureauAgents = agents.filter(a => !myAgent || a.id !== myAgent.id);

  return (
    <div className="min-h-screen p-6 md:pr-48" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">

        {/* Tan Background Section */}
        <div className="rounded-3xl p-8 mb-8" style={{ background: '#ede0cc' }}>
          {/* Header */}
          <div className="mb-6">
            <h1 className="display-heading" style={{ fontSize: 'clamp(1rem, 2.75vw, 1.85rem)', letterSpacing: '0.12em', lineHeight: 1.1, color: '#1a1a1a' }}>
              BENEFITS OF CHOOSING A DYSON & AI VETTED AGENT
            </h1>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#4a4a4a', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem' }}>
              Every agent below has passed the Dyson & Dyson leadership team's personal 5-step vetting process. Zero shortcuts. Your referral is always free — and our deep AI vetting process increases your odds of a great agent relationship.
            </p>
          </div>

          {/* Vetted vs Unvetted — the pitch */}
          <VettedVsUnvetted />
        </div>

         {/* ── AGENTS SECTION ── */}
         <div>
            <VettingProcess steps={AGENT_VETTING_STEPS} label="THE DYSON & DYSON 5-Step Agent Vetting Process" color={GOLD} fontSize="text-base" />

            {myAgent && (
              <>
                <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: GOLD }}>Your Assigned DNN Bureau Agent</p>
                  <p className="serif-heading text-white" style={{ fontSize: '1.2rem' }}>{myAgent.co_brand_label || myAgent.agent_name}</p>
                </div>
                <ProfileCard
                  name={myAgent.agent_name} subtitle={myAgent.brokerage}
                  markets={myAgent.markets} phone={myAgent.phone} email={myAgent.email}
                  bio={myAgent.notes} photo={myAgent.photo_url} dre={myAgent.dre_number ? `DRE #${myAgent.dre_number} · ${myAgent.state}` : null}
                  badges={['DRE Verified', '12+ Closings/yr', 'Personally Interviewed', 'Bureau Agreement Signed']}
                  sealText="This agent has been personally reviewed, license-verified, and accepted into the DNN Bureau. Your referral is protected. This service is always free to buyers."
                />
              </>
            )}

            {bureauAgents.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>The DNN Agent Bureau</p>
                  <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.15)' }} />
                </div>
                <div className="space-y-3">
                  {bureauAgents.map(a => (
                    <ProfileCard key={a.id}
                      name={a.agent_name} subtitle={a.brokerage} markets={a.markets}
                      phone={a.phone} email={a.email} bio={a.notes} photo={a.photo_url}
                      dre={a.dre_number ? `DRE #${a.dre_number} · ${a.state}` : null}
                      badges={['DRE Verified', '12+ Closings/yr', 'Bureau Agreement Signed']}
                      sealText="DNN Bureau Partner — personally reviewed by Bob Dyson."
                    />
                  ))}
                </div>
              </div>
            )}

            </div>

        <CharlieTeaser />

      </div>

      {/* Charlie & Bob duo presenter — vetting philosophy + commission model */}
      <VettedAgentDuo />
    </div>
  );
}