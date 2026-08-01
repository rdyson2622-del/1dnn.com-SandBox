import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, ChevronDown, ChevronUp, Sparkles, ArrowLeft,
  Users, Mail, BookOpen, MapPin, TrendingUp, Phone, BarChart2, RefreshCw
} from 'lucide-react';

const GOLD = '#D4AF37';

const PHASES = [
  {
    number: 1,
    icon: Users,
    title: 'Audience List Compilation',
    status: 'active',
    tagline: 'Pull the right people — before outreach begins.',
    steps: [
      'Access PropStream or MLS — filter by list price $2M+ and list date within 30 days',
      'Export: owner name, property address, listing agent name, list date, list price',
      'Cross-reference with BatchData for owner phone and email where available',
      'Remove any contacts who are previous clients or already in our system',
      'Upload clean list to Target Audience profile in admin panel',
    ],
    staff_role: 'Staff compiles and cleans the list. AI does not generate contacts — this must be human-verified. Target: 800–1,000 contacts per monthly cycle.',
    legal_note: 'We are contacting sellers as future relocators ONLY. No mention of their listing, agent, or sale price. Public MLS data — TCPA and CAN-SPAM compliant.',
  },
  {
    number: 2,
    icon: Mail,
    title: 'Email Copy Review & Legal Check',
    status: 'upcoming',
    tagline: 'Positioning must be clean before a single send.',
    steps: [
      'Review all 6 email variants in the Social Posts section of the campaign',
      'Confirm NO language references the current listing, listing agent, or sale price',
      'Confirm subject lines are relocation-focused only (not listing/sales focused)',
      'Verify CAN-SPAM compliance: physical address, unsubscribe link in every email',
      'Send test emails to internal team — review on mobile and desktop',
      'Final approval sign-off before loading to sending platform',
    ],
    staff_role: 'One staff member reviews all copy. One senior team member gives final approval. Do not skip this step — one wrong word can create legal exposure with the listing agent.',
    legal_note: 'Our licence to contact these sellers is 100% about relocation. The moment copy references their listing or agent, we lose that protection.',
  },
  {
    number: 3,
    icon: BookOpen,
    title: 'Email Sequence Load & Scheduling',
    status: 'upcoming',
    tagline: 'Set the sequence, test the triggers, confirm the timing.',
    steps: [
      'Load all 6 approved emails into your sending platform (e.g. Mailchimp, HubSpot, Klaviyo)',
      'Set sequence timing: Email 1 Day 0, Email 2 Day 7, Email 3 Day 14, Email 4 Day 21, Email 5 Day 28, Email 6 Day 35',
      'Add all contacts to the sequence — tag them as "LA Luxury Sellers [Month/Year]"',
      'Test trigger: send preview to 3 internal email addresses and confirm delivery and formatting',
      'Set reply notifications to go directly to a monitored staff inbox — NOT a generic inbox',
      'Confirm unsubscribe removes contact from ALL future sends',
    ],
    staff_role: 'Staff loads the platform sequence. Confirm all 6 emails render correctly on mobile. A broken email to a $3M seller is not recoverable.',
    legal_note: 'All emails must include an active unsubscribe mechanism. Any unsubscribe must be honored within 10 business days per CAN-SPAM.',
  },
  {
    number: 4,
    icon: TrendingUp,
    title: 'Campaign Launch & First 24-Hour Watch',
    status: 'upcoming',
    tagline: 'The moment Email 1 sends — watch everything.',
    steps: [
      'Launch Email 1 to full audience — monitor delivery rate (goal: 95%+ delivered)',
      'Track open rates in real time — benchmark: 15–25% for luxury cold outreach',
      'Flag any replies within 30 minutes — assign to a staff member immediately',
      'Log all bounces and remove from sequence — update the audience list',
      'Check for spam complaints — if above 0.5%, pause and review subject line',
      'Internal 24-hour debrief: open rate, reply count, any issues to address',
    ],
    staff_role: 'Someone must be monitoring replies the day Email 1 sends. Any seller who replies is a warm lead — they get a personal phone call within 2 hours. No auto-replies to interested sellers.',
    legal_note: 'Spam complaint rate above 1% triggers platform suspension. Keep subject lines honest and non-deceptive. Never use misleading sender names.',
  },
  {
    number: 5,
    icon: Phone,
    title: 'Reply Handling & Personal Escalation',
    status: 'upcoming',
    tagline: 'Automation gets them to reply. Humans close the relationship.',
    steps: [
      'All replies routed to monitored staff inbox — reviewed within 2 hours during business hours',
      'Interested reply → immediate personal phone call from Dyson team member',
      'Destination named in reply → pull custom research brief from Charlie within 48 hours and send',
      'Not interested / wrong time → politely acknowledge and add to long-term nurture (quarterly check-in)',
      'No reply but clicked destination link → flag as "high interest" and escalate to personal outreach',
      'Log all reply interactions in the OwnerOutreachCampaign or RelocationClient record',
    ],
    staff_role: 'This is the highest-value touchpoint in the entire campaign. A seller who replies to Email 1 may close a $1.8M destination transaction within 60 days. Every reply is treated as VIP.',
    legal_note: 'Never push back on an unsubscribe request. If a seller says "remove me" in any form — in an email reply, phone call, or text — honor it immediately.',
  },
  {
    number: 6,
    icon: MapPin,
    title: 'Destination Research & Agent Matching',
    status: 'upcoming',
    tagline: 'Once engaged — deliver the value that wins their trust.',
    steps: [
      'Pull destination city research from Charlie: neighborhoods, schools, cost of living, lifestyle',
      'Build a one-page custom destination brief tailored to their stated priorities',
      'Begin agent vetting in destination market: top 20 agents evaluated, 3–5 presented',
      'Schedule private Gemini session or direct call with Bob\'s team to review options',
      'Enter client into RelocationClient pipeline — assign to active relocation management',
      'Send welcome message and introduce Charlie as their 24/7 AI advisor',
    ],
    staff_role: 'From the moment a seller becomes a client, they exit the campaign and enter the full relocation management process. Hand off to the client services team with a complete briefing document.',
    legal_note: 'Once they engage as a relocation client, a referral agreement is prepared with the destination agent. Our fee (25% referral + 15% relocation management) is disclosed to the agent at matching.',
  },
  {
    number: 7,
    icon: BarChart2,
    title: 'Mid-Campaign Review & List Refresh',
    status: 'upcoming',
    tagline: 'Pull new listings. Adjust what\'s not working.',
    steps: [
      'After Email 3 (Day 21): review open rates, reply rates, and consultation bookings',
      'Pull new $2M+ LA listings added in the last 30 days — add to the sequence at Email 1',
      'Review any subject line or copy underperformance — adjust Email 4–6 if open rates are below 10%',
      'Confirm reply handling is working — no replies sitting unactioned for more than 24 hours',
      'Update campaign milestones in the admin panel to reflect actual status',
      'Brief the senior team on results to date: contacts reached, replies, consultations booked',
    ],
    staff_role: 'Monthly campaigns must be refreshed with new listings continuously. The $2M+ LA market adds 200–400 new listings every month — these are always new potential clients.',
    legal_note: 'New contacts added mid-campaign must also go through legal review before sending. Do not add contacts without verifying they haven\'t previously unsubscribed.',
  },
  {
    number: 8,
    icon: RefreshCw,
    title: 'Campaign Close, Reporting & Long-Term Nurture',
    status: 'upcoming',
    tagline: 'Close the loop. Start the next cycle.',
    steps: [
      'Final performance report: contacts reached, open rate, reply rate, consultations booked, referrals placed',
      'Calculate ROI: referral fees earned vs. campaign cost ($2,500 target)',
      'Move all non-responders to quarterly long-term nurture sequence (3-month check-in)',
      'Archive campaign in admin panel — label with month/year and results summary',
      'Pull fresh list for next month\'s campaign cycle — repeat process from Phase 1',
      'Document any messaging improvements or legal notes for the next campaign',
    ],
    staff_role: 'Even non-responders are valuable. A seller who doesn\'t reply now may list again in 12 months or refer a friend. Long-term nurture keeps Dyson & Dyson top of mind without being intrusive.',
    legal_note: 'Long-term nurture contacts must be re-validated quarterly. Remove anyone who has sold their home without using our services — they are no longer in our target audience window.',
  },
];

