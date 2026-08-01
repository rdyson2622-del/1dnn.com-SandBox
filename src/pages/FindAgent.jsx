import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { appClient } from '@/api/appClient';
import { Mail, Loader2, ShieldCheck, AlertTriangle, ThumbsDown, Award } from 'lucide-react';
import PortalSubscribeForm from '@/components/portal/PortalSubscribeForm';
import PortalLeadInDuo from '@/components/portal/PortalLeadInDuo';
import AgentRecruitCharlieCircle from '@/components/charlie/AgentRecruitCharlieCircle';

const GOLD = '#D4AF37';

const WHY_SECTION = [
  {
    icon: ThumbsDown,
    title: 'The Problem With How Agents Are Normally Selected',
    content: `Most buyers find their agent the wrong way — a quick Zillow search, a friend's referral, or worse, the first person who calls them back. What follows is a parade of "I love me" agents competing for your business: polished presentations, rehearsed pitches, and promises they can't always keep. You end up feeling like the subject of a sales contest rather than a client being served.

    Real estate agents consistently rank among the least trusted professionals in America — often placed below used car salesmen in consumer trust surveys. That's not because all agents are bad. It's because the system rewards self-promotion over client outcomes.`
  },
  {
    icon: ShieldCheck,
    title: 'Why We Do It Completely Differently',
    content: `At Dyson & Dyson, you never meet an agent until WE have already vetted them for you. No cold calls. No pitch meetings. No competing agents fighting over your listing.

    We review 20+ agents in your destination market using DRE records, production history, buyer reviews, neighborhood specialization, and — critically — communication style and personality fit. We are not looking for the agent with the most listings. We are looking for the agent who is the best match for you specifically.

    Only then do we present you with 3 to 5 hand-selected finalists. You make the final choice. You stay in control.`
  },
  {
    icon: AlertTriangle,
    title: 'Why This Step Cannot Be Rushed',
    content: `The agent you choose will be your primary guide through one of the most significant financial and lifestyle decisions of your life. A mismatched agent — even a good one — can cost you time, money, and emotional energy.

    This is why we insist on completing your full relocation profile, your Gemini strategy session, and your personal preferences review BEFORE we begin the matching process. We need to know you before we can find the right person for you.

    Skipping this step and selecting your own agent is your right — but it eliminates our ability to guarantee the outcome, and forfeits the protections this process is designed to provide.`
  },
  {
    icon: Award,
    title: 'Our Standard for Every Agent in Our Network',
    content: `Every agent we recommend must meet the Dyson & Dyson standard:

    • Minimum 5 years active in the destination market
    • Verified production history (closes, not just listings)
    • Clean DRE record — no disciplinary actions
    • Responsive communication — we test them before you meet them
    • Willing to operate within our referral and management fee structure
    • Personality-matched to your stated preferences

    We don't partner with agents who lead with their own brand. We partner with agents who lead with their client's outcome.`
  }
];

export default function FindAgent() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const user = await appClient.auth.me();
        if (user?.email) {
          const clients = await appClient.entities.RelocationClient.filter({ email: user.email }, '-created_date', 1);
          if (clients[0]) setClient(clients[0]);
        }
      } catch (err) {
        console.error('Error fetching client:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#121212' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#121212' }}>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}>
            <ShieldCheck className="w-8 h-8" style={{ color: GOLD }} />
          </div>
          <h1 className="display-heading mb-6" style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>
            <span style={{ color: '#fff' }}>Agent Selection</span><br />
            <span style={{ color: GOLD }}>Done Right</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
            "Every local or out-of-area move requires someone with real knowledge of the destination market — an agent or broker with genuine 'boots on the ground.'"
          </p>
          <p className="text-base max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            But before we talk about who that person is, we need to talk about how we find them — because the way most people end up with an agent is one of the most broken parts of the entire real estate experience.
          </p>
        </motion.div>

        {/* Charlie & Bob — DNN strategy lead-in */}
        <PortalLeadInDuo />

        {/* Agent Status — only if client exists and has an agent */}
        {client?.agent_name && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-8 text-center" style={{ background: '#000', border: `1px solid ${GOLD}44` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}>
              <span className="text-2xl font-bold" style={{ color: GOLD }}>{client.agent_name.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#fff' }}>{client.agent_name}</h2>
            <p className="text-sm mb-4" style={{ color: '#888' }}>Your assigned agent for {client.destination_city}</p>
            {client.assigned_agent && (
              <a href={`mailto:${client.assigned_agent}`} className="inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold" style={{ background: GOLD, color: '#000' }}>
                <Mail className="w-4 h-4" /> Contact Agent
              </a>
            )}
          </motion.div>
        )}

        {/* In-progress status — client exists but no agent yet */}
        {client && !client.agent_name && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-8 text-center" style={{ background: '#000', border: `1px solid ${GOLD}44` }}>
            <p className="text-lg mb-3" style={{ color: '#fff' }}>Your agent matching process is in progress.</p>
            <p className="text-sm" style={{ color: '#888' }}>
              Bob's team is reviewing agents in {client.destination_city} based on your profile.<br />
              We'll present 3–5 finalists within 48 hours of your completed intake.
            </p>
          </motion.div>
        )}



        {/* Why Section — always shown */}
        <div className="space-y-6">
          {WHY_SECTION.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-3xl p-8"
                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}44` }}>
                    <Icon className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: '#fff' }}>{section.title}</h3>
                </div>
                <div className="space-y-3">
                  {section.content.split('\n\n').map((para, j) => (
                    <p key={j} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.72)' }}>
                      {para.trim()}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* The 4-step process */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-3xl p-8" style={{ background: '#000', border: `1px solid ${GOLD}33` }}>
          <h3 className="text-xl font-bold mb-6" style={{ color: GOLD }}>Our 4-Step Agent Selection Process</h3>
          <div className="space-y-5">
            {[
              { num: 1, title: 'Your Relocation Profile', desc: 'We learn your destination, timeline, budget, lifestyle priorities, and communication style before anything else.' },
              { num: 2, title: 'Deep Market Vetting', desc: 'We research 20+ agents in your destination market — DRE records, production history, reviews, and personality fit.' },
              { num: 3, title: 'Your Shortlist', desc: 'You receive 3–5 hand-selected finalists. No pitches. No competitions. Just a clear recommendation and your choice.' },
              { num: 4, title: 'Buyer Broker Agreement', desc: 'Once you select your agent, you formalize the relationship. This unlocks your full City Guide, property tools, and concierge access.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm" style={{ background: GOLD, color: '#000' }}>
                  {step.num}
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: '#fff' }}>{step.title}</p>
                  <p className="text-sm" style={{ color: '#888' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Portal Subscribe */}
        <PortalSubscribeForm portalName="Relocation Agent Network" source="Active Agent Portal" roleKey="agent" dest="/find-agent" />

        {/* Bottom CTA */}
        {!client && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center pb-8">
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Ready to let us find the right agent for you?</p>
            <a href="/relocation-intake" className="inline-block px-10 py-3 rounded-full font-bold text-sm" style={{ background: GOLD, color: '#000' }}>
              Start Your Relocation Profile →
            </a>
          </motion.div>
        )}

      </div>

      {/* Charlie & Bob tag-team — agent recruitment pitch */}
      <AgentRecruitCharlieCircle />
    </div>
  );
}