import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, DollarSign, ShieldCheck, Handshake, ArrowRight, MessageCircle, Newspaper } from 'lucide-react';
import CorporateReloQASection from '@/components/corporate/CorporateReloQASection';
import PortalLeadInDuo from '@/components/portal/PortalLeadInDuo';
import FloatingCharlie from '@/components/charlie/FloatingCharlie';
import CharliePagePresenter from '@/components/charlie/CharliePagePresenter';
import PortalSubscribeForm from '@/components/portal/PortalSubscribeForm';

const GOLD = '#D4AF37';

const PILLARS = [
  {
    icon: DollarSign,
    title: 'Zero Management Fees',
    desc: "Traditional corporate relocation companies charge management fees, referral markups, and administrative overhead — thousands per transferred employee. We charge your company nothing. We share in the commission already paid to the buying or selling agent, money built into every transaction anyway.",
  },
  {
    icon: ShieldCheck,
    title: 'Vetted Pros — Not Aunt Suzie',
    desc: "Every agent in our national and international network is production-vetted, license-verified, and matched to your employee's specific move. Your transferee lands with a proven professional on the receiving end — not a relative who assumes she's getting the business because she holds a license.",
  },
  {
    icon: Handshake,
    title: 'No Awkward Decisions',
    desc: "When your employee knows three or four agents personally, our selection process makes the decision for them. No awkward calls, no hurt feelings, no favors owed. The system chose — not your employee. Those uncomfortable situations simply disappear.",
  },
];

export default function CorporateRelo() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#fff' }}>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center px-8 md:px-16 pt-20 pb-14 text-center"
        style={{ background: '#ede0cc', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full text-xs font-black tracking-[0.3em] uppercase"
          style={{ background: '#000', border: '1px solid rgba(212,175,55,0.3)', color: GOLD }}>
          <Building2 className="w-3.5 h-3.5" /> For HR Managers &amp; Employers
        </div>
        <h1 className="display-heading mb-3"
          style={{ fontSize: 'clamp(1.65rem, 4.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '0.12em', color: '#1a1a1a' }}>
          CORPORATE RELOCATION
        </h1>
        <h2 className="display-heading mb-8"
          style={{ fontSize: 'clamp(1.2rem, 3vw, 2.1rem)', letterSpacing: '0.12em', color: GOLD }}>
          WITHOUT THE MANAGEMENT FEES.
        </h2>
        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: '#1a1a1a' }}>
          We save your company the relocation management costs charged by traditional corporate relocation companies.
          Instead, we share in the commission offered to the buying or selling agent in our national and international
          networks — so your people land well, and your budget stays intact.
        </p>
      </section>

      {/* ── Charlie & Bob — DNN strategy lead-in ── */}
      <PortalLeadInDuo />

      {/* ── Video Q&A Briefing ── */}
      <section className="px-8 md:px-16 py-16" style={{ background: '#0d0d0d' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-3 text-center" style={{ color: GOLD }}>THE HR BRIEFING</p>
        <h2 className="display-heading text-center mb-10"
          style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', letterSpacing: '0.12em', color: '#fff' }}>
          ASK BOB DYSON DIRECTLY
        </h2>
        <CorporateReloQASection />
      </section>

      {/* ── Three Pillars ── */}
      <section className="px-8 md:px-16 py-16" style={{ background: '#ede0cc' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PILLARS.map((p) => (
            <div key={p.title} className="p-6 rounded-2xl flex flex-col gap-4"
              style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.25)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <p.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <p className="font-bold text-base text-white">{p.title}</p>
              <p className="text-sm leading-relaxed text-white">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-8 md:px-16 py-20 text-center" style={{ background: '#0d0d0d' }}>
        <p className="text-xs font-black tracking-[0.35em] uppercase mb-4" style={{ color: GOLD }}>NEXT TRANSFEREE?</p>
        <h2 className="display-heading mb-8"
          style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', letterSpacing: '0.12em', color: '#fff' }}>
          LET'S TALK ABOUT YOUR PEOPLE
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-base transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000', boxShadow: '0 4px 14px rgba(212,175,55,0.3)' }}>
            <MessageCircle className="w-5 h-5" /> Talk to Charlie Now
          </Link>
          <Link to="/relo-management"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all hover:scale-105"
            style={{ border: `1px solid ${GOLD}`, color: GOLD }}>
            How We Manage a Move <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/dnn-news"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all hover:scale-105"
            style={{ border: `1px solid ${GOLD}`, color: GOLD }}>
            <Newspaper className="w-4 h-4" /> Real Estate News (Free)
          </Link>
        </div>
        <div className="mt-12 max-w-2xl mx-auto text-left">
          <PortalSubscribeForm portalName="Corporate Relo / HR Portal" source="Corporate HR Portal" roleKey="client" dest="/corporate-relo" />
        </div>
        <p className="text-sm mt-10" style={{ color: '#8a8a8a' }}>
          The Dyson &amp; Dyson Companies, Inc. · California DRE #02303118 · (858) 353-1200
        </p>
      </section>

      <CharliePagePresenter pageKey="corporate-relo" />
      <FloatingCharlie />
    </div>
  );
}