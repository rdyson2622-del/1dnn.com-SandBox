import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronRight, User, CheckCircle2, Zap, Flag, Phone, Star } from 'lucide-react';

const GOLD = '#D4AF37';

const STEPS = [
  {
    stage: '1',
    label: 'Daily Property Search',
    icon: Star,
    color: '#4169E1',
    subtitle: 'Auto-triggered every morning at 6am',
    description: 'Gemini scans the web for new listings matching your saved search profiles and imports them into the system.',
    example: {
      title: 'New Listing Found',
      fields: [
        { label: 'Address', value: '1234 Lakewood Dr, Austin, TX 78701' },
        { label: 'Price', value: '$525,000' },
        { label: 'Listing Agent', value: 'Sarah Chen — sarah@realestate.com' },
        { label: 'Owner (via skip trace)', value: 'John Smith — 512-555-1234' },
      ]
    }
  },
  {
    stage: '2',
    label: 'Campaign Created',
    icon: MessageSquare,
    color: '#20B820',
    subtitle: 'System auto-creates the outreach record',
    description: 'An Outreach Campaign is created for John Smith, ready for admin review.',
    example: {
      title: 'Campaign Record',
      fields: [
        { label: 'Owner', value: 'John Smith' },
        { label: 'Phone', value: '512-555-1234' },
        { label: 'Property', value: '1234 Lakewood Dr, Austin, TX' },
        { label: 'Stage', value: 'OUTREACH', highlight: true },
      ]
    }
  },
  {
    stage: '3',
    label: 'Admin Sends Outreach SMS',
    icon: Phone,
    color: '#FF8C00',
    subtitle: 'One-click send — Charlie-focused messaging',
    description: 'Admin clicks "Send SMS." The message leads with service and Charlie — never mentions agents.',
    example: {
      title: 'SMS Message Sent',
      isSMS: true,
      smsText: `Hi John — moving soon? Our AI concierge Charlie handles your entire relocation FREE of charge. Neighborhoods, schools, utilities, timing — all of it. No pressure, just help. Want Charlie to get started? Reply YES.`
    }
  },
  {
    stage: '4',
    label: 'Owner Responds',
    icon: User,
    color: '#9932CC',
    subtitle: 'Stage advances to "Response"',
    description: 'When John replies, admin logs the response and captures key relocation details.',
    example: {
      title: 'Owner Response Captured',
      fields: [
        { label: 'John replied', value: '"YES — moving to Denver, June 2026"' },
        { label: 'Destination', value: 'Denver, CO' },
        { label: 'Budget', value: '$400k–$600k' },
        { label: 'Timeline', value: 'June 2026' },
        { label: 'Stage', value: 'RESPONSE', highlight: true },
      ]
    }
  },
  {
    stage: '5',
    label: 'Profile Complete',
    icon: CheckCircle2,
    color: '#20B2AA',
    subtitle: 'All relocation details collected',
    description: 'Admin confirms all details are captured. Charlie is now briefed and ready to engage.',
    example: {
      title: 'Profile Checklist',
      checks: [
        'Destination city & state confirmed',
        'Budget range captured',
        'Moving timeline set',
        'Family size & priorities noted',
        'Charlie briefing generated',
      ]
    }
  },
  {
    stage: '6',
    label: 'Charlie Takes Over',
    icon: Zap,
    color: '#DC143C',
    subtitle: 'Fully automated — no admin needed',
    description: 'Charlie researches Denver neighborhoods, builds a customized move plan, finds local services — and when the time is right, quietly introduces the best-matched local agent.',
    example: {
      title: 'Charlie Is Now Handling',
      checks: [
        'Neighborhood research for Denver',
        'School district analysis',
        'Cost of living comparison',
        'Utilities & services setup',
        'Move timeline & checklist',
        'Local agent match (behind the scenes)',
      ]
    }
  },
  {
    stage: '7',
    label: 'Deal Closed',
    icon: Flag,
    color: '#808080',
    subtitle: 'Referral fee earned',
    description: 'John buys in Denver. 25% referral fee + 15% relocation management fee paid at close.',
    example: {
      title: 'Revenue at Close',
      fields: [
        { label: 'Denver home price', value: '$520,000' },
        { label: 'Buyer agent commission (2.5%)', value: '$13,000' },
        { label: '25% Referral Fee', value: '$3,250', highlight: true },
        { label: '15% Relocation Mgmt Fee', value: '$1,950', highlight: true },
        { label: 'Total Earned', value: '$5,200', big: true },
      ]
    }
  },
];

