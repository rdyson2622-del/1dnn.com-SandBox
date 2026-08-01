import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Send, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const GOLD = '#D4AF37';

export default function ReferralFlowMockup() {
  const [expanded, setExpanded] = useState({
    intake: true,
    proposal: false,
    acceptance: false,
    close: false,
  });

  const [formData, setFormData] = useState({
    intakeForm: {
      name: '',
      email: '',
      destination: '',
      budget: '',
      moveDate: '',
    },
    proposalData: {
      agentName: 'Sarah Chen',
      agentEmail: 'sarah@austinrealestate.com',
      referralFee: '25%',
      managementFee: '15%',
    },
    agentResponse: null,
    closeData: {
      salePrice: '',
      closeDateComplete: '',
      feesAccrued: '',
    },
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleAgentAction = (action) => {
    setFormData(prev => ({
      ...prev,
      agentResponse: action,
    }));
  };

  const Section = ({ id, title, icon: Icon, stage, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-4 rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${GOLD}33` }}
    >
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-5 py-4 flex items-center gap-3 transition-all"
        style={{
          background: expanded[id] ? 'rgba(212,175,55,0.08)' : '#111',
          borderBottom: expanded[id] ? `1px solid ${GOLD}44` : 'none',
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <Icon className="w-5 h-5" style={{ color: GOLD }} />
          <div className="text-left">
            <div className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>
              STAGE {stage}
            </div>
            <div className="text-base font-bold" style={{ color: '#fff' }}>
              {title}
            </div>
          </div>
        </div>
        {expanded[id] ? (
          <ChevronUp className="w-5 h-5" style={{ color: GOLD }} />
        ) : (
          <ChevronDown className="w-5 h-5" style={{ color: '#666' }} />
        )}
      </button>

      <AnimatePresence>
        {expanded[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 space-y-4" style={{ background: '#0d0d0d' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* INTAKE STAGE */}
      <Section id="intake" title="Consumer Intake" icon={FileText} stage="1">
        <p className="text-sm" style={{ color: '#aaa' }}>
          Relocating family fills out their profile. This data feeds Charlie's matching engine.
        </p>
        <div className="space-y-3 mt-4">
          <div>
            <label className="text-xs font-bold mb-1 block" style={{ color: '#888' }}>
              Full Name
            </label>
            <Input
              placeholder="e.g., Sarah Johnson"
              value={formData.intakeForm.name}
              onChange={(e) => handleInputChange('intakeForm', 'name', e.target.value)}
              className="border-0 rounded-lg h-10"
              style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
            />
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block" style={{ color: '#888' }}>
              Email
            </label>
            <Input
              type="email"
              placeholder="sarah@example.com"
              value={formData.intakeForm.email}
              onChange={(e) => handleInputChange('intakeForm', 'email', e.target.value)}
              className="border-0 rounded-lg h-10"
              style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
            />
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block" style={{ color: '#888' }}>
              Destination City
            </label>
            <Input
              placeholder="e.g., Austin, TX"
              value={formData.intakeForm.destination}
              onChange={(e) => handleInputChange('intakeForm', 'destination', e.target.value)}
              className="border-0 rounded-lg h-10"
              style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#888' }}>
                Budget
              </label>
              <Input
                placeholder="$500k - $750k"
                value={formData.intakeForm.budget}
                onChange={(e) => handleInputChange('intakeForm', 'budget', e.target.value)}
                className="border-0 rounded-lg h-10"
                style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#888' }}>
                Move Date
              </label>
              <Input
                type="date"
                value={formData.intakeForm.moveDate}
                onChange={(e) => handleInputChange('intakeForm', 'moveDate', e.target.value)}
                className="border-0 rounded-lg h-10"
                style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
              />
            </div>
          </div>
          <Button
            className="w-full h-10 rounded-lg font-bold text-sm mt-2"
            style={{ background: GOLD, color: '#000' }}
            disabled={!formData.intakeForm.name || !formData.intakeForm.email}
          >
            Submit Profile & Match Agent
          </Button>
        </div>
      </Section>

      {/* PROPOSAL STAGE */}
      <Section id="proposal" title="Agent Proposal" icon={FileText} stage="2">
        <p className="text-sm" style={{ color: '#aaa' }}>
          System identifies best agent match. Proposal sent with fee structure and agreement.
        </p>
        <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}>
          <div>
            <div className="text-xs font-bold" style={{ color: GOLD }}>MATCHED AGENT</div>
            <div className="text-lg font-bold mt-1" style={{ color: '#fff' }}>
              {formData.proposalData.agentName}
            </div>
            <div className="text-sm mt-1" style={{ color: '#aaa' }}>
              {formData.proposalData.agentEmail}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: '#333' }}>
            <div>
              <div className="text-xs" style={{ color: '#888' }}>Referral Fee</div>
              <div className="text-lg font-bold" style={{ color: GOLD }}>
                {formData.proposalData.referralFee}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#888' }}>Management Fee</div>
              <div className="text-lg font-bold" style={{ color: GOLD }}>
                {formData.proposalData.managementFee}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t" style={{ borderColor: '#333' }}>
            <div className="text-xs" style={{ color: '#888' }}>TOTAL AT $500K SALE</div>
            <div className="text-xl font-bold" style={{ color: GOLD }}>$200,000</div>
            <div className="text-xs mt-1" style={{ color: '#666' }}>
              Referral: $125k + Management: $75k
            </div>
          </div>
        </div>

        <Textarea
          placeholder="Agent will review agreement here..."
          className="border-0 rounded-lg mt-3"
          style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD, minHeight: '80px' }}
          disabled
        />

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-lg"
            onClick={() => handleAgentAction('rejected')}
            style={{
              borderColor: formData.agentResponse === 'rejected' ? '#ef4444' : '#333',
              color: formData.agentResponse === 'rejected' ? '#ef4444' : '#aaa',
            }}
          >
            Reject
          </Button>
          <Button
            className="flex-1 h-10 rounded-lg font-bold text-sm"
            style={{
              background: formData.agentResponse === 'accepted' ? GOLD : '#333',
              color: formData.agentResponse === 'accepted' ? '#000' : '#666',
            }}
            onClick={() => handleAgentAction('accepted')}
          >
            Accept Proposal
          </Button>
        </div>

        {formData.agentResponse && (
          <div className="flex items-center gap-2 p-3 rounded-lg mt-3" style={{ background: 'rgba(34,197,94,0.1)' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
            <span className="text-sm" style={{ color: '#22c55e' }}>
              Proposal {formData.agentResponse === 'accepted' ? 'Accepted' : 'Rejected'}
            </span>
          </div>
        )}
      </Section>

      {/* ACCEPTANCE STAGE */}
      <Section id="acceptance" title="Agent Acceptance & Escrow" icon={CheckCircle2} stage="3">
        <p className="text-sm" style={{ color: '#aaa' }}>
          Agent confirms buyer representation. Transactions begin. Escrow date tracked.
        </p>
        {formData.agentResponse === 'accepted' ? (
          <div className="space-y-3 mt-4">
            <div className="p-4 rounded-lg" style={{ background: '#1a1a1a', border: `1px solid #22c55e44` }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
                <span className="text-sm font-bold" style={{ color: '#22c55e' }}>
                  Agent confirmed buyer representation
                </span>
              </div>
              <div className="text-xs mt-3 space-y-2" style={{ color: '#aaa' }}>
                <div>
                  <span style={{ color: '#888' }}>Acceptance Date:</span>
                  <span className="ml-2" style={{ color: '#fff' }}>March 17, 2026</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Buyer Name:</span>
                  <span className="ml-2" style={{ color: '#fff' }}>
                    {formData.intakeForm.name || 'Sarah Johnson'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Property Address:</span>
                  <span className="ml-2" style={{ color: '#fff' }}>TBD (under search)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#888' }}>
                Target Close Date
              </label>
              <Input
                type="date"
                value={formData.closeData.closeDateComplete}
                onChange={(e) => handleInputChange('closeData', 'closeDateComplete', e.target.value)}
                className="border-0 rounded-lg h-10"
                style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
              />
            </div>

            <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: 'rgba(59,130,246,0.1)', border: `1px solid #3b82f644` }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#3b82f6' }} />
              <span className="text-xs" style={{ color: '#93c5fd' }}>
                Escrow timeline tracking active. Status updates will be sent to agent and buyer.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}>
            <p className="text-sm" style={{ color: '#aaa' }}>
              Complete proposal acceptance to unlock escrow tracking.
            </p>
          </div>
        )}
      </Section>

      {/* CLOSE STAGE */}
      <Section id="close" title="Transaction Close & Fee Settlement" icon={CheckCircle2} stage="4">
        <p className="text-sm" style={{ color: '#aaa' }}>
          Deal closes. Fees calculated and paid. Referral tracked as "closed."
        </p>
        {formData.agentResponse === 'accepted' ? (
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#888' }}>
                Final Sale Price
              </label>
              <Input
                placeholder="$525,000"
                value={formData.closeData.salePrice}
                onChange={(e) => handleInputChange('closeData', 'salePrice', e.target.value)}
                className="border-0 rounded-lg h-10"
                style={{ background: '#1a1a1a', color: '#fff', caretColor: GOLD }}
              />
            </div>

            {formData.closeData.salePrice && (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid ${GOLD}44` }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs" style={{ color: '#888' }}>Referral Fee (25%)</div>
                    <div className="text-lg font-bold mt-1" style={{ color: GOLD }}>
                      ${(parseInt(formData.closeData.salePrice.replace(/\D/g, '')) * 0.25).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: '#888' }}>Management Fee (15%)</div>
                    <div className="text-lg font-bold mt-1" style={{ color: GOLD }}>
                      ${(parseInt(formData.closeData.salePrice.replace(/\D/g, '')) * 0.15).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="border-t mt-3 pt-3" style={{ borderColor: '#333' }}>
                  <div className="text-xs" style={{ color: '#888' }}>TOTAL FEES DUE</div>
                  <div className="text-2xl font-bold" style={{ color: GOLD }}>
                    ${(parseInt(formData.closeData.salePrice.replace(/\D/g, '')) * 0.4).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full h-10 rounded-lg font-bold text-sm gap-2"
              style={{ background: GOLD, color: '#000' }}
              disabled={!formData.closeData.salePrice}
            >
              <Send className="w-4 h-4" /> Mark Complete & Record Fees
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-lg" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}>
            <p className="text-sm" style={{ color: '#aaa' }}>
              Pending agent acceptance to record close details.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}