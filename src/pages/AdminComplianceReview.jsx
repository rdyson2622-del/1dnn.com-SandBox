import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { ShieldCheck } from 'lucide-react';
import ComplianceUploader from '@/components/compliance/ComplianceUploader';
import ComplianceDocCard from '@/components/compliance/ComplianceDocCard';

const GOLD = '#D4AF37';

export default function AdminComplianceReview() {
  const { data: docs = [], isLoading, refetch } = useQuery({
    queryKey: ['complianceDocs'],
    queryFn: () => appClient.entities.ComplianceDocument.list('-created_date', 200),
    refetchInterval: 8000,
  });

  const reviewing = docs.filter(d => d.status === 'reviewing' || d.status === 'uploaded').length;
  const highRisk = docs.filter(d => d.risk_level === 'high' || d.risk_level === 'critical').length;

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#0d0d0d' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}` }}>
            <ShieldCheck className="w-6 h-6" style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>COMPLIANCE OFFICE</p>
            <h1 className="text-2xl font-black text-white mt-1">AI Document Review</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Upload DRE forms, C.A.R. disclosures, and title/escrow documents. AI reads each one and returns a condensed opinion, risk level, red flags, and missing items.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Documents', value: docs.length },
            { label: 'In Review', value: reviewing },
            { label: 'High / Critical Risk', value: highRisk },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl px-4 py-3 text-center"
              style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-2xl font-black" style={{ color: GOLD }}>{s.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <ComplianceUploader onUploaded={refetch} />

        {/* Document list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: GOLD }} />
          </div>
        ) : docs.length === 0 ? (
          <div className="rounded-2xl py-16 text-center" style={{ background: '#1a1a1a', border: '1px dashed rgba(212,175,55,0.3)' }}>
            <p className="text-white font-bold">No documents yet</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Upload your first document above to get an AI compliance review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map(doc => (
              <ComplianceDocCard key={doc.id} doc={doc} onChanged={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}