import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AIAssistantsCharlieCircle from '@/components/charlie/AIAssistantsCharlieCircle';

const GOLD = '#D4AF37';

const AGENTS = [
  { icon: '💬', name: 'Charlie', role: 'Portal Concierge', color: '#B8860B' },
  { icon: '🎯', name: 'Scout', role: 'Lead Scoring', color: '#4169E1' },
  { icon: '👤', name: 'Nexus', role: 'Network Matcher', color: '#FF8C00' },
  { icon: '📈', name: 'Pulse', role: 'Market Intelligence', color: '#20B820' },
  { icon: '🛡️', name: 'Guardian', role: 'Transaction Oversight', color: '#9932CC' },
  { icon: '⏰', name: 'Relay', role: 'Follow-Up Automation', color: '#DC143C' },
  { icon: '✍️', name: 'Composer', role: 'Content Generator', color: '#20B2AA' },
  { icon: '📢', name: 'Signal', role: 'Notification Engine', color: '#FF6347' },
  { icon: '📊', name: 'Advisor', role: 'Escrow Simulator', color: '#20B820' },
  { icon: '🏠', name: 'Keeper', role: 'Homeowner Assistant', color: '#1E90FF' },
  { icon: '🚀', name: 'Bridge', role: 'Referral Coordinator', color: '#FF1493' },
  { icon: '👁️', name: 'Lens', role: 'Profile Optimizer', color: '#9932CC' },
  { icon: '📚', name: 'Curator', role: 'Education Pathways', color: '#228B22' },
  { icon: '🔧', name: 'Dispatch', role: 'Service Coordinator', color: '#DC143C' },
  { icon: '⚡', name: 'Harvest', role: 'Credit Engine', color: '#FFD700' },
  { icon: '🛡️', name: 'Anchor', role: 'Compliance Monitor', color: '#808080' },
  { icon: '🔍', name: 'Radar', role: 'Opportunity Finder', color: '#00BFFF' },
  { icon: '🎼', name: 'Conductor', role: 'Workflow Orchestrator', color: '#FF1493' },
  { icon: '📰', name: 'Herald', role: 'News & Distribution', color: '#20B820' },
  { icon: '📧', name: 'Emissary', role: 'Email Intelligence', color: '#FFB6C1' },
  { icon: '🎯', name: 'Sentinel', role: 'Admin Intelligence', color: '#DAA520' },
];

export default function AIAssistants() {
  return (
    <div className="py-16 px-6 md:px-14 md:pr-48 pb-24" style={{ background: '#ede0cc', color: '#1a1a1a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-10" style={{ color: 'rgba(26,26,26,0.5)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <img src="/assets/dyson-logo.png" alt="Dyson & Dyson" className="h-32 w-auto mx-auto mb-6" />
          <p className="text-xs font-black tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>DYSON & DYSON · HOMES ECOSYSTEM</p>
          <h1 className="display-heading mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.12em', color: '#000' }}>
            21 AI ASSISTANTS
          </h1>
          <div className="w-16 h-px mx-auto mb-5" style={{ background: GOLD }} />
          <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.6rem)', letterSpacing: '0.18em', color: '#333' }}>
            Each Specialist Owns One Domain
          </h2>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: '#4a3a28', fontFamily: 'Georgia, serif' }}>
            They communicate with each other — passing insights, triggering actions, and optimizing outcomes together — so you never have to manage the complexity.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105"
              style={{ background: '#111', border: `1px solid ${GOLD}` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}44` }}>
                {agent.icon}
              </div>
              <p className="text-xs font-bold text-center" style={{ color: '#fff' }}>{agent.name}</p>
              <p className="text-xs text-center mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{agent.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charlie Circle — the backside of D&D explained */}
      <AIAssistantsCharlieCircle />
    </div>
  );
}