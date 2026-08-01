import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, CheckCircle2, DollarSign, TrendingUp, Eye, Handshake, Users, Sparkles
} from 'lucide-react';
import { CORPORATE_PROFILE } from '../lib/corporateProfile';

const DYSON_LOGO = "/assets/dyson-logo.png";
const GOLD = '#D4AF37';

const benefits = [
  {
    icon: Sparkles,
    title: "Zero Cost to You",
    desc: "Present this to your sellers at no expense. It's your competitive advantage when listing."
  },
  {
    icon: DollarSign,
    title: "25% Referral Fee",
    desc: "At close of escrow, you earn 25% of the home sale price. We handle 100% of the relocation."
  },
  {
    icon: TrendingUp,
    title: "Higher Close Rate",
    desc: "Our partnerships with top receiving brokers in every market means faster sales, better terms, fewer contingencies."
  },
  {
    icon: Eye,
    title: "Blind Transaction Access",
    desc: "Follow the relocation journey with your client—milestone updates, moving progress, timeline visibility. Stay in the loop."
  },
  {
    icon: Handshake,
    title: "Keep Your Relationship",
    desc: "We manage the move logistics. You stay the trusted advisor. Clients see you partnered with world-class relocation management."
  },
  {
    icon: Users,
    title: "Top Broker Network",
    desc: "We work with the 10 best agents/brokers in each destination. Your seller gets expert placement, not random network."
  },
];