export default function OutreachProcessGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];
  const Icon = step.icon;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ background: '#fff' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100" style={{ background: '#000' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: GOLD, color: '#000' }}>
            ✦
          </div>
          <div>
            <h2 className="font-bold text-white text-sm tracking-wide">HOW IT WORKS — FULL CAMPAIGN WALKTHROUGH</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Click any step to see the details. No campaigns yet — here's what to expect.</p>
          </div>
        </div>
      </div>

      {/* Step Pills */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto border-b border-slate-100" style={{ background: '#f8f8f8' }}>
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = i === activeStep;
          return (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                background: isActive ? s.color : '#fff',
                color: isActive ? '#fff' : '#666',
                border: `2px solid ${isActive ? s.color : '#e2e8f0'}`,
              }}
            >
              <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#eee', color: isActive ? '#fff' : '#999' }}>
                {s.stage}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-6 grid md:grid-cols-2 gap-6"
        >
          {/* Left: Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${step.color}18`, border: `2px solid ${step.color}40` }}>
                <Icon className="w-5 h-5" style={{ color: step.color }} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Step {step.stage}: {step.label}</p>
                <p className="text-xs mt-0.5" style={{ color: step.color }}>{step.subtitle}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 mb-6">{step.description}</p>

            {/* Navigation */}
            <div className="flex gap-2">
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep(i => i - 1)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
                  style={{ color: '#666' }}
                >
                  ← Previous
                </button>
              )}
              {activeStep < STEPS.length - 1 && (
                <button
                  onClick={() => setActiveStep(i => i + 1)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all flex items-center gap-1"
                  style={{ background: step.color }}
                >
                  Next Step <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Example */}
          <div className="rounded-xl p-4 border" style={{ background: '#f9fafb', borderColor: '#e2e8f0' }}>
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#999' }}>
              {step.example.title?.toUpperCase()}
            </p>

            {/* SMS bubble style */}
            {step.example.isSMS && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4" style={{ color: GOLD }} />
                  <span className="text-xs font-semibold text-slate-700">Outbound SMS to John Smith (512-555-1234)</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                  style={{ background: '#000', color: '#fff', maxWidth: '90%' }}>
                  {step.example.smsText}
                </div>
                <p className="text-xs text-slate-400 ml-1">Delivered · Charlie-focused, no mention of agents</p>
              </div>
            )}

            {/* Field rows */}
            {step.example.fields && (
              <div className="space-y-2">
                {step.example.fields.map((f, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-500 shrink-0">{f.label}</span>
                    <span className={`text-xs font-semibold text-right ${f.big ? 'text-base' : ''}`}
                      style={{
                        color: f.highlight ? step.color : f.big ? GOLD : '#1e293b',
                        fontWeight: f.big ? 700 : 600
                      }}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Checklist */}
            {step.example.checks && (
              <div className="space-y-2">
                {step.example.checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: step.color }} />
                    <span className="text-xs text-slate-700">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer CTA */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between" style={{ background: '#fafafa' }}>
        <p className="text-xs text-slate-400">Once your first campaign is created, this guide will be replaced by your live data.</p>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === activeStep ? GOLD : '#e2e8f0' }} />
          ))}
        </div>
      </div>
    </div>
  );
}