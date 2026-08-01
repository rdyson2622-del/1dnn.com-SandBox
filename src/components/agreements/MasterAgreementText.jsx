import React from 'react';

const S = ({ n, title, children }) => (
  <section className="mb-6">
    <h3 className="font-bold text-sm tracking-wide uppercase mb-2" style={{ color: '#1a1a1a' }}>
      Article {n} — {title}
    </h3>
    <div className="text-[13px] leading-relaxed space-y-2" style={{ color: '#222' }}>{children}</div>
  </section>
);

const Blank = ({ w = 'w-56' }) => <span className={`inline-block border-b border-black ${w} align-bottom`}>&nbsp;</span>;

const SigBlock = ({ role }) => (
  <div className="mb-6 break-inside-avoid">
    <p className="font-bold text-xs uppercase tracking-wide mb-3">{role}</p>
    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
      <p>Signature: <Blank /></p>
      <p>Date: <Blank w="w-32" /></p>
      <p>Printed Name: <Blank /></p>
      <p>License No.: <Blank w="w-40" /></p>
      <p>Brokerage / Company: <Blank /></p>
      <p>Email / Phone: <Blank w="w-40" /></p>
    </div>
  </div>
);

/**
 * MasterAgreementText — full text of the D&D Master Referral &
 * Relocation Management Agreement (print-ready).
 */
