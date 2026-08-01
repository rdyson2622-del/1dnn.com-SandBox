import React, { useState } from 'react';

const GOLD = '#D4AF37';
const TAN = '#ede0cc';

const INITIAL_SECTIONS = [
  {
    id: 'overview',
    title: 'PRN OVERVIEW — WHAT IS THE PRIVATE REFERRAL NETWORK?',
    content: `The Private Referral Network (PRN) is Dyson & Dyson's exclusive, invitation-only ecosystem connecting vetted real estate agents and mortgage lenders with high-intent relocation clients. Unlike public directories or Zillow-style marketplaces, the PRN is a closed, curated network where every professional is personally vetted by Bob Dyson before being granted access.

The PRN is not a lead-generation platform. It is a referral management and co-marketing infrastructure designed to:
• Generate consistent, pre-qualified referral volume for partner agents and lenders
• Position Dyson & Dyson as the intelligence layer and relocation concierge for every transaction
• Build a recurring revenue model through subscription tiers and referral fee structures`
  },
  {
    id: 'agent_value',
    title: 'AGENT VALUE PROPOSITION',
    content: `What agents get when they join the PRN:

1. PRE-QUALIFIED REFERRALS — Every client handed off has already completed the Dyson intake process (Gemini Session), is commitment-gated, and has articulated their destination, timeline, and budget.

2. DNN CO-BRANDING — Partner agents are featured in the Dyson News Network (DNN) as "Bureau-Certified" professionals. Their name, photo, and bio appear alongside DNN intelligence briefs sent to thousands of subscribers.

3. RELOCATION CONCIERGE BACKUP — Dyson & Dyson remains actively embedded in the transaction as the relocation manager. Agents close deals; we handle the logistics, communications, and client anxiety.

4. ESCROW MONITORING — Our team monitors escrow milestones and surfaces issues early, reducing fall-through risk and improving close rates.

5. EXCLUSIVE MARKET ACCESS — PRN agents are the only professionals recommended to Dyson clients in their designated market. No competition within the same territory.`
  },
  {
    id: 'subscription_tiers',
    title: 'AGENT SUBSCRIPTION TIERS',
    content: `The PRN operates on a tiered subscription model:

── BRONZE TIER ($X/month) ──
• Listed in the DNN Agent Bureau directory
• Basic co-branding on DNN articles (city-level)
• Up to 2 referrals per quarter
• Access to Dyson relocation materials and scripts

── SILVER TIER ($X/month) ──
• Everything in Bronze
• Featured placement in DNN Morning Brief (monthly rotation)
• Up to 5 referrals per quarter
• Dedicated co-brand label: "Brought to you by DNN in partnership with [Agent Name]"
• Priority escrow monitoring

── GOLD TIER ($X/month) ──
• Everything in Silver
• Exclusive territory lock — no competing PRN agent in your market
• Unlimited referral volume
• Bob Dyson personal introduction for high-value clients
• Featured video segment in DNN News Feed
• Quarterly performance review call with Dyson team

NOTE: Pricing placeholders above ($X) to be finalized. Replace with agreed monthly rates.`
  },
  {
    id: 'referral_fee',
    title: 'REFERRAL FEE STRUCTURE',
    content: `In addition to the subscription fee, PRN agents pay a referral fee on closed transactions originated through the Dyson network:

• Standard Referral Fee: 25% of gross commission on buyer-side transactions
• Seller-Side (Listing Referral): 20% of gross commission
• Dual-Side (Buy + Sell through Dyson client): 30% of total gross commission

All referral fee agreements are documented via the Dyson Referral Agreement (generated automatically through the platform) and signed digitally before client introduction.

IMPORTANT: Referral fees are earned by the Dyson Referral Group (CalDRE #XXXXXXX) and are only payable broker-to-broker per California DRE regulations.`
  },
  {
    id: 'onboarding',
    title: 'AGENT ONBOARDING PROCESS',
    content: `How an agent enters the PRN:

STEP 1 — REFERRAL OR APPLICATION
Agent is referred by an existing PRN member or applies through the DNN Agent Bureau page. Cold applicants go through a longer vetting period.

STEP 2 — BOB DYSON VETTING CALL (30 min)
Personal conversation covering: transaction volume, market specialties, communication style, client service philosophy, and personality fit. This is a relationship business — culture matters.

STEP 3 — LICENSE & BACKGROUND VERIFICATION
DRE license check, NMLS (for lenders), recent transaction history, online reputation audit (Zillow/Google reviews), and reference call with a past client.

STEP 4 — SUBSCRIPTION AGREEMENT SIGNED
Agent selects tier, signs the PRN Subscription Agreement, and provides billing info. Monthly subscription begins.

STEP 5 — ONBOARDING BRIEF
Agent receives Dyson Relocation Protocol guide, co-brand assets, introduction to Charlie (AI concierge), and escrow monitoring enrollment.

STEP 6 — FIRST REFERRAL INTRODUCTION
Dyson team makes the warm introduction. Agent receives full client intake summary, Gemini Session notes, and escrow setup checklist.`
  },
  {
    id: 'agent_obligations',
    title: 'AGENT OBLIGATIONS & STANDARDS',
    content: `PRN agents agree to the following standards of conduct:

• RESPONSE TIME: All Dyson client introductions must be acknowledged within 2 hours. First client contact must occur within 24 hours.

• COMMUNICATION TRANSPARENCY: Agents agree to copy the Dyson team (or designated inbox) on all major milestone communications with the client during the transaction.

• REPORTING: Agents submit a brief status update (via the platform or text) at each escrow milestone: offer accepted, inspection complete, contingencies released, clear to close, funding.

• CLIENT EXPERIENCE STANDARD: Clients are the priority. Any agent who receives more than 2 documented complaints from Dyson clients is placed on probation and may be removed from the PRN.

• EXCLUSIVITY RESPECT: Gold-tier agents may not refer Dyson clients to competing agents or lenders outside the PRN without written consent.`
  },
  {
    id: 'revenue_model',
    title: 'DYSON PRN REVENUE MODEL',
    content: `Revenue streams generated by the PRN for Dyson & Dyson:

1. SUBSCRIPTION REVENUE
Monthly recurring revenue from Bronze/Silver/Gold agent subscriptions. Target: 20 active PRN agents at average $X/month = $XX,XXX/month ARR.

2. REFERRAL FEE INCOME
25% referral fee on each closed transaction. At average commission of $15,000/side, each closed Dyson referral generates $3,750 in referral income.

3. DNN FEATURED PLACEMENT FEES
Agents and lenders pay a premium to be featured in DNN newsletters, social posts, and article co-branding campaigns. Separate from subscription.

4. LENDER PARTNER FEES
Vetted lenders pay a parallel structure — subscription + per-referral fee — mirroring the agent model.

5. WHITE-LABEL CONTENT LICENSING
Agents may license DNN-produced market intelligence content (articles, morning briefs) under their own brand for use in their client communications.

PROJECTED ANNUAL PRN REVENUE TARGET: $XXX,XXX (to be modeled based on finalized pricing)`
  },
  {
    id: 'competitive_moat',
    title: 'COMPETITIVE MOAT — WHY AGENTS STAY',
    content: `The PRN is defensible because it is not a commodity lead service. Agents who join receive:

• RELATIONSHIP CAPITAL — A personal endorsement from Bob Dyson carries significant weight in the relocation and referral community. Agents become associated with a 55-year legacy brand.

• PRE-SOLD CLIENTS — Dyson clients arrive having already been educated by Charlie, guided through the Gemini Session, and committed to the relocation process. The agent doesn't sell the client on moving — they execute the plan.

• RECURRING VOLUME — Unlike one-off referral networks, PRN agents receive a predictable pipeline as Dyson scales DNN subscriber acquisition and outreach campaigns.

• CO-MARKETING INFRASTRUCTURE — Agents gain access to a content marketing machine (DNN) they could not build themselves. Their faces and markets get broadcast to thousands of subscribers organically.

• LOYALTY THROUGH RESULTS — Agents who perform well become the permanent go-to for their market. The Dyson team actively protects their territory and promotes their success stories in the Bureau Story Hub.`
  },
  {
    id: 'flat50_stripe',
    dividerAbove: true,
    title: 'SECTION 10: THE "FLAT $50" STRIPE UTILITY (THE "S" SERVICE)',
    content: `Logic: Pre-paid fuel model. No skip-trace or data request can be executed unless the user has a positive credit balance. This prevents delivery glitches and manual refunds.

Interface: When the balance hits zero, a Stripe-hosted modal appears for a Flat $50 Refill.`
  },
  {
    id: 'vendor_affiliate',
    dividerAbove: true,
    title: 'SECTION 11: VENDOR & AFFILIATE DATA ACCESS',
    content: `Target: Contractors, Appraisers, and Inspectors.

Utility: Vendors get skip-trace access at a $1.50 "Partner Rate" to verify property ownership and "stories" before rolling a truck.`
  },
  {
    id: 'lender_agent_loop',
    dividerAbove: true,
    title: 'SECTION 12: AUTOMATED LENDER-TO-AGENT LOOP',
    content: `Logic: Every agent skip-trace result automatically attaches a "Rate-Solve" financing scenario from their paired lender partner.`
  },
  {
    id: 'respa_msa',
    dividerAbove: true,
    title: 'SECTION 13: RESPA-COMPLIANT MSA FRAMING',
    content: `Logic: All partnerships are structured as broker-to-broker referrals or co-marketing MSAs to ensure full legal compliance while scaling to 100 cities.`
  },
  {
    id: 'skip_trace_interface',
    dividerAbove: true,
    title: 'SECTION 14: THE SKIP-TRACE RESULT INTERFACE',
    content: `The "Reveal" Logic: When a trace is successful, the data must be presented in a "Dyson Gold" branded pill — clean, credentialed, and immediately actionable.

DATA POINTS INCLUDED IN EVERY RESULT PILL:

1. Owner Identity
   Full Name + Current Mailing Address (verified against county records).

2. Contact Intel
   Up to 3 verified phone numbers (each flagged for DNC status) and 2 verified email addresses.

3. Property Story
   Instant link to the property's last sale date and estimated current equity position — giving the agent context before the first call.

4. The Lender Solve
   A "One-Click" button to send this full data package directly to the agent's paired Lender partner for a "Rate-Solve" financing scenario — completing the loop from lead identification to financing intelligence in a single workflow.

WHY THIS COMPLETES THE BLUEPRINT:

This interface is the product. Everything else in this plan — the subscriptions, the tiers, the vendor network, the lender loop — exists to deliver this one moment: an agent opens a skip-trace result and has every tool they need to convert a cold homeowner into a client conversation.

Revenue defined (Stripe tiers).
Users defined (Vendors, Agents, Lenders).
Product defined (This Interface).

The 14-Section PRN Master Plan is complete.`
  },
  {
    id: 'pending_affiliate_roster',
    dividerAbove: true,
    title: 'SECTION 15: THE "PENDING AFFILIATE" ROSTER & B2B RECOVERY',
    content: `The Logic: Instead of "cold calling" agents, we build a national roster of 1,000+ agents based on performance data (Gemini/PropStream vetted). They are entered as "Pending Affiliates."

The B2B Hook: We target high-volume agents in destination cities (Nashville, Boise, etc.) with the "Escrow Rescue" proposition. We fix their "stuck" CA buyer's home sale so they can close their deal.

The Roster Strategy: We promote these agents on DysonHome.com within a "Vetted City Directory." We share their stats and performance, but keep the contact "blind" (Contact goes to Dyson first).

The Conversion: Once an agent realizes we are already promoting them and have a "Rescue" case for them, they are moved from "Pending" to "Active PRN Member" at no cost, provided they agree to the Dyson 8-Phase Logistics protocol.

── ROSTER WORKFLOW ──
1. IDENTIFY — Use Gemini + PropStream to pull top-volume agents in target destination cities (50+ transactions/year, strong close rates).
2. ENTER — Add them to the PartnerAgent entity with status: "prospect" and a note: "Pending Affiliate — not yet contacted."
3. PROMOTE — Feature their stats in the DNN Vetted City Directory with blind contact routing (all inquiries come to Dyson inbox first).
4. RESCUE TRIGGER — When a Dyson client's CA escrow is stalled, we identify the destination agent in our roster and reach out with the live case.
5. CONVERT — Agent sees the value (free promotion + a live deal), agrees to the 8-Phase Protocol, and is upgraded to Active PRN Member.

This eliminates cold outreach entirely. Every agent "onboarded" has already been warmed by the Directory and pulled in by a real deal.`
  },
  {
    id: 'force_multiplier_roster',
    dividerAbove: true,
    title: 'SECTION 16: THE "FORCE MULTIPLIER" ROSTER (B2B AUDIENCE BUILDING)',
    content: `The "Trojan Horse" Strategy: To build a "Day One" audience, we utilize Gemini and PropStream data to identify top-performing agents in key destination cities (Nashville, Boise, etc.).

The "Pending Affiliate" Status: These agents are automatically entered into a "Vetted Directory" as "Pending Affiliates." This creates immediate SEO value and a "Seat at the Table" that agents can later "Claim."

The Zero-Friction Entry: We offer these agents exposure and "Escrow Rescue" support at no upfront cost. We do not require complex T&Cs — only adherence to the Dyson 8-Phase Logistics protocol for mutual clients.

The Vetting Authority: Dyson & Dyson acts as the "Third-Party Vetting Authority." We tell the public "Don't go to an agent first" precisely because we are the ones who filter the noise to find the top 1% who meet our logistics standards.

Future Value: This roster creates the "inventory" for the Agent Side of the app (the $50 Stripe Refills and $1.50 Skip Traces) to be activated as these agents are transitioned from "Pending" to "Active" members.

── THE DYSON VETTING CRITERIA (2025 DATA SET) ──

Tier 1 (Elite): 50+ Sales of Record or $40M+ Volume. (Target for "Rescue" Partners).

Tier 2 (Mid-Market): 20–49 Sales of Record. (Target for standard Relo moves).

Tier 3 (Specialist): High Avg. Price Point ($1.5M+) regardless of volume. (Target for Luxury Story-Solving).

Logic: Performance data is used to justify the "Pending" status. Charlie AI will reference these specific stats when an agent asks why they were selected.

── HOW THIS CONNECTS TO THE FULL BLUEPRINT ──
• Section 15 (Pending Affiliate Roster) = The identification and entry strategy
• Section 16 (Force Multiplier) = The audience-building and authority rationale
• Section 14 (Skip-Trace Interface) = The monetization layer that activates once agents go Active
• Section 10 (Flat $50 Stripe) = The fuel model that sustains ongoing agent tool usage

Together, these four sections form a self-reinforcing flywheel: we build the roster → agents claim profiles → agents use tools → tools generate recurring revenue.`
  },
  {
    id: 'sending_agent_bridge',
    dividerAbove: true,
    title: 'SECTION 17: THE "SENDING AGENT" REVENUE BRIDGE',
    content: `The Core Audience: We prioritize the "Exodus Markets" (LA, SF, Seattle, Chicago). These agents are the "Senders."

The Problem: Sending agents are often "flying blind" when referring clients out of state. They risk their reputation and their 25% referral fee on agents they don't know.

The Dyson Solution: We offer the Sending Agent a "National Vetting Desk." We vet the destination agent using 2025 performance data and manage the logistics, ensuring the Sending Agent's referral fee is protected and the client is handled with elite care.

The Monetization: Dyson & Dyson sits in the middle of the "Sending" and "Receiving" transaction, capturing management fees or referral splits for providing the "Vetting and Logistics" infrastructure.`
  },
  {
    id: 'boutique_focus',
    dividerAbove: true,
    title: 'SECTION 18: STRATEGIC EXCLUSION — THE BOUTIQUE FOCUS',
    content: `Target Audience: Independent Boutique Brokerage Firms (Excluding Compass, Coldwell Banker, Sotheby's, C21, etc.).

The Logic: These firms represent ~50% of the market but lack internal national relocation departments. Dyson & Dyson acts as their "De Facto Relo Department," providing them with national reach without the corporate overhead or commission-grabbing "Relo Fees" of the big franchises.

The Value Prop: We protect the Boutique Agent's referral fee and provide elite-level logistics that match their high-end, personalized brand.

── WHY WE EXCLUDE THE BIG FRANCHISES ──

Compass, Coldwell Banker, Sotheby's, Century 21, and similar national brands already have internal relocation divisions that:
• Skim 30–40% of the referring agent's commission via corporate "Relo Fees"
• Prioritize in-house agent assignment over best-fit client matching
• Provide cookie-cutter logistics with no personalized concierge layer

These franchises are not our partners. They are our competition for the boutique agent's loyalty.

── THE BOUTIQUE AGENT PROFILE ──

• 10–80 agents at the firm level (non-franchise, independently owned)
• Typically high average price point ($800K–$3M+ per transaction)
• Deep local market expertise but zero national infrastructure
• Client relationships are personal — referrals are reputation-critical
• Terrified of sending a client out of state and losing them (or their fee)

── HOW DYSON FILLS THE GAP ──

1. DE FACTO RELO DEPARTMENT — The boutique firm promotes Dyson & Dyson as their "national relocation partner." Their agents refer out with confidence because Dyson manages the destination side completely.

2. FEE PROTECTION — We guarantee the referring boutique agent's 25% referral fee is documented, tracked, and enforced through our PRN referral agreement — something a big franchise would never do on their behalf.

3. BRAND ALIGNMENT — Boutique firms compete on white-glove service. Our concierge model (Charlie AI + dedicated Relocation Manager + escrow monitoring) matches their brand promise perfectly. No cookie-cutter handoffs.

4. CO-MARKETING EXCLUSIVITY — PRN Boutique Partners are co-branded in DNN, positioning both firms as elite relocation specialists in their market. No big franchise agent gets this benefit.

── OUTREACH STRATEGY ──

• Identify top-performing boutique brokerages in target Exodus markets (LA, SF, Seattle, Chicago)
• Approach the broker/owner directly — not the individual agent
• Pitch: "We are your national relocation department. You keep 75% of every referral your agents send out. We handle everything else."
• Offer a 90-day pilot: one or two live referral cases, managed end-to-end, at no upfront cost to the firm

── EXCLUSION POLICY ──

The following franchise brands are permanently excluded from PRN partnership consideration:
Compass · Coldwell Banker · Sotheby's International Realty · Century 21 · RE/MAX · Berkshire Hathaway HomeServices · Keller Williams · eXp Realty · Better Homes & Gardens Real Estate

Exception: Individual agents who have recently left a franchise and joined an independent firm may be considered after a 6-month waiting period.`
  },
  {
    id: 'sending_agent_agreement',
    dividerAbove: true,
    title: 'SECTION 19: SENDING AGENT PARTICIPATION AGREEMENT',
    content: `Title: Dyson & Dyson Managed Referral Opt-In

THE COMMITMENT:
By submitting a referral to Dyson & Dyson, the Sending Brokerage authorizes Dyson & Dyson to act as the Relocation Manager for the duration of the transaction.

FEE STRUCTURE:
• Dyson & Dyson will secure a 25% Referral Fee for the Sending Brokerage.
• Dyson & Dyson will collect a separate 10% Management Fee from the Receiving Broker.
• Total fee at destination: 35% of the Receiving Broker's gross commission.

OUR PROMISE:
We vet the destination agent, manage the full logistics protocol, and provide real-time milestone tracking through the DysonRelo Portal. The Sending Brokerage receives their 25% check at closing, managed by our compliance team — with zero logistics overhead on their end.`
  },
  {
    id: 'receiving_agent_agreement',
    title: 'SECTION 20: RECEIVING AGENT PERFORMANCE AGREEMENT',
    content: `Title: Dyson Private Referral Network – Referral Acceptance

FEE AGREEMENT:
The Receiving Brokerage agrees to pay a total referral/management fee of 35% of the gross commission earned on the subject transaction.

DISTRIBUTION:
• 25% shall be paid to the [Originating Brokerage] (the Sending Agent's firm)
• 10% shall be paid to Dyson & Dyson Relocation Management

PERFORMANCE STANDARD:
Acceptance of this lead requires:
1. A 24-hour initial client contact guarantee from the time of introduction.
2. Weekly status updates submitted via the DysonRelo Portal at each escrow milestone.
3. Failure to update the portal may result in removal from the Vetted Partner Roster.

NOTE: Both agreements are generated automatically through the platform and signed digitally before any client introduction is made. All referral fees are paid broker-to-broker in compliance with applicable DRE regulations.`
  },
  {
    id: 'stay_in_loop',
    dividerAbove: true,
    title: 'SECTION 21: THE "STAY-IN-THE-LOOP" PROTOCOL',
    content: `Definition: The Sending Agent receives an automated push/email at every major milestone of the transaction — roughly every 10% of progress toward close.

MILESTONE TRIGGER EMAILS:

EMAIL 1 — Referral Accepted & Vetting Complete
Subject: We've secured your 25% referral for [Client Name]
Body: Hi [Sending Agent Name], great news. We have successfully vetted the destination agent in [Destination City] for your client, [Client Name]. We have executed the Receiving Agent Performance Agreement, securing a total 35% fee (25% for you / 10% for Dyson Management). You can track the live roadmap and logistics here: [Link to Sending Agent Tracker]

EMAIL 2 — Inspection/Appraisal Passed
Subject: [Client Name] is one step closer to closing in [City]
Body: Just a quick update on your referral. The destination property has cleared the [Inspection/Appraisal] phase. Our management team is ensuring the logistics remain on schedule. Your 25% referral fee is tracked and scheduled for collection upon close. View the full timeline here: [Link to Sending Agent Tracker]

FUTURE TRIGGERS (to be automated):
• Offer Accepted
• Contingencies Released
• Clear to Close
• Funding Confirmed
• Check Issued

PURPOSE: Keeps the Sending Agent emotionally connected to the check — reinforcing that Dyson is actively managing the outcome on their behalf. This loyalty loop is what turns a one-time referral into a repeat partner.`
  },
  {
    id: 'managed_fee_collection',
    dividerAbove: true,
    title: 'SECTION 22: MANAGED FEE COLLECTION — THE "ESCROW SHIELD"',
    content: `Definition: Dyson & Dyson handles all "bad cop" work of collecting the 35% from the destination broker and distributing the 25% back to the boutique partner at closing.

THE COLLECTION PROCESS:

1. AGREEMENT FIRST — Before any client introduction is made, the Receiving Agent signs the Performance Agreement committing to the 35% total fee (25% Sending / 10% Dyson).

2. ESCROW INSTRUCTION — Dyson's compliance team submits a written demand to escrow at opening, ensuring the fee split is embedded in the closing instructions before the transaction proceeds.

3. MILESTONE MONITORING — The PRN portal tracks escrow progress. If the Receiving Agent goes dark or updates stall, Dyson escalates directly — the Sending Agent never has to chase.

4. DISTRIBUTION AT CLOSE — Upon funding, escrow cuts two checks: 25% to the Sending Broker and 10% to Dyson Relocation Management (CalDRE #XXXXXXX). Both paid broker-to-broker per DRE regulations.

5. CONFIRMATION SENT — Sending Agent receives a final "Your check is on the way" email with the net amount and expected delivery date.

THE REVENUE MATH (Per Transaction):
• Average Transaction: $1,000,000
• Gross Commission (3%): $30,000
• Sending Agent Fee (25%): $7,500 — pure profit for your boutique partner
• Dyson Management Fee (10%): $3,000 — Dyson's earned revenue for the bridge
• Total Referral Cost to Receiver: $10,500 (35%)

WHY THIS MATTERS: The biggest fear of the independent boutique agent is that their 25% disappears in the chaos of a cross-state transaction. By embedding the fee demand directly into escrow instructions — and monitoring every milestone — Dyson eliminates that fear entirely. We are the Escrow Shield.`
  },
  {
    id: 'notes',
    title: 'INTERNAL NOTES & OPEN ITEMS',
    content: `Items to finalize before PRN launch:

[ ] Finalize Bronze / Silver / Gold monthly subscription pricing
[ ] Confirm referral fee percentages with legal/compliance review (CA DRE broker-to-broker)
[ ] Set CalDRE license number in all referral agreement templates
[ ] Build out the agent-facing PRN enrollment page (public-facing)
[ ] Define "territory" parameters — zip code level? City? County?
[ ] Create automated referral agreement generation flow in platform
[ ] Set up PRN agent portal view (separate from admin)
[ ] Launch first cohort: target 5 Gold agents in top Dyson destination markets
[ ] Draft PRN pitch deck for agent recruitment outreach
[ ] Schedule Bob Dyson intro video for PRN landing page`
  },
];

