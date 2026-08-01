import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const GOLD = '#D4AF37';

export default function ExpertCard() {
  return (
    <div className="p-6 rounded-2xl mb-6" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}` }}>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold tracking-[0.3em] mb-2" style={{ color: GOLD }}>EXPERT LEADERSHIP</p>
          <h4 className="font-bold mb-2 text-white text-lg">Bob Dyson</h4>
          <p className="text-sm leading-relaxed text-white mb-3">
            Founder & Real Estate Expert with 40+ years in the industry. Built a 1,600-office franchise network, acquired 1,000+ properties across multiple markets, and founded DNN (Dyson News Network). Now leading the relocation revolution with AI-powered expertise backed by decades of real estate leadership and transparent, human-driven decision-making.
          </p>
          <div className="flex items-center gap-2 text-xs text-white mt-3" style={{ color: GOLD }}>
            <CheckCircle2 className="w-3 h-3" />
            <span>Expert-verified guidance on every recommendation</span>
          </div>
        </div>
      </div>
    </div>
  );
}