export default function MasterAgreementText() {
  return (
    <div className="bg-white text-black px-10 py-12 max-w-4xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>

      {/* Title */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase mb-1">The Dyson &amp; Dyson Companies, Inc.</p>
        <h1 className="text-xl font-bold uppercase tracking-wide mb-1">
          Master Referral &amp; Relocation Management Agreement
        </h1>
        <p className="text-xs">California Real Estate Broker · DRE #02303118 · (858) 353-1200</p>
      </div>

      {/* Parties */}
      <section className="mb-6 text-[13px] leading-relaxed space-y-2">
        <p>
          This Master Referral &amp; Relocation Management Agreement (the &ldquo;Agreement&rdquo;) is entered into as of
          <Blank w="w-40" /> (the &ldquo;Effective Date&rdquo;), by and among:
        </p>
        <p><strong>(a) The Dyson &amp; Dyson Companies, Inc.</strong>, a licensed California real estate broker, DRE #02303118 (&ldquo;D&amp;D&rdquo; or the &ldquo;Relocation Management Broker&rdquo;);</p>
        <p><strong>(b) Referring Broker:</strong> <Blank />, License No. <Blank w="w-32" />, and <strong>Referring Agent:</strong> <Blank />, License No. <Blank w="w-32" /> (collectively, the &ldquo;Referring Party&rdquo;); and</p>
        <p><strong>(c) Receiving Broker:</strong> <Blank />, License No. <Blank w="w-32" />, and <strong>Receiving Agent:</strong> <Blank />, License No. <Blank w="w-32" /> (collectively, the &ldquo;Receiving Party&rdquo;).</p>
        <p><strong>Regarding the Client:</strong> <Blank /> (the &ldquo;Client&rdquo;), and where applicable the Client&rsquo;s employer or its Human Resources department (the &ldquo;Corporate Sponsor&rdquo;).</p>
      </section>

      {/* Recitals */}
      <section className="mb-6 text-[13px] leading-relaxed space-y-2">
        <h3 className="font-bold text-sm tracking-wide uppercase mb-2">Recitals</h3>
        <p>A. D&amp;D operates a national and international relocation management platform through which relocating clients and corporate transferees are matched with production-vetted receiving agents, and through which the entire relocation process is professionally managed end to end.</p>
        <p>B. The Referring Party has referred the Client to D&amp;D. The Receiving Party has been selected by D&amp;D to represent the Client in the purchase and/or sale of real property (the &ldquo;Transaction&rdquo;).</p>
        <p>C. The parties acknowledge that two separate and distinct services are being compensated under this Agreement: <strong>(i)</strong> the referral of the Client (the &ldquo;Referral Function&rdquo;), and <strong>(ii)</strong> the professional management of the entire relocation process (the &ldquo;Relocation Management Function&rdquo;). These functions are independent of one another, and the fee for each is earned independently.</p>
        <p>D. D&amp;D is a licensed real estate broker, is <strong>not</strong> a party to the purchase or sale contract, does not act as the agent of record in the Transaction, and does not claim procuring cause beyond the fees described herein.</p>
      </section>

      <S n="1" title="Definitions">
        <p><strong>1.1 &ldquo;Gross Commission&rdquo;</strong> means the total commission actually received by the Receiving Broker attributable to the Receiving Party&rsquo;s side of the Transaction, before any broker/agent split, franchise fee, transaction fee, desk fee, or other internal deduction of the Receiving Broker.</p>
        <p><strong>1.2 &ldquo;Referral Fee&rdquo;</strong> means twenty-five percent (25%) of the Gross Commission, unless a different percentage is stated in Exhibit A.</p>
        <p><strong>1.3 &ldquo;Relocation Management Fee&rdquo;</strong> means a separate twenty-five percent (25%) of the Gross Commission, unless a different percentage is stated in Exhibit A.</p>
        <p><strong>1.4 &ldquo;Closing&rdquo;</strong> means the recordation of the deed and disbursement of funds in the Transaction, or the functional equivalent in the applicable jurisdiction.</p>
        <p><strong>1.5 &ldquo;Protection Period&rdquo;</strong> means twenty-four (24) months following the Effective Date.</p>
      </S>

      <S n="2" title="Structure of the Engagement — Two Distinct Functions">
        <p><strong>2.1 Referral Function.</strong> The Referring Party has performed a compensable referral by directing the Client into the D&amp;D platform. The Referral Fee compensates that function and nothing else.</p>
        <p><strong>2.2 Relocation Management Function.</strong> D&amp;D performs a separate, ongoing professional service: vetting and selecting the Receiving Party; coordinating the sale of the Client&rsquo;s existing home and purchase of the new home; managing escrow timelines and milestones; coordinating movers, utilities, schools, healthcare, and settle-in services; providing 24/7 AI concierge support; and reporting status to the Client and, where applicable, the Corporate Sponsor. The Relocation Management Fee compensates this function and nothing else.</p>
        <p><strong>2.3 Independence of Fees.</strong> The Receiving Party expressly acknowledges that the Relocation Management Fee is <strong>not</strong> a referral fee, is not duplicative of the Referral Fee, and is earned by D&amp;D through the performance of the Relocation Management Function regardless of which party procured the Client.</p>
      </S>

      <S n="3" title="Referral Fee">
        <p><strong>3.1 Amount.</strong> The Receiving Broker shall pay D&amp;D a Referral Fee equal to twenty-five percent (25%) of the Gross Commission on each Transaction closed for the Client during the Protection Period.</p>
        <p><strong>3.2 Pass-Through.</strong> D&amp;D receives the Referral Fee as broker-of-record for the referral and shall promptly remit the Referral Fee to the Referring Broker (for further distribution to the Referring Agent per their internal arrangement). D&amp;D retains no portion of the Referral Fee.</p>
        <p><strong>3.3 Broker-to-Broker Only.</strong> All fees under this Agreement are paid broker-to-broker in compliance with applicable real estate license law. No fee shall be paid directly to any salesperson.</p>
      </S>

      <S n="4" title="Relocation Management Fee">
        <p><strong>4.1 Amount.</strong> The Receiving Broker shall additionally pay D&amp;D a Relocation Management Fee equal to twenty-five percent (25%) of the Gross Commission on each Transaction closed for the Client during the Protection Period. D&amp;D retains this fee in full as compensation for the Relocation Management Function.</p>
        <p><strong>4.2 No Cost to Client or Corporate Sponsor.</strong> Neither the Client nor the Corporate Sponsor pays any relocation management fee, markup, or administrative charge. All D&amp;D compensation derives from commission funds already built into the Transaction.</p>
        <p><strong>4.3 Combined Effect.</strong> For clarity: the Receiving Broker retains fifty percent (50%) of Gross Commission (subject to Exhibit A adjustments); twenty-five percent (25%) passes through D&amp;D to the Referring Party; and twenty-five percent (25%) is retained by D&amp;D.</p>
      </S>

      <S n="5" title="Payment Mechanics">
        <p><strong>5.1 Escrow Instructions.</strong> The Receiving Broker shall instruct escrow/closing to disburse the Referral Fee and the Relocation Management Fee directly to D&amp;D at Closing. If direct disbursement is not available, the Receiving Broker shall remit both fees to D&amp;D within five (5) business days of receipt of commission.</p>
        <p><strong>5.2 Documentation.</strong> The Receiving Broker shall provide D&amp;D with the closing statement (or equivalent) evidencing the Gross Commission within three (3) business days of Closing.</p>
        <p><strong>5.3 Multiple Transactions.</strong> If the Client both sells and purchases through the Receiving Party, this Agreement applies separately to each Transaction.</p>
        <p><strong>5.4 Late Payment.</strong> Amounts unpaid more than fifteen (15) days after Closing bear interest at the lesser of 1.5% per month or the maximum lawful rate, plus D&amp;D&rsquo;s reasonable collection costs and attorneys&rsquo; fees.</p>
      </S>

      <S n="6" title="Equal Sweat Equity — Uniform Application of Terms">
        <p><strong>6.1 Principle.</strong> The parties acknowledge that the professional effort required to competently represent a client in the sale or purchase of a $300,000 home is substantially the same as for a $3,000,000 home. Accordingly, the fee structure in this Agreement applies uniformly and without renegotiation based on price point.</p>
        <p><strong>6.2 No Price-Based Renegotiation.</strong> The Receiving Party shall not condition, delay, or seek to renegotiate its acceptance of the Client, the fee percentages, or its service standards based on the value of the property involved. Acceptance of the referral constitutes acceptance of these terms at any transaction value.</p>
        <p><strong>6.3 Revenue Allocation Model.</strong> The Receiving Party acknowledges D&amp;D&rsquo;s application of commission funds is designed to secure fair, predictable revenue to the referring agent, the receiving agent, and their companies based on the terms and commitments of this Agreement — rather than on ad hoc percentage negotiations — and that this model is a material inducement for corporate HR departments and high-end residential clients to use the D&amp;D platform.</p>
      </S>

      <S n="7" title="Receiving Party Service Obligations">
        <p><strong>7.1 Compliance with Both Functions.</strong> The Receiving Party shall comply with the terms of both the Referral Function and the Relocation Management Function as set out in this Agreement and with all commitments made at signing, including any special commitments listed in Exhibit A.</p>
        <p><strong>7.2 Communication Inclusion.</strong> The Receiving Party shall include D&amp;D (at the address designated in the Notices section) on <strong>all</strong> email threads, text message threads, and material discussions concerning the Client and the Transaction, including offers, counteroffers, inspection issues, appraisal issues, escrow amendments, and closing scheduling. Verbal discussions of material significance shall be summarized to D&amp;D in writing within twenty-four (24) hours.</p>
        <p><strong>7.3 Status Reporting.</strong> The Receiving Party shall provide D&amp;D a written status update at least weekly, and immediately upon any of: offer submitted/received, acceptance, contingency removal or failure, escrow delay, or threatened cancellation.</p>
        <p><strong>7.4 Performance Standards.</strong> The Receiving Party shall respond to the Client within four (4) business hours, maintain active licensure and MLS access, carry errors &amp; omissions insurance, and perform to the standard of a competent, diligent professional in its market.</p>
        <p><strong>7.5 No Side Arrangements.</strong> The Receiving Party shall not enter into any side agreement with the Client, the Referring Party, or any third party that reduces, redirects, or circumvents the fees or duties in this Agreement.</p>
        <p><strong>7.6 Replacement.</strong> If the Receiving Party materially breaches this Article, D&amp;D may, after written notice and a five (5) business day cure period, reassign the Client to a different receiving agent, and the Receiving Party shall have no claim to any commission or fee on transactions closed after reassignment (except for a transaction already under binding contract with the Receiving Party as procuring cause).</p>
      </S>

      <S n="8" title="Role and Limitations of D&D">
        <p><strong>8.1 Not a Party to the Sales Contract.</strong> D&amp;D is not a party to, and shall not be named in, the purchase or sale agreement. The Receiving Broker is the broker of record for the Transaction and bears sole responsibility for agency duties, disclosures, and transaction-level compliance in its jurisdiction.</p>
        <p><strong>8.2 Licensed Broker.</strong> D&amp;D receives all fees hereunder in its capacity as a licensed California real estate broker.</p>
        <p><strong>8.3 No Agency in the Transaction.</strong> Nothing in this Agreement creates an agency, partnership, joint venture, or employment relationship among the parties. Each party is an independent contractor.</p>
        <p><strong>8.4 Corporate Sponsor Reporting.</strong> Where a Corporate Sponsor is involved, D&amp;D may provide the Corporate Sponsor with transaction status visibility. The Receiving Party consents to such reporting.</p>
      </S>

      <S n="9" title="Client Protection and Non-Circumvention">
        <p><strong>9.1 Protection Period.</strong> This Agreement covers any Transaction involving the Client (or the Client&rsquo;s spouse/domestic partner or an entity controlled by the Client) that goes under contract with the Receiving Party during the Protection Period, even if Closing occurs afterward.</p>
        <p><strong>9.2 Non-Circumvention.</strong> During the Protection Period and for twelve (12) months thereafter, the Receiving Party shall not solicit or accept, directly or indirectly, referrals of other transferees from the same Corporate Sponsor except through D&amp;D, and shall not use Client or Corporate Sponsor information obtained hereunder to circumvent D&amp;D.</p>
        <p><strong>9.3 Referring Party Protection.</strong> The Referring Party&rsquo;s right to the Referral Fee vests upon D&amp;D&rsquo;s acceptance of the referral and survives any subsequent reassignment of the Client to a different receiving agent.</p>
      </S>

      <S n="10" title="Corporate Relocation Provisions (Where Applicable)">
        <p><strong>10.1 Zero Employer Fees.</strong> The Corporate Sponsor pays no relocation management fee. The Receiving Party shall not bill, or attempt to bill, the Corporate Sponsor or the Client for any amount related to this engagement.</p>
        <p><strong>10.2 Confidential HR Matters.</strong> Information regarding the Client&rsquo;s employment, compensation, or relocation package is confidential and shall be used solely to perform under this Agreement.</p>
        <p><strong>10.3 Policy Compliance.</strong> The Receiving Party shall cooperate with any written relocation policy of the Corporate Sponsor provided to it, to the extent not inconsistent with law or this Agreement.</p>
      </S>

      <S n="11" title="Term and Termination">
        <p><strong>11.1 Term.</strong> This Agreement takes effect on the Effective Date and continues until the later of (a) Closing of all covered Transactions and payment of all fees, or (b) expiration of the Protection Period.</p>
        <p><strong>11.2 Termination for Cause.</strong> D&amp;D may terminate the Receiving Party&rsquo;s participation per Section 7.6. Any party may terminate for another party&rsquo;s uncured material breach on ten (10) days&rsquo; written notice.</p>
        <p><strong>11.3 Survival.</strong> Articles 3–6, 9, and 12–18 survive termination, and all fee obligations survive as to Transactions under contract before termination.</p>
      </S>

      <S n="12" title="Representations and Warranties">
        <p>Each broker and agent party represents that: (a) its real estate license is active and in good standing in the jurisdiction of the Transaction; (b) it is not subject to any pending disciplinary action material to this Agreement; (c) it maintains errors &amp; omissions insurance; and (d) execution of this Agreement does not violate any other agreement to which it is bound.</p>
      </S>

      <S n="13" title="Regulatory Compliance">
        <p><strong>13.1</strong> All fees hereunder are paid between licensed real estate brokers for real-estate-licensed activity, in compliance with applicable state license law and, to the extent applicable, Section 8 of RESPA (12 U.S.C. §2607), including the exemption for cooperative brokerage and referral arrangements between licensed real estate professionals.</p>
        <p><strong>13.2</strong> Each party is responsible for its own required disclosures to the Client under the law of its jurisdiction, including disclosure of referral and fee-sharing arrangements where required.</p>
        <p><strong>13.3</strong> If any fee provision is found unlawful in the Transaction jurisdiction, the parties shall reform it to the closest lawful economic equivalent.</p>
      </S>

      <S n="14" title="Confidentiality">
        <p>Each party shall keep confidential all non-public information regarding the Client, the Corporate Sponsor, the Transaction, and the terms of this Agreement, except disclosures required by law, regulators, escrow, or a party&rsquo;s professional advisors.</p>
      </S>

      <S n="15" title="Default and Remedies">
        <p>In addition to all remedies at law or equity: (a) failure to pay a fee when due is a material breach; (b) D&amp;D may notify escrow of its fee interest; (c) breach of Article 9 entitles D&amp;D to the fees it would have earned absent the circumvention; and (d) the prevailing party in any dispute is entitled to reasonable attorneys&rsquo; fees and costs.</p>
      </S>

      <S n="16" title="Dispute Resolution and Governing Law">
        <p><strong>16.1</strong> The parties shall first attempt good-faith mediation. Any unresolved dispute shall be settled by binding arbitration administered in San Diego County, California, under the rules of a mutually agreed arbitration provider, before a single arbitrator.</p>
        <p><strong>16.2</strong> This Agreement is governed by the laws of the State of California, without regard to conflicts-of-law rules, except that transaction-level brokerage conduct remains governed by the law of the Transaction jurisdiction.</p>
      </S>

      <S n="17" title="Indemnification">
        <p>The Receiving Party shall indemnify, defend, and hold harmless D&amp;D and the Referring Party from claims arising out of the Receiving Party&rsquo;s acts or omissions in the Transaction, including agency, disclosure, and licensing claims. Each other party shall likewise indemnify the others for claims arising from its own acts or omissions.</p>
      </S>

      <S n="18" title="Miscellaneous">
        <p><strong>18.1 Entire Agreement.</strong> This Agreement (with Exhibit A) is the entire agreement among the parties on its subject and supersedes all prior discussions. Amendments must be in a writing signed by all parties.</p>
        <p><strong>18.2 Notices.</strong> Notices shall be in writing to the emails/addresses on the signature pages; email notice is effective upon confirmed delivery.</p>
        <p><strong>18.3 Assignment.</strong> No party may assign this Agreement without the written consent of the others, except D&amp;D may assign to a successor licensed broker entity.</p>
        <p><strong>18.4 Severability; Waiver.</strong> Invalid provisions are severed; no waiver is effective unless in writing.</p>
        <p><strong>18.5 Counterparts; Electronic Signatures.</strong> This Agreement may be executed in counterparts, and electronic signatures (including DocuSign or equivalent) are binding.</p>
      </S>

      {/* Signatures */}
      <section className="mt-10">
        <h3 className="font-bold text-sm tracking-wide uppercase mb-4">Signatures</h3>
        <p className="text-[13px] mb-6">By signing below, each party acknowledges having read, understood, and agreed to all terms of this Agreement, including the separate and independent nature of the Referral Fee and the Relocation Management Fee.</p>
        <SigBlock role="The Dyson & Dyson Companies, Inc. — Broker (DRE #02303118)" />
        <SigBlock role="Referring Broker" />
        <SigBlock role="Referring Agent" />
        <SigBlock role="Receiving Broker" />
        <SigBlock role="Receiving Agent" />
      </section>

      {/* Exhibit A */}
      <section className="mt-10 break-inside-avoid">
        <h3 className="font-bold text-sm tracking-wide uppercase mb-3">Exhibit A — Transaction &amp; Fee Worksheet</h3>
        <div className="text-[13px] leading-loose space-y-2">
          <p>Client Name: <Blank /></p>
          <p>Corporate Sponsor (if any): <Blank /></p>
          <p>Origin Market: <Blank w="w-44" /> &nbsp;&nbsp; Destination Market: <Blank w="w-44" /></p>
          <p>Covered Transaction(s): ☐ Sale of existing home &nbsp; ☐ Purchase of new home &nbsp; ☐ Both</p>
          <p>Referral Fee: <Blank w="w-16" />% of Gross Commission (default 25%)</p>
          <p>Relocation Management Fee: <Blank w="w-16" />% of Gross Commission (default 25%)</p>
          <p>Special Commitments of Receiving Party made at signing:</p>
          <p><Blank w="w-full" /></p>
          <p><Blank w="w-full" /></p>
          <p><Blank w="w-full" /></p>
        </div>
      </section>
    </div>
  );
}