export default function AgentExplainer() {
  return (
    <div className="min-h-screen" style={{ background: '#808080', color: '#fff' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-14 py-4"
        style={{ background: '#000', borderBottom: '1px solid rgba(212,175,55,0.12)' }}
      >
        <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 w-auto" />
        <Link to="/Home" className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-70" style={{ color: '#fff' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ minHeight: '60vh', background: '#808080' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.07) 0%, transparent 65%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 50%, transparent 100%)' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-bold tracking-[0.3em] mb-4" style={{ color: GOLD }}>FOR REAL ESTATE AGENTS</p>
            <h1 className="display-heading mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.2, letterSpacing: '0.22em', color: '#fff' }}>
              Your Free Competitive<br />
              <span className="gold-text-gradient">Listing Advantage</span>
            </h1>
            <p className="text-lg leading-relaxed mb-3" style={{ color: '#fff' }}>
              When your sellers are relocating, give them Dyson & Dyson. At no cost to you. You earn 25% at close. We handle everything else.
            </p>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.9)' }}>
              This is how you win listings against competitors who only offer MLS. You offer a <strong>complete relocation concierge</strong>—managed by AI and real estate experts. Your sellers see you as their most valuable advisor.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <Link to="/AdminReferrals">
                <button className="gold-btn px-7 py-3 rounded-full text-sm font-bold tracking-wide flex items-center gap-2">
                  See Agent Portal <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="mailto:rdyson2622@gmail.com">
                <button className="px-7 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all hover:bg-white/5"
                  style={{ background: '#000', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  Questions? <ArrowRight className="w-4 h-4" />
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Model */}
      <section className="py-20 px-6 md:px-14" style={{ background: '#000', borderTop: '1px solid rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] mb-3" style={{ color: GOLD }}>THE AGENT MODEL</p>
            <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', lineHeight: 1.2, letterSpacing: '0.22em', color: '#fff' }}>
              You list. Bob's team relocates.<br />
              <span style={{ color: GOLD }}>You get paid 25% of the sale.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: "Your Role", items: ["Present Dyson at listing meeting", "Stay primary advisor throughout", "Receive transaction access/updates", "Earn 25% at close"] },
              { title: "Bob's Team Role", items: ["Expert relocation vetting (40+ years)", "AI-assisted research & analysis", "Hand-vetted agent selection", "Utilities, schools, movers—all coordinated"] },
              { title: "Client Outcome", items: ["Relocate with confidence", "Expert local agent match", "Logistics handled end-to-end", "Zero cost—completely free"] }
            ].map((col, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ background: '#3a3a3a', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <h3 className="font-bold mb-4 tracking-wide" style={{ color: '#fff', fontSize: '1.185rem' }}>{col.title}</h3>
                <ul className="space-y-2">
                  {col.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: '#e5e5e5' }}>
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl p-8 text-center" style={{ background: '#3a3a3a', border: '1px solid rgba(212,175,55,0.3)' }}>
            <p className="text-lg font-semibold mb-2" style={{ color: '#fff' }}>
              The fee is simple. At close of escrow on their new home:
            </p>
            <p style={{ fontSize: '3rem', color: GOLD, fontWeight: 'bold', fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              25% referral + you stay their trusted advisor
            </p>
            <p className="text-sm mt-3" style={{ color: '#e5e5e5' }}>
              We also charge a 10–15% relocation management fee to the seller at close (transparent, agreed upfront).
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-6 md:px-14" style={{ background: '#808080' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] mb-3" style={{ color: GOLD }}>WHY AGENTS LOVE THIS</p>
            <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', lineHeight: 1.2, letterSpacing: '0.22em', color: '#fff' }}>
              You look like a hero.<br />
              <span style={{ color: GOLD }}>Clients relocate with confidence.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-6 rounded-2xl"
                style={{ background: '#000', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <b.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 className="font-bold mb-2 tracking-wide" style={{ color: '#fff', fontSize: '1.185rem' }}>{b.title}</h3>
                <p className="leading-relaxed" style={{ color: '#e5e5e5', fontSize: '0.95rem' }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bob's Vision Section */}
      <section className="py-20 px-6 md:px-14" style={{ background: '#3a3a3a', borderTop: '1px solid rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
       <div className="max-w-4xl mx-auto text-center">
         <div className="rounded-2xl p-8" style={{ background: '#000', border: '2px solid #D4AF37' }}>
           <p className="text-xs font-bold tracking-[0.3em] mb-4" style={{ color: GOLD }}>THE VISION</p>
           <p className="text-lg italic leading-relaxed" style={{ color: '#fff' }}>
             "{CORPORATE_PROFILE.bobsDedication}"
           </p>
           <p className="text-sm mt-6" style={{ color: '#e5e5e5' }}>
             This is what every agent partnership represents—the marriage of 40+ years of real estate mastery with today's most powerful technology.
           </p>
         </div>
       </div>
      </section>

      {/* Why Top Brokers */}
      <section className="py-20 px-6 md:px-14" style={{ background: '#000', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
       <div className="max-w-4xl mx-auto">
         <div className="grid md:grid-cols-2 gap-10 items-center">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
             <p className="text-xs font-bold tracking-[0.3em] mb-4" style={{ color: GOLD }}>THE BROKER ADVANTAGE</p>
              <h3 className="display-heading mb-6" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', lineHeight: 1.25, letterSpacing: '0.22em', color: '#fff' }}>
                We partner with the<br />
                <span className="gold-text-gradient">top 10 agents</span><br />
                in all major cities and worldwide.
              </h3>
              <p className="leading-relaxed mb-4" style={{ color: '#e5e5e5' }}>
                When your seller relocates, we don't hand them off to a random network. We connect them with the best, most experienced agents in their destination market—whether it's down the street or across the globe.
              </p>
              <p className="leading-relaxed mb-6" style={{ color: '#e5e5e5' }}>
                This isn't just better service—it means faster sales, better negotiations, and higher close rates. Your sellers win. You look brilliant for connecting them.
              </p>
              <ul className="space-y-3">
                {[
                  "Average 15% faster market time vs. cold starts",
                  "Vetted agents know local market intimately",
                  "Higher success rate on contingency negotiations",
                  "Direct relationship—no handoffs, no delays"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#fff' }}>
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
              style={{ background: '#3a3a3a', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              <div className="text-5xl font-bold mb-3" style={{ color: GOLD, fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                10+
              </div>
              <p className="text-sm mb-6" style={{ color: '#fff' }}>
                Top 10 agents in all major cities worldwide
              </p>
              <p className="text-xs" style={{ color: '#e5e5e5' }}>
                All U.S. major markets • International expansion in progress • Always the best local expertise
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transaction Portal */}
      <section className="py-20 px-6 md:px-14" style={{ background: '#808080', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-bold tracking-[0.3em] mb-4" style={{ color: GOLD }}>STAY IN THE LOOP</p>
            <h2 className="display-heading mb-6" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', lineHeight: 1.2, letterSpacing: '0.22em', color: '#fff' }}>
              Transaction Portal:<br />
              <span style={{ color: GOLD }}>Blind visibility into your client's move</span>
            </h2>
            <p className="text-base leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: '#fff' }}>
              Once you refer a client to us, you get a unique secure link to a read-only dashboard. See milestones, timeline updates, moving progress. You're always the trusted advisor—never out of the loop.
            </p>

            <div className="rounded-2xl p-8 mb-8" style={{ background: '#000', border: '1px solid rgba(212,175,55,0.3)' }}>
              <p className="text-sm mb-6" style={{ color: '#e5e5e5' }}>
                <strong style={{ color: '#fff' }}>What you see:</strong>
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  "Client's relocation profile",
                  "Moving timeline & milestones",
                  "Destination city research",
                  "Agent selection process",
                  "New home search progress",
                  "Transaction status updates",
                  "Utilities & service setup",
                  "Moving logistics coordination"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2" style={{ color: '#e5e5e5' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <em>No edit rights—you watch, your client stays confident you're guiding them.</em>
            </p>

            <a href="mailto:rdyson2622@gmail.com?subject=Agent%20Portal%20Demo%20Request">
              <button className="gold-btn px-8 py-3 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 mx-auto">
                Request Agent Portal Demo <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center relative overflow-hidden"
        style={{ background: '#000', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(212,175,55,0.06) 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-xs font-bold tracking-[0.3em] mb-4" style={{ color: GOLD }}>READY?</p>
          <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 3rem)', lineHeight: 1.25, letterSpacing: '0.22em', color: '#fff' }}>
            Pitch relocation confidence<br />
            <span style={{ color: GOLD }}>to your next listing meeting.</span>
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto" style={{ color: '#fff' }}>
            Send your sellers to Charlie. Earn 25%. We handle everything. You stay their hero.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:rdyson2622@gmail.com">
              <button className="gold-btn px-10 py-3 rounded-full text-sm font-bold tracking-wide">
                Contact Our Agent Team
              </button>
            </a>
            <Link to="/">
              <button className="px-10 py-3 rounded-full text-sm font-semibold transition-all hover:bg-white/5"
                style={{ background: '#3a3a3a', color: '#fff', border: '1px solid rgba(212,175,55,0.25)' }}>
                See Client Experience
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="font-bold tracking-widest text-xs mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>FOR REAL ESTATE AGENTS</div>
        <p className="text-sm" style={{ color: '#fff' }}>The Dyson & Dyson Companies / Concierge Relocation Program     Free to list, paid at close     CA.DRE # 02303118</p>
      </footer>
    </div>
  );
}