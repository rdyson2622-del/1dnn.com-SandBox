import React, { useState } from 'react';
import { Copy, CheckCircle, Mail, MessageSquare, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const GOLD = '#D4AF37';
const TAN = '#ede0cc';

// ── Sending Agent Agreement Template ─────────────────────────────────────
function buildSendingDoc(f) {
  return `DYSON & DYSON REAL ESTATE
MANAGED REFERRAL PARTICIPATION AGREEMENT
Sending Brokerage / Originating Agent

Date: ${f.date || '_______________'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARTIES

Sending Brokerage:       ${f.sending_brokerage || '___________________________'}
Sending Agent Name:      ${f.sending_agent || '___________________________'}
Agent DRE License #:     ${f.sending_dre || '___________________________'}
Agent Email:             ${f.sending_email || '___________________________'}
Agent Phone:             ${f.sending_phone || '___________________________'}

Relocation Manager:      Dyson & Dyson Real Estate
CalDRE License #:        [TO BE COMPLETED]
Contact:                 Bob Dyson | dysonrelo.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIENT REFERRAL INFORMATION

Client Full Name:        ${f.client_name || '___________________________'}
Current Address:         ${f.client_address || '___________________________'}
Destination City/State:  ${f.destination || '___________________________'}
Estimated Move Date:     ${f.move_date || '___________________________'}
Estimated Budget:        ${f.budget || '___________________________'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REFERRAL FEE AGREEMENT

By submitting this referral, the Sending Brokerage agrees to the following:

1. MANAGEMENT AUTHORIZATION
   The Sending Brokerage authorizes Dyson & Dyson Real Estate to act as the
   exclusive Relocation Manager for the above-named client at the destination.

2. FEE STRUCTURE
   • Sending Brokerage Referral Fee:  25% of gross buyer-side commission earned
     by the Receiving Brokerage at closing.
   • Dyson & Dyson Management Fee:    10% of gross buyer-side commission earned
     by the Receiving Brokerage at closing.
   • Total Fee Collected at Destination: 35% of Receiving Broker's gross commission.

3. PAYMENT TERMS
   All referral fees are paid broker-to-broker at close of escrow in compliance
   with California DRE regulations. Dyson & Dyson will coordinate distribution
   of the Sending Brokerage's 25% directly from the Receiving Broker.

4. DYSON OBLIGATIONS
   Dyson & Dyson agrees to:
   (a) Vet and select a qualified receiving agent in the destination market;
   (b) Manage all relocation logistics, client communications, and milestone
       tracking through the DysonRelo Portal;
   (c) Provide the Sending Agent with regular status updates through closing.

5. EXCLUSIVITY
   This referral is submitted exclusively to Dyson & Dyson. The Sending Agent
   agrees not to submit this client to a competing relocation service during
   the term of this agreement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIGNATURES

Sending Agent Signature:   ___________________________   Date: ____________

Print Name:                ___________________________

Broker of Record:          ___________________________   Date: ____________

Dyson & Dyson Authorized Rep: _______________________   Date: ____________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This agreement is governed by California law. All parties are licensed real
estate brokers/agents in their respective states. Referral fees comply with
applicable DRE and NAR regulations.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ── Receiving Agent Agreement Template ───────────────────────────────────
function buildReceivingDoc(f) {
  return `DYSON & DYSON REAL ESTATE
PRIVATE REFERRAL NETWORK — REFERRAL ACCEPTANCE AGREEMENT
Receiving Brokerage / Destination Agent

Date: ${f.date || '_______________'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARTIES

Receiving Brokerage:       ${f.receiving_brokerage || '___________________________'}
Receiving Agent Name:      ${f.receiving_agent || '___________________________'}
Agent DRE/State License #: ${f.receiving_license || '___________________________'}
Agent Email:               ${f.receiving_email || '___________________________'}
Agent Phone:               ${f.receiving_phone || '___________________________'}
Destination Market:        ${f.destination_market || '___________________________'}

Originating Brokerage:     ${f.sending_brokerage || '___________________________'}
Originating Agent:         ${f.sending_agent || '___________________________'}

Relocation Manager:        Dyson & Dyson Real Estate
CalDRE License #:          [TO BE COMPLETED]
Contact:                   Bob Dyson | dysonrelo.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIENT REFERRAL INFORMATION

Client Full Name:          ${f.client_name || '___________________________'}
Client Current Location:   ${f.client_from || '___________________________'}
Property Budget:           ${f.budget || '___________________________'}
Target Close Date:         ${f.target_close || '___________________________'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REFERRAL FEE AGREEMENT

By signing below, the Receiving Brokerage agrees to the following terms:

1. TOTAL REFERRAL FEE
   The Receiving Brokerage agrees to pay a total referral and management fee
   of 35% of the gross commission earned on the subject transaction.

2. FEE DISTRIBUTION
   • 25% of gross commission → Paid to the Originating Brokerage
     (${f.sending_brokerage || '[Originating Brokerage Name]'})
   • 10% of gross commission → Paid to Dyson & Dyson Real Estate
     as Relocation Management fee.

3. PAYMENT TERMS
   All fees are due and payable at close of escrow, broker-to-broker, in
   compliance with applicable state DRE regulations. No fees are owed if the
   transaction does not close.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERFORMANCE STANDARDS

Acceptance of this referral requires the Receiving Agent to comply with the
following Dyson PRN Performance Standards:

1. RESPONSE TIME
   The Receiving Agent must acknowledge the client introduction within 2 hours
   and make first direct client contact within 24 hours.

2. MILESTONE REPORTING
   The Receiving Agent agrees to submit status updates through the DysonRelo
   Portal at each of the following escrow milestones:
     □ Offer Accepted / Property Under Contract
     □ Inspection Complete
     □ Contingencies Released
     □ Clear to Close
     □ Funded / Closed

3. COMMUNICATION PROTOCOL
   The Receiving Agent agrees to copy Dyson & Dyson (relo@dysondyson.com) on
   all material client communications during the transaction.

4. CLIENT EXPERIENCE STANDARD
   Any documented client complaint may result in removal from the Dyson
   Private Referral Network Vetted Partner Roster.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIGNATURES

Receiving Agent Signature:  ___________________________   Date: ____________

Print Name:                 ___________________________

Broker of Record:           ___________________________   Date: ____________

Dyson & Dyson Authorized Rep: ______________________    Date: ____________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This agreement is governed by the laws of the Receiving Agent's state of
licensure. All parties represent that they hold active real estate licenses.
Referral fees comply with applicable state DRE and NAR regulations.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ── Field Input Component ─────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: GOLD }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || label}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: '#ede0cc', border: '1px solid rgba(212,175,55,0.4)', color: '#1a1a1a' }} />
    </div>
  );
}

