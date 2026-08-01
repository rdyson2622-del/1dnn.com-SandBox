import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGES = [
  {
    id: 1,
    title: 'Daily Property Search',
    description: 'Automated searches run daily based on your criteria',
    icon: Search,
    details: 'Set search profiles for specific cities, price ranges, and property types. The system automatically finds new listings matching your criteria every day.',
    examples: [
      'Austin, TX • $300K-$750K • Single Family',
      'Denver, CO • $400K-$900K • All Types',
      'Seattle, WA • $500K-$1.2M • Condos',
    ]
  },
  {
    id: 2,
    title: 'Obtain Owner Contact Info',
    description: 'Extract contact details from search results',
    icon: Users,
    details: 'Use data enrichment services to identify property owners and get their contact information (phone, email, address).',
    examples: [
      'John Smith • 303-555-0123 • john@example.com',
      'Jane Doe • 206-555-0456 • jane@example.com',
      'Contact via listing agent if direct info unavailable',
    ]
  },
  {
    id: 3,
    title: 'Admin Sends Outreach',
    description: 'SMS, direct contact, or listing agent outreach',
    icon: Send,
    details: 'Reach out to owners with personalized messages. Try direct contact first, then listing agent if no response.',
    examples: [
      '📱 SMS: "Hi John, interested in your Denver property..."',
      '☎️ Phone: Direct call to owner',
      '📧 Email: Listing agent inquiry for owner info',
    ]
  },
  {
    id: 4,
    title: 'Outcome',
    description: 'Active lead or mark as dead file',
    icon: CheckCircle2,
    details: 'Track responses and categorize: active leads move to relocation clients, non-responders go to dead file for later follow-up.',
    examples: [
      '✅ Owner interested → Move to active',
      '❌ No response after 30 days → Dead file',
      '→ Owner relocating? → Create relocation client',
    ]
  }
];

export default function SearchProfilesProcessGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const currentStage = STAGES[activeStep];
  const CurrentIcon = currentStage.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 p-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600 text-white">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">HOW IT WORKS — BULK SEARCH WORKFLOW</h3>
            <p className="text-sm text-slate-600 mt-1">Click any step to see the details. Here's how searches convert to leads.</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-slate-100 flex gap-2">
        {STAGES.map((stage, idx) => (
          <button
            key={stage.id}
            onClick={() => setActiveStep(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              idx === activeStep
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {stage.id}. {stage.title}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid md:grid-cols-2 gap-8 p-6">
        {/* Stage Detail */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">{currentStage.title}</h4>
              <p className="text-sm text-slate-600 mt-1">{currentStage.description}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">{currentStage.details}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">EXAMPLES:</p>
            <ul className="space-y-2">
              {currentStage.examples.map((example, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">STEP {currentStage.id} IN FOCUS</p>
            <h5 className="font-bold text-blue-900 text-sm">{currentStage.title}</h5>
            <p className="text-xs text-blue-800 mt-2 leading-relaxed">{currentStage.description}</p>
          </div>

          {/* Quick Tips */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">KEY ACTIONS:</p>
            {activeStep === 0 && (
              <ul className="space-y-2 text-xs text-slate-600">
                <li>✓ Define search criteria (city, price, property type)</li>
                <li>✓ Set active to run daily automated searches</li>
                <li>✓ Monitor for new listings each day</li>
              </ul>
            )}
            {activeStep === 1 && (
              <ul className="space-y-2 text-xs text-slate-600">
                <li>✓ Use data enrichment API to get owner info</li>
                <li>✓ Verify contact details before outreach</li>
                <li>✓ Note listing agent as backup contact</li>
              </ul>
            )}
            {activeStep === 2 && (
              <ul className="space-y-2 text-xs text-slate-600">
                <li>✓ Personalize message with property details</li>
                <li>✓ Try SMS first for direct reach</li>
                <li>✓ Follow up with agent if no response</li>
              </ul>
            )}
            {activeStep === 3 && (
              <ul className="space-y-2 text-xs text-slate-600">
                <li>✓ Track owner responses and interest</li>
                <li>✓ Convert interested owners to relocation clients</li>
                <li>✓ Archive non-responders for later outreach</li>
              </ul>
            )}
          </div>

          {/* Next Step */}
          {activeStep < STAGES.length - 1 && (
            <Button
              onClick={() => setActiveStep(activeStep + 1)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next Step <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-xs text-slate-600">
        Once you create search profiles, new listings will flow through this workflow automatically. Track responses and outcomes in your Listing Outreach Campaigns dashboard.
      </div>
    </motion.div>
  );
}