export default function AdminPRNAgentPlan() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [editing, setEditing] = useState(null); // id of section being edited
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  const startEdit = (section) => {
    setEditing(section.id);
    setEditTitle(section.title);
    setEditContent(section.content);
  };

  const saveEdit = () => {
    setSections(prev => prev.map(s => s.id === editing ? { ...s, title: editTitle, content: editContent } : s));
    setEditing(null);
  };

  const deleteSection = (id) => {
    if (window.confirm('Remove this section?')) {
      setSections(prev => prev.filter(s => s.id !== id));
    }
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    const id = `section_${Date.now()}`;
    setSections(prev => [...prev, { id, title: newSectionTitle.toUpperCase(), content: 'Add your content here...' }]);
    setNewSectionTitle('');
    setShowAddSection(false);
    setTimeout(() => startEdit({ id, title: newSectionTitle.toUpperCase(), content: 'Add your content here...' }), 100);
  };

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: TAN }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black tracking-[0.3em] mb-1" style={{ color: GOLD }}>PRIVATE REFERRAL NETWORK</p>
          <h1 className="font-black text-3xl tracking-tight mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
            PRN Agent Business Plan
          </h1>
          <p className="text-sm" style={{ color: '#6b5c45' }}>
            Internal strategy document — agent involvement, subscription model, and revenue architecture.
            <br />Click any section to edit. Add or remove sections as needed.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id}>
            {section.dividerAbove && (
              <hr style={{ border: 'none', borderTop: '2px solid rgba(212,175,55,0.5)', margin: '8px 0 24px 0' }} />
            )}
            <div className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>

              {editing === section.id ? (
                /* ── EDIT MODE ── */
                <div className="p-6">
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full font-black text-sm tracking-[0.15em] uppercase mb-4 px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#ede0cc', border: `1px solid ${GOLD}`, color: '#1a1a1a' }}
                  />
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={16}
                    className="w-full text-sm leading-relaxed px-3 py-3 rounded-lg outline-none resize-y"
                    style={{ background: '#ede0cc', border: `1px solid ${GOLD}`, color: '#2a1f0e', fontFamily: 'Georgia, serif' }}
                  />
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveEdit}
                      className="px-5 py-2 rounded-full text-sm font-bold"
                      style={{ background: GOLD, color: '#000' }}>
                      Save
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="px-5 py-2 rounded-full text-sm font-bold"
                      style={{ background: 'rgba(0,0,0,0.08)', color: '#444' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <div>
                  <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.07)' }}>
                    <p className="text-xs tracking-[0.2em] uppercase" style={{ color: GOLD, fontWeight: section.dividerAbove ? 900 : 800, fontSize: section.dividerAbove ? '0.8rem' : undefined }}>
                      {section.title}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(section)}
                        className="text-xs px-3 py-1 rounded-full font-semibold transition-all hover:opacity-80"
                        style={{ background: GOLD, color: '#000' }}>
                        Edit
                      </button>
                      <button onClick={() => deleteSection(section.id)}
                        className="text-xs px-3 py-1 rounded-full font-semibold transition-all hover:opacity-80"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#2a1f0e', fontFamily: 'Georgia, serif' }}>
                      {section.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
            </div>
          ))}
        </div>

        {/* Add Section */}
        <div className="mt-8">
          {showAddSection ? (
            <div className="rounded-2xl p-6" style={{ background: '#fff8ee', border: `2px dashed ${GOLD}` }}>
              <p className="text-xs font-black tracking-[0.2em] uppercase mb-3" style={{ color: GOLD }}>NEW SECTION TITLE</p>
              <input
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSection()}
                placeholder="e.g. LENDER CROSS-SELL STRATEGY"
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none mb-4"
                style={{ background: '#ede0cc', border: `1px solid ${GOLD}`, color: '#1a1a1a' }}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={addSection}
                  className="px-5 py-2 rounded-full text-sm font-bold"
                  style={{ background: GOLD, color: '#000' }}>
                  Add Section
                </button>
                <button onClick={() => setShowAddSection(false)}
                  className="px-5 py-2 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(0,0,0,0.08)', color: '#444' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddSection(true)}
              className="w-full py-4 rounded-2xl text-sm font-bold tracking-widest transition-all hover:opacity-80"
              style={{ background: 'transparent', border: `2px dashed rgba(212,175,55,0.4)`, color: GOLD }}>
              + ADD NEW SECTION
            </button>
          )}
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
}