import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const GOLD = '#D4AF37';

const STAGES = [
  {
    key: 'under_contract',
    label: 'Under Contract',
    color: '#f97316',
    explainer: 'The buyer has made an offer and both parties have agreed to the purchase terms. A purchase agreement is signed outlining price, contingencies, and closing timeline.',
    documents: [
      { type: 'purchase_agreement', label: 'Purchase Agreement', required: true },
      { type: 'addendum', label: 'Addendums & Amendments', required: false },
      { type: 'inspection_report', label: 'Home Inspection Report', required: false },
      { type: 'appraisal', label: 'Property Appraisal', required: true },
    ]
  },
  {
    key: 'in_escrow',
    label: 'In Escrow',
    color: '#ec4899',
    explainer: 'Escrow has opened with a title company or escrow officer. Earnest money is deposited, contingency deadlines are set, and the lender begins processing the loan application. Title search is ordered.',
    documents: [
      { type: 'escrow_instructions', label: 'Escrow Instructions', required: true },
      { type: 'earnest_money_receipt', label: 'Earnest Money Receipt', required: true },
      { type: 'title_report', label: 'Title Report / Commitment', required: true },
      { type: 'loan_preapproval', label: 'Loan Pre-Approval Letter', required: true },
      { type: 'homeowners_insurance_quote', label: 'Homeowners Insurance Quote', required: true },
    ]
  },
  {
    key: 'final_negotiations',
    label: 'Final Negotiations',
    color: '#8b5cf6',
    explainer: 'Any inspection findings, appraisal gaps, or title issues are negotiated between buyer and seller. Repairs may be requested, credits negotiated, or contingencies waived. Lender requests additional documents.',
    documents: [
      { type: 'inspection_objection', label: 'Inspection Objection Notice', required: false },
      { type: 'repair_estimates', label: 'Repair Estimates & Negotiations', required: false },
      { type: 'appraisal_review', label: 'Appraisal Review / Appeal', required: false },
      { type: 'lender_conditions', label: 'Lender Conditions & Requirements', required: false },
      { type: 'signed_amendments', label: 'Signed Amendments', required: false },
    ]
  },
  {
    key: 'close_of_escrow',
    label: 'Close of Escrow',
    color: '#06b6d4',
    explainer: 'Final walkthrough occurs. Loan is underwritten and approved for closing. All conditions are satisfied. Closing disclosure is provided 3 days before closing date. Funds are wired and final signing happens.',
    documents: [
      { type: 'final_walkthrough', label: 'Final Walkthrough Checklist', required: true },
      { type: 'clear_to_close', label: 'Clear to Close Notice', required: true },
      { type: 'closing_disclosure', label: 'Closing Disclosure', required: true },
      { type: 'settlement_statement', label: 'Settlement Statement / HUD-1', required: true },
      { type: 'closing_documents', label: 'Closing Documents (Promissory Note, Deed of Trust)', required: true },
      { type: 'wire_instructions', label: 'Wire Instructions', required: true },
    ]
  },
  {
    key: 'local_setup',
    label: 'Local Setup',
    color: '#14b8a6',
    explainer: 'After closing, the client activates utilities, schedules movers, and completes essential local setup tasks. Utilities are transferred, home services are coordinated, and the client prepares for the move.',
    documents: [
      { type: 'utility_activation', label: 'Utility Activation Confirmations', required: false },
      { type: 'moving_company_contract', label: 'Moving Company Contract', required: false },
      { type: 'home_inspection_services', label: 'Home Inspection Services', required: false },
      { type: 'local_vendor_contacts', label: 'Local Vendor Contacts & Services', required: false },
    ]
  },
  {
    key: 'moved',
    label: 'Moved',
    color: '#22c55e',
    explainer: 'The client has completed the physical move to the new property. All utilities are active, possessions are transferred, and the client is settled in their new home.',
    documents: [
      { type: 'move_completion', label: 'Move Completion Confirmation', required: false },
      { type: 'utility_final_readings', label: 'Utility Final Readings & Transfers', required: false },
      { type: 'address_change', label: 'Address Change Confirmations', required: false },
    ]
  },
  {
    key: 'closed_escrow_file',
    label: 'Closed Escrow File',
    color: '#22c55e',
    explainer: 'The complete escrow file is compiled by the title company and provided to the client. This comprehensive document package includes the settlement statement, all closing disclosures, loan documents, recorded deed, title insurance policy, and all verifications for tax purposes, future refinancing, or resale.',
    documents: [
      { type: 'settlement_statement', label: 'Settlement Statement (Final)', required: true },
      { type: 'closing_disclosure', label: 'Closing Disclosure (Final)', required: true },
      { type: 'recorded_deed', label: 'Recorded Deed', required: true },
      { type: 'title_insurance_policy', label: 'Title Insurance Policy', required: true },
      { type: 'mortgage_note', label: 'Promissory Note (Original)', required: true },
      { type: 'mortgage_deed', label: 'Mortgage / Deed of Trust (Recorded)', required: true },
      { type: 'homeowners_insurance', label: 'Homeowners Insurance Policy', required: true },
      { type: 'closing_checklist', label: 'Final Closing Checklist & Verification', required: true },
      { type: 'tax_documents', label: '1098 & Tax Documentation', required: false },
    ]
  },
];

function DocumentSection({ stage, documents }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-white/5 transition-colors"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <FileText className="w-4 h-4" style={{ color: stage.color }} />
        <span className="text-sm font-semibold text-white flex-1 text-left">Documents & Files</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 pl-8">
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm rounded-lg p-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                style={{ background: doc.required ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)' }}>
                {doc.required ? (
                  <AlertCircle className="w-3 h-3" style={{ color: '#ef4444' }} />
                ) : (
                  <FileText className="w-3 h-3" style={{ color: '#64748b' }} />
                )}
              </div>
              <span className="text-gray-300 flex-1">{doc.label}</span>
              <label className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold cursor-pointer"
                style={{ background: `rgba(${parseInt(stage.color.slice(1,3),16)},${parseInt(stage.color.slice(3,5),16)},${parseInt(stage.color.slice(5,7),16)},0.15)`, color: stage.color }}>
                <Upload className="w-3 h-3" /> Upload
                <input type="file" className="hidden" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TransactionStages() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>TRANSACTION JOURNEY</p>
        <h3 className="text-xl font-bold text-white">End-to-End Closing Process</h3>
        <p className="text-sm text-gray-400 mt-1">Each stage includes key explainers, required documents, and file upload areas.</p>
      </div>

      <div className="space-y-6">
        {STAGES.map((stage, idx) => (
          <div key={stage.key} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${stage.color}40`, background: `${stage.color}08` }}>
            {/* Header */}
            <div className="p-4 flex items-start gap-3" style={{ background: `${stage.color}15`, borderBottom: `1px solid ${stage.color}30` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                style={{ background: stage.color }}>
                {idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{stage.label}</h4>
                <p className="text-sm text-gray-300 mt-1">{stage.explainer}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="p-4">
              <DocumentSection stage={stage} documents={stage.documents} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}