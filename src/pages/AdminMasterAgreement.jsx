import React from 'react';
import { Printer, FileText, AlertTriangle } from 'lucide-react';
import MasterAgreementText from '@/components/agreements/MasterAgreementText';

const GOLD = '#D4AF37';

export default function AdminMasterAgreement() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden px-6 py-5 flex flex-col md:flex-row md:items-center gap-4"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}` }}>
            <FileText className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Master Referral &amp; Relocation Management Agreement</h1>
            <p className="text-xs text-white">One agreement, both functions — signed by referring and receiving broker &amp; agent.</p>
          </div>
        </div>
        <button onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Legal disclaimer — hidden when printing */}
      <div className="print:hidden max-w-4xl mx-auto mt-4 mb-2 px-4">
        <div className="flex items-start gap-3 p-4 rounded-xl text-xs text-white"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
          <p>
            This is a working draft for internal review. Before use with any broker or agent, have it reviewed
            by your real estate attorney — particularly for referral-fee and fee-splitting rules in each
            receiving agent's state, and RESPA applicability.
          </p>
        </div>
      </div>

      <div className="py-6 print:py-0">
        <MasterAgreementText />
      </div>
    </div>
  );
}