// ── Document Panel ─────────────────────────────────────────────────────────
function AgreementPanel({ title, badge, fields, buildDoc, sendSubject }) {
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const doc = buildDoc({ ...form, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });

  const copyDoc = () => {
    navigator.clipboard.writeText(doc);
    setCopied('doc');
    setTimeout(() => setCopied(''), 2000);
  };

  const copyEmail = () => {
    const email = `Subject: ${sendSubject}\n\n${doc}`;
    navigator.clipboard.writeText(email);
    setCopied('email');
    setTimeout(() => setCopied(''), 2000);
  };

  const copySMS = () => {
    // SMS version: summary only
    const sms = `Hi, please see the attached PRN referral agreement from Dyson & Dyson. Reply to confirm acceptance or call Bob Dyson directly. Full agreement: ${doc.substring(0, 200)}…`;
    navigator.clipboard.writeText(sms);
    setCopied('sms');
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden mb-6" style={{ border: `2px solid ${GOLD}` }}>
      {/* Header */}
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4"
        style={{ background: '#0d0d0d' }}>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" style={{ color: GOLD }} />
          <div className="text-left">
            <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>{badge}</p>
            <p className="text-white font-bold text-sm">{title}</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5" style={{ color: GOLD }} />
          : <ChevronDown className="w-5 h-5" style={{ color: GOLD }} />}
      </button>

      {open && (
        <div style={{ background: '#fff8ee' }}>
          {/* Fill-in Fields */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
            <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: GOLD }}>FILL IN THE BLANKS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map(f => (
                <Field key={f.key} label={f.label} value={form[f.key] || ''} onChange={v => set(f.key, v)} placeholder={f.placeholder} />
              ))}
            </div>
          </div>

          {/* Document Preview */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
            <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: GOLD }}>DOCUMENT PREVIEW</p>
            <pre className="text-xs leading-relaxed p-4 rounded-xl overflow-x-auto whitespace-pre-wrap"
              style={{ background: '#ede0cc', color: '#2a1f0e', fontFamily: 'Georgia, serif', border: '1px solid rgba(212,175,55,0.3)', maxHeight: 420, overflowY: 'auto' }}>
              {doc}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 flex flex-wrap gap-3">
            <button onClick={copyDoc}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all hover:scale-[1.02]"
              style={{ background: copied === 'doc' ? 'rgba(16,185,129,0.15)' : `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: copied === 'doc' ? '#059669' : '#000', border: copied === 'doc' ? '1px solid rgba(16,185,129,0.4)' : 'none' }}>
              {copied === 'doc' ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Full Document</>}
            </button>
            <button onClick={copyEmail}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background: copied === 'email' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.12)', color: copied === 'email' ? '#059669' : '#6366f1', border: `1px solid ${copied === 'email' ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.3)'}` }}>
              {copied === 'email' ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Mail className="w-4 h-4" /> Copy as Email</>}
            </button>
            <button onClick={copySMS}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background: copied === 'sms' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)', color: copied === 'sms' ? '#059669' : '#059669', border: `1px solid ${copied === 'sms' ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.3)'}` }}>
              {copied === 'sms' ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><MessageSquare className="w-4 h-4" /> Copy SMS Summary</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Field Definitions ─────────────────────────────────────────────────────
const SENDING_FIELDS = [
  { key: 'sending_agent', label: 'Sending Agent Name', placeholder: 'Full name' },
  { key: 'sending_brokerage', label: 'Sending Brokerage', placeholder: 'Brokerage name' },
  { key: 'sending_dre', label: 'Agent DRE License #', placeholder: '#01234567' },
  { key: 'sending_email', label: 'Agent Email', placeholder: 'agent@firm.com' },
  { key: 'sending_phone', label: 'Agent Phone', placeholder: '(555) 000-0000' },
  { key: 'client_name', label: 'Client Full Name', placeholder: 'Client name' },
  { key: 'client_address', label: 'Client Current Address', placeholder: '123 Main St, City, CA' },
  { key: 'destination', label: 'Destination City / State', placeholder: 'Nashville, TN' },
  { key: 'move_date', label: 'Est. Move Date', placeholder: 'Q3 2025' },
  { key: 'budget', label: 'Estimated Budget', placeholder: '$600K–$800K' },
];

const RECEIVING_FIELDS = [
  { key: 'receiving_agent', label: 'Receiving Agent Name', placeholder: 'Full name' },
  { key: 'receiving_brokerage', label: 'Receiving Brokerage', placeholder: 'Brokerage name' },
  { key: 'receiving_license', label: 'State License #', placeholder: 'License number' },
  { key: 'receiving_email', label: 'Agent Email', placeholder: 'agent@firm.com' },
  { key: 'receiving_phone', label: 'Agent Phone', placeholder: '(555) 000-0000' },
  { key: 'destination_market', label: 'Destination Market', placeholder: 'Nashville, TN' },
  { key: 'sending_agent', label: 'Originating Agent Name', placeholder: 'Sending agent' },
  { key: 'sending_brokerage', label: 'Originating Brokerage', placeholder: 'Sending brokerage name' },
  { key: 'client_name', label: 'Client Full Name', placeholder: 'Client name' },
  { key: 'client_from', label: 'Client Current City', placeholder: 'Los Angeles, CA' },
  { key: 'budget', label: 'Property Budget', placeholder: '$600K–$800K' },
  { key: 'target_close', label: 'Target Close Date', placeholder: 'September 2025' },
];

// ── Page ──────────────────────────────────────────────────────────────────
export default function AdminPRNAgreements() {
  return (
    <div className="min-h-screen px-6 py-10" style={{ background: TAN }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black tracking-[0.3em] mb-2" style={{ color: GOLD }}>PRN · LEGAL DOCUMENTS</p>
          <h1 className="font-black text-3xl leading-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
            Referral Fee Agreements
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#4a3a28' }}>
            Fill in the blanks, then copy the full document to email or paste an SMS summary. Both forms are broker-to-broker compliant per California DRE regulations.
          </p>

          {/* Fee Summary Banner */}
          <div className="mt-5 rounded-2xl px-5 py-4 flex items-center gap-6"
            style={{ background: '#0d0d0d', border: `1px solid ${GOLD}` }}>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: GOLD }}>35%</p>
              <p className="text-[10px] font-bold tracking-widest text-white uppercase">Total Fee</p>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(212,175,55,0.3)' }} />
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: '#10b981' }}>25%</p>
              <p className="text-[10px] font-bold tracking-widest text-white uppercase">To Sending Agent</p>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(212,175,55,0.3)' }} />
            <div className="text-center">
              <p className="text-2xl font-black text-white">10%</p>
              <p className="text-[10px] font-bold tracking-widest text-white uppercase">To Dyson Mgmt</p>
            </div>
            <div className="flex-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Paid broker-to-broker at close of escrow. No fee owed if the transaction does not close.
            </div>
          </div>
        </div>

        {/* Agreement 1 — Sending Agent */}
        <AgreementPanel
          badge="FORM A · SECTION 19"
          title="Sending Agent Participation Agreement"
          fields={SENDING_FIELDS}
          buildDoc={buildSendingDoc}
          sendSubject="Dyson & Dyson — Managed Referral Participation Agreement (Please Review & Sign)"
        />

        {/* Agreement 2 — Receiving Agent */}
        <AgreementPanel
          badge="FORM B · SECTION 20"
          title="Receiving Agent Performance Agreement"
          fields={RECEIVING_FIELDS}
          buildDoc={buildReceivingDoc}
          sendSubject="Dyson PRN — Referral Acceptance Agreement (Action Required)"
        />

        {/* Legal Disclaimer */}
        <div className="rounded-2xl px-5 py-4 mt-4" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-[10px] leading-relaxed" style={{ color: '#6b5c45' }}>
            <strong style={{ color: GOLD }}>Legal Notice:</strong> These documents are templates prepared for internal use by Dyson & Dyson Real Estate. They do not constitute legal advice. All referral fee agreements must comply with California DRE regulations and applicable state laws in the Receiving Agent's jurisdiction. Dyson & Dyson recommends broker-of-record review before execution. CalDRE license number must be confirmed and inserted before distribution.
          </p>
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}