export default function AdminCampaignRoadmap() {
  const [expanded, setExpanded] = useState(1);

  return (
    <div className="min-h-screen" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ background: '#000', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <Link to="/admin/marketing-campaigns">
          <button className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </button>
        </Link>
        <p className="text-xs font-bold tracking-[0.3em]" style={{ color: GOLD }}>STAFF OPERATIONS GUIDE</p>
        <Link to="/admin/target-audiences">
          <button className="px-4 py-2 rounded-full text-xs font-bold tracking-wide" style={{ background: GOLD, color: '#000' }}>
            View Audiences
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="text-center px-6 pt-10 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(212,175,55,0.15)', border: `2px solid ${GOLD}` }}>
            <Sparkles className="w-8 h-8" style={{ color: GOLD }} />
          </div>
          <p className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: GOLD }}>LUXURY LA SELLERS CAMPAIGN</p>
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#fff' }}>Campaign Operations Roadmap</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            The complete step-by-step staff playbook for running the $2M+ LA Seller Relocation Campaign — from list compilation through closed referrals.
          </p>
          <p className="text-sm mt-3 font-semibold" style={{ color: GOLD }}>
            ✦ 8 phases. Staff-guided. AI-assisted. Revenue-generating.
          </p>
        </motion.div>
      </div>

      {/* Legal Banner */}
      <div className="max-w-2xl mx-auto px-6 mb-6">
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <span className="text-lg shrink-0">⚖️</span>
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: '#ef4444' }}>Legal Guardrail — Read Before Every Campaign</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              We contact these sellers as <strong style={{ color: '#fff' }}>future relocators only</strong>. We never mention their listing, listing agent, list price, or sale timeline. Our right to contact them is exclusively about where they are going — not what they are selling. One wrong word creates legal exposure. Every phase has a legal note — follow it.
            </p>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="max-w-2xl mx-auto px-6 pb-10 space-y-3">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = phase.status === 'active';
          const isOpen = expanded === phase.number;

          return (
            <motion.div
              key={phase.number}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="rounded-2xl overflow-hidden"
              style={{
                border: isActive ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.1)',
                background: isActive ? 'rgba(212,175,55,0.07)' : '#111',
              }}
            >
              {/* Phase Header */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
                onClick={() => setExpanded(isOpen ? null : phase.number)}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? GOLD : 'rgba(255,255,255,0.07)',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  }}>
                  {isActive
                    ? <Icon className="w-5 h-5" style={{ color: '#000' }} />
                    : <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{phase.number}</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: isActive ? GOLD : '#fff' }}>
                      Phase {phase.number}: {phase.title}
                    </span>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: GOLD, color: '#000' }}>
                        START HERE
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{phase.tagline}</p>
                </div>

                {isOpen
                  ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                }
              </button>

              {/* Expanded Detail */}
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-5 pb-5 space-y-3"
                >
                  {/* Steps */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>STAFF STEPS</p>
                    <ul className="space-y-2">
                      {phase.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: isActive ? GOLD : 'rgba(255,255,255,0.3)' }} />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Two-column: Staff Role + Legal Note */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid rgba(212,175,55,0.15)` }}>
                      <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>STAFF RESPONSIBILITY</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{phase.staff_role}</p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p className="text-xs font-bold tracking-widest mb-2" style={{ color: '#ef4444' }}>⚖️ LEGAL NOTE</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{phase.legal_note}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <div className="rounded-2xl p-8" style={{ background: '#000', border: `1px solid ${GOLD}` }}>
          <p className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: GOLD }}>READY TO RUN THE CAMPAIGN?</p>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Luxury LA Sellers Relocation</h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            The campaign is loaded in your admin panel. Start at Phase 1 — compile your list, then work through each phase in order. Every reply is a potential $15,000–$25,000 referral fee.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/admin/target-audiences">
              <button className="px-6 py-3 rounded-xl text-sm font-bold" style={{ background: GOLD, color: '#000' }}>
                View Audience & Action Plans
              </button>
            </Link>
            <Link to="/admin/marketing-campaigns">
              <button className="px-6 py-3 rounded-xl text-sm font-bold" style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444' }}>
                View Campaign & Emails
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}