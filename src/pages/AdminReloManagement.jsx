import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { MessageCircle, MapPin, UserCheck, Building2, Truck, Zap, GraduationCap, HeartPulse, CheckCircle2 } from 'lucide-react';

const GOLD = '#D4AF37';

const slides = [
  {
    id: 0,
    title: "We Don't Send You a Map.",
    subtitle: "We Make the Journey With You.",
    content: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed" style={{ color: '#fff' }}>
          We are <strong style={{ color: GOLD }}>Relocation Managers</strong>. Not Agents. Not a listing service. We help families and professionals sell their current home and find their next one, anywhere in the country. Every step is something Charlie and your Dyson team actively execute on your behalf, all the way through close of escrow and beyond.
        </p>
        <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          We intentionally work with a limited number of families at any given time. This isn't exclusivity — it's commitment. Real relocation management requires deep local focus, market expertise, timeline coordination, and relentless attention to detail. We're not scaling a service. We're delivering one.
        </p>
      </div>
    ),
    bgStyle: '#1a1a1a'
  },
  {
    id: 1,
    title: "Our Services",
    subtitle: null,
    content: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: MessageCircle, title: 'AI Concierge Chat', desc: 'Charlie is available 24/7 to answer every question' },
          { icon: MapPin, title: 'Neighborhood Research', desc: 'Deep-dive analysis of neighborhoods matching your lifestyle' },
          { icon: UserCheck, title: 'Agent Selection', desc: 'Hand-vetted candidates reviewed and personally screened' },
          { icon: Building2, title: 'Home Search Strategy', desc: 'AI-powered property matching based on your criteria' },
          { icon: Truck, title: 'Moving Coordination', desc: 'From packing to delivery — complete logistics' },
          { icon: Zap, title: 'Utilities & Services', desc: 'Internet, electric, gas, water all set up before arrival' },
          { icon: GraduationCap, title: 'School Enrollment', desc: 'District research, tours, and enrollment handled' },
          { icon: HeartPulse, title: 'Healthcare Setup', desc: 'Find top-rated doctors, dentists, specialists' },
        ].map((service, i) => (
          <div key={i} className="p-3 rounded-xl text-center text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <div className="flex justify-center mb-2">
              <service.icon className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <p className="font-bold mb-1" style={{ color: '#fff' }}>{service.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>{service.desc}</p>
          </div>
        ))}
      </div>
    ),
    bgStyle: '#2a2a2a'
  },
  {
    id: 2,
    title: "The Scope Is Real.",
    subtitle: "That's Why We Exist.",
    content: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed" style={{ color: '#fff' }}>
          Seeing the full scope of what's ahead can feel overwhelming.
        </p>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.3)' }}>
          <p className="text-xs font-bold tracking-[0.3em] mb-3" style={{ color: GOLD }}>AFTER YOU COMMIT — THE GEMINI SESSION</p>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#fff' }}>
            Once you've confirmed your contact information, we set up a private three-way live session — you, Google Gemini, and Senior Staff. This is a real conversation where we build your complete relocation profile together, in real time.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#fff' }}>
            This session is <strong>by invitation only</strong> — we're selective about who we work with. No cost to you, ever.
          </p>
        </div>
      </div>
    ),
    bgStyle: '#333'
  },
  {
    id: 3,
    title: "Experienced Experts,",
    subtitle: "Powered by AI.",
    content: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed" style={{ color: '#fff' }}>
          AI handles data aggregation, comp analysis, document generation, and 24/7 availability. Real estate experts position you to make wise judgment calls, approve major decisions, and guide you through your entire relocation.
        </p>
        <p className="text-base font-bold" style={{ color: GOLD }}>
          And it costs you absolutely nothing since we are funded by the selected Brokers and Agents.
        </p>
      </div>
    ),
    bgStyle: '#000'
  },
  {
    id: 4,
    title: "Your Agent. Your Choice.",
    subtitle: "Zero Guesswork.",
    content: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed" style={{ color: '#fff' }}>
          Most people find an agent through Zillow, a yard sign, or a friend — with no idea if they're any good. We eliminate that entirely.
        </p>
        <div className="space-y-2">
          {[
            'We profile your ideal agent before any names are shared',
            'Top 20 destination agents evaluated — production, DRE, personality',
            '3–5 personally vetted candidates presented for your review',
            'Your selection triggers immediate agent briefing & onboarding',
            'Zero cost to you as the buyer — always'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
              <span style={{ color: '#fff' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    bgStyle: '#000'
  },
  {
    id: 5,
    title: "Ready for Your",
    subtitle: "Fresh Start?",
    content: (
      <div className="space-y-4 text-center">
        <p className="text-base leading-relaxed" style={{ color: '#fff' }}>
          Talk to Charlie right now. Share where you're moving and we'll take it from there — your relocation manager, your Gemini session, your plan. No hidden fees. Always free.
        </p>
        <Link to="/RelocationIntake">
          <button className="px-8 py-4 rounded-full font-black text-base transition-all hover:opacity-90 inline-block"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            Let's Plan My Relocation Move
          </button>
        </Link>
      </div>
    ),
    bgStyle: '#1a1a1a'
  },
  {
    id: 6,
    title: "The Dyson & Dyson Promise",
    subtitle: "Licensed Relocation Services",
    content: (
      <div className="space-y-3 text-center">
        <p className="text-sm" style={{ color: '#fff' }}>The Dyson & Dyson Companies, Inc.</p>
        <p className="text-sm font-bold" style={{ color: GOLD }}>California Department of Real Estate #02303118</p>
        <p className="text-base" style={{ color: '#fff' }}>Concierge Relocation Program • Free to Buyers</p>
        <p className="text-base font-bold" style={{ color: GOLD }}>(858) 353-1200</p>
        <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>55 years of relocation management expertise.</p>
      </div>
    ),
    bgStyle: '#111'
  }
];

export default function AdminReloManagement() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { dismiss } = useToast();
  useEffect(() => { dismiss(); }, []);
  const slide = slides[currentSlide];

  return (
    <div className="p-6 h-full">
      <div className="flex gap-6 h-[calc(100vh-120px)] rounded-2xl overflow-hidden"
        style={{ background: '#000', border: '1px solid rgba(212,175,55,0.2)' }}>

        {/* Slide Nav Sidebar */}
        <div className="w-52 shrink-0 flex flex-col border-r"
          style={{ borderColor: 'rgba(212,175,55,0.15)', background: '#0d0d0d' }}>

          {/* Header */}
          <div className="px-4 py-5 border-b" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-0.5" style={{ color: GOLD }}>RELOCATION</p>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>MANAGEMENT</p>
            <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Explainer & Client Overview</p>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                style={{
                  background: currentSlide === idx ? GOLD : 'rgba(255,255,255,0.04)',
                  color: currentSlide === idx ? '#000' : '#fff',
                  border: currentSlide === idx ? 'none' : '1px solid rgba(212,175,55,0.2)',
                }}>
                <p className="font-bold leading-tight text-[11px]">{s.title}</p>
                {s.subtitle && (
                  <p className="opacity-70 mt-0.5 text-[9px]">{s.subtitle}</p>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-3 border-t text-center text-[10px]"
            style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
            {currentSlide + 1} of {slides.length}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-10 py-12 text-center"
          style={{ background: slide.bgStyle, transition: 'background 0.3s ease' }}>

          {/* Title */}
          <div className="mb-8">
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, color: '#fff', lineHeight: 1.15, marginBottom: '0.5rem' }}>
              {slide.title}
            </h1>
            {slide.subtitle && (
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, color: GOLD, lineHeight: 1.15 }}>
                {slide.subtitle}
              </h2>
            )}
          </div>

          {/* Content */}
          <div className="w-full max-w-2xl text-left" style={{ fontSize: '13px', lineHeight: 1.7 }}>
            {slide.content}
          </div>
        </div>
      </div>
    </div>
  );
}