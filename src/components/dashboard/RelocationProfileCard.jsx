import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, DollarSign, Edit3, Check, X, AlertTriangle,
  ChevronDown, ChevronUp, Clock, TrendingUp, RotateCcw, MapPinned,
  Wallet, Building, ClipboardList, Sparkles, Info, Phone, Mail,
  FileSignature, Home, Search, FileText, Key, Truck,
  ShieldCheck, DollarSign as DollarIcon, Scale, CheckCircle2
} from 'lucide-react';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GOLD = '#D4AF37';

const CAUTIONS = [
  { icon: Clock, title: 'Timeline Shifts', desc: 'Escrow delays, lease endings, or job start dates can push your move by weeks. Stay flexible and keep your agent briefed.', color: '#60a5fa' },
  { icon: MapPinned, title: 'Destination Changes', desc: 'It\'s common to pivot neighborhoods or even cities mid-search. Your profile updates automatically when you do.', color: '#a78bfa' },
  { icon: Building, title: 'Failed Escrow', desc: 'Discovery and due diligence uncover surprises. A deal falling through is not a failure — it\'s the system working for you.', color: '#f87171' },
  { icon: Wallet, title: 'Budget Pivots', desc: 'Rate changes, inspection costs, and appraisal gaps shift budgets. Update your range here any time.', color: '#fbbf24' },
  { icon: RotateCcw, title: 'Part-of-Town Restarts', desc: 'A neighborhood that looked perfect on paper may not feel right in person. Charlie tracks every pivot so nothing is lost.', color: '#34d399' },
  { icon: ClipboardList, title: 'Start-Overs', desc: 'Starting fresh with a new agent, a new area, or a new timeline happens more than you think. Your profile evolves with you.', color: '#f472b6' },
];

const BUDGET_OPTIONS = ['Under $300,000', '$300k – $500k', '$500k – $750k', '$750k – $1 million', '$1M – $1.5M', 'Over $1.5 million'];
const TIMELINES = ['Within 3 months', '3–6 months', '6–12 months', '12+ months', 'Just exploring'];

// Forward progress milestones shown as horizontal scroll after Buyer Broker
const FORWARD_MILESTONES = [
  {
    id: 'search_active',
    label: 'Property Search',
    icon: Search,
    phase: 'search',
    reminder: 'Your agent is actively searching based on your criteria. New listings matching your profile are reviewed daily. Expect curated shortlists — not a firehose of homes.',
    tip: 'Refine your must-haves vs. nice-to-haves now so your agent can narrow fast.'
  },
  {
    id: 'properties_viewed',
    label: 'Touring Homes',
    icon: Home,
    phase: 'search',
    reminder: 'You\'ll tour homes in batches — typically 4–8 at a time. Take notes and photos. Charlie tracks every property you see.',
    tip: 'Your gut feeling matters. Rate each home 1–5 on your Property Comparison page.'
  },
  {
    id: 'offer',
    label: 'Offer Made',
    icon: FileText,
    phase: 'offer',
    reminder: 'Your agent crafts a competitive offer based on comps, days on market, and seller motivation. Be ready to move fast in competitive markets.',
    tip: 'Pre-approval letter should already be in hand before touring. If not, do it now.'
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    icon: Scale,
    phase: 'offer',
    reminder: 'Counter-offers are normal. Stay calm and trust your agent\'s read on the seller. Focus on net price, not just list price.',
    tip: 'Decide your walk-away number before negotiations start — emotions run high.'
  },
  {
    id: 'under_contract',
    label: 'Under Contract',
    icon: FileSignature,
    phase: 'escrow',
    reminder: 'Congratulations! You\'re under contract. Now begins the due diligence period — inspection, appraisal, and financing contingencies.',
    tip: 'Do NOT make major financial changes (new credit, job change) during this period.'
  },
  {
    id: 'inspection',
    label: 'Inspection',
    icon: ShieldCheck,
    phase: 'escrow',
    reminder: 'A professional inspector examines the home top to bottom. Expect a 200–400 item report. Most findings are normal — focus on big-ticket items.',
    tip: 'Attend the inspection in person. It\'s educational and worth every minute.'
  },
  {
    id: 'appraisal',
    label: 'Appraisal',
    icon: DollarIcon,
    phase: 'escrow',
    reminder: 'Your lender orders an independent appraisal to confirm the home\'s value. If it comes in low, you\'ll negotiate with the seller or cover the gap.',
    tip: 'Your agent can provide the appraiser with comparable sales data to support value.'
  },
  {
    id: 'clear_to_close',
    label: 'Clear to Close',
    icon: CheckCircle2,
    phase: 'escrow',
    reminder: 'Final loan approval is in. You\'ll receive a Closing Disclosure 3 days before closing. Review every line item carefully.',
    tip: 'Wire funds early — closing day wires can delay possession if they arrive late.'
  },
  {
    id: 'closing',
    label: 'Closing Day',
    icon: Key,
    phase: 'closing',
    reminder: 'You\'ll sign a stack of documents, pay closing costs, and receive the keys. The whole process takes 1–2 hours.',
    tip: 'Bring government-issued ID. Everything else your agent and escrow officer will handle.'
  },
  {
    id: 'moved_in',
    label: 'Moved In!',
    icon: Truck,
    phase: 'post',
    reminder: 'Welcome home! Now it\'s time to set up utilities, update your address, find local services, and get settled. Charlie can help with all of it.',
    tip: 'File your homestead exemption right away — deadlines vary by state.'
  },
];

// 90-day countdown for buyer broker
function getBuyerBrokerStatus(signedDate) {
  if (!signedDate) return null;
  const signed = new Date(signedDate);
  const expiry = new Date(signed);
  expiry.setDate(expiry.getDate() + 90);
  const now = new Date();
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  const daysUsed = 90 - daysLeft;
  const percent = Math.min(100, Math.max(0, Math.round((daysUsed / 90) * 100)));
  return { daysLeft, percent, expiry, signed };
}

export default function RelocationProfileCard({ clientId }) {
  const [client, setClient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showCautions, setShowCautions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [forwardMilestone, setForwardMilestone] = useState(null);

  useEffect(() => {
    if (!clientId) return;
    appClient.entities.RelocationClient.filter({ id: clientId }, '-created_date', 1)
      .then(results => {
        if (results[0]) {
          setClient(results[0]);
          setForm({
            destination_city: results[0].destination_city || '',
            move_date: results[0].move_date || '',
            budget: results[0].budget || '',
            notes: results[0].notes || '',
          });
        }
      })
      .catch(() => {});
  }, [clientId]);

  const parseDestState = (notes) => {
    if (!notes) return '';
    const match = notes.match(/Destination:[^,]+,\s*([A-Z]{2})/);
    return match ? match[1] : '';
  };

  const parseTimeline = (notes) => {
    if (!notes) return '';
    const match = notes.match(/Timeline:\s*([^\n]+)/);
    return match ? match[1].trim() : '';
  };

  const handleSave = async () => {
    if (!clientId) return;
    setSaving(true);
    try {
      const updated = await appClient.entities.RelocationClient.update(clientId, {
        destination_city: form.destination_city,
        move_date: form.move_date || undefined,
        budget: form.budget || undefined,
      });
      setClient(prev => ({ ...prev, ...updated, destination_city: form.destination_city }));
      setEditing(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (!clientId) return null;

  const destState = parseDestState(client?.notes);
  const timeline = parseTimeline(client?.notes);

  const intakeMilestones = [
    {
      id: 'profile', label: 'Profile Created', complete: true, phase: 'intake',
      guidance: 'Your journey begins here. Share your destination, timeline, and priorities.',
      type: 'basic'
    },
    {
      id: 'agent', label: 'Agent Selected', complete: !!client?.agent_name, phase: 'intake',
      guidance: 'We present 3-5 vetted agents based on your personality fit and needs.',
      type: 'agent'
    },
    {
      id: 'buyer_broker', label: 'Buyer Broker Signed', complete: !!client?.buyer_broker_signed, phase: 'intake',
      guidance: 'Formalize your relationship with your chosen agent. Unlocks full City Guide access.',
      type: 'buyer_broker'
    },
  ];

  const completedIntake = intakeMilestones.filter(m => m.complete).length;
  const buyerBrokerSigned = !!client?.buyer_broker_signed;
  const bbStatus = getBuyerBrokerStatus(client?.buyer_broker_signed_date);

  const showPivotGuidance = client?.notes?.includes('pivot') || client?.notes?.includes('restart') ||
    (client?.status === 'inactive' && client?.buyer_broker_signed);

  // --- Modal rendering helpers ---
  const renderMilestoneModal = (m) => {
    if (!m) return null;

    if (m.type === 'agent') {
      return (
        <div className="px-5 py-5 space-y-4">
          {client?.agent_name ? (
            <>
              {/* Agent card */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD}33` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: GOLD, color: '#000' }}>
                    {client.agent_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#fff' }}>{client.agent_name}</p>
                    {client.assigned_agent && (
                      <p className="text-xs" style={{ color: '#888' }}>{client.assigned_agent}</p>
                    )}
                  </div>
                </div>
                {client.agent_selected_date && (
                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#aaa' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Selected: {new Date(client.agent_selected_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {/* Contact info rows */}
                <div className="space-y-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {client.assigned_agent || 'Email on file'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Contact via Charlie or your dashboard</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{m.guidance}</p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{m.guidance}</p>
            </div>
          )}
        </div>
      );
    }

    if (m.type === 'buyer_broker') {
      const urgencyColor = bbStatus
        ? bbStatus.daysLeft <= 14 ? '#ef4444'
          : bbStatus.daysLeft <= 30 ? '#f59e0b'
          : '#22c55e'
        : GOLD;

      return (
        <div className="px-5 py-5 space-y-4">
          {client?.buyer_broker_signed ? (
            <>
              {/* Countdown */}
              {bbStatus && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${urgencyColor}44` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: urgencyColor }}>
                      Agreement Expires In
                    </p>
                    <span className="text-2xl font-black" style={{ color: urgencyColor }}>
                      {bbStatus.daysLeft > 0 ? `${bbStatus.daysLeft}d` : 'EXPIRED'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${bbStatus.percent}%`, background: urgencyColor }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: '#666' }}>
                      Signed: {bbStatus.signed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-xs" style={{ color: '#666' }}>
                      Expires: {bbStatus.expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {bbStatus.daysLeft <= 30 && bbStatus.daysLeft > 0 && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: `${urgencyColor}15`, border: `1px solid ${urgencyColor}33` }}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: urgencyColor }} />
                      <p className="text-xs font-semibold" style={{ color: urgencyColor }}>
                        {bbStatus.daysLeft <= 14 ? 'Renewal urgent — contact your agent today.' : 'Agreement expiring soon — discuss renewal with your agent.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <FileSignature className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  This agreement gives your agent the right to represent you exclusively for up to 90 days. It also unlocks your full City Guide access and all Dyson & Dyson research tools.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{m.guidance}</p>
            </div>
          )}
        </div>
      );
    }

    // basic
    return (
      <div className="px-5 py-5">
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{m.guidance}</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8 space-y-4"
    >
      {/* Main Profile Card */}
      <div className="rounded-3xl overflow-hidden" style={{ background: '#808080', border: `1px solid ${GOLD}44` }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#000', borderBottom: `1px solid ${GOLD}22` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}33` }}>
              <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Your Relocation Profile</p>
              <p className="text-xs" style={{ color: '#e5e5e5' }}>This drives everything we do for you</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="text-xs" style={{ color: '#e5e5e5' }}>{completedIntake}/{intakeMilestones.length} intake</span>
            </div>
            {!editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}
                className="gap-1.5 rounded-lg h-8" style={{ color: GOLD, border: `1px solid ${GOLD}44` }}>
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}
                  className="rounded-lg h-8 w-8 p-0" style={{ color: '#888' }}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}
                  className="rounded-lg h-8" style={{ background: GOLD, color: '#000' }}>
                  {saving ? '...' : <Check className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Destination */}
            <div className="rounded-2xl p-4" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
                  <MapPin className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>Destination</span>
              </div>
              {editing ? (
                <Input value={form.destination_city} onChange={e => setForm(p => ({ ...p, destination_city: e.target.value }))}
                  placeholder="City, State" className="border-0 rounded-lg h-9 text-sm"
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }} />
              ) : (
                <p className="font-bold text-lg" style={{ color: '#fff' }}>
                  {client?.destination_city ? `${client.destination_city}${destState ? `, ${destState}` : ''}` : '—'}
                </p>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl p-4" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
                  <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>Timeline</span>
              </div>
              {editing ? (
                <select value={form.move_date || ''} onChange={e => setForm(p => ({ ...p, move_date: e.target.value }))}
                  className="w-full rounded-lg h-9 text-sm px-3 border-0"
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                  <option value="">Select...</option>
                  {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <p className="font-bold text-lg" style={{ color: '#fff' }}>{client?.move_date || timeline || '—'}</p>
              )}
            </div>

            {/* Budget */}
            <div className="rounded-2xl p-4" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
                  <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>Budget</span>
              </div>
              {editing ? (
                <select value={form.budget || ''} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  className="w-full rounded-lg h-9 text-sm px-3 border-0"
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                  <option value="">Select...</option>
                  {BUDGET_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <p className="font-bold text-lg" style={{ color: '#fff' }}>
                  {client?.budget ? {
                    under_200k: 'Under $200K',
                    '200k_400k': '$200K – $400K',
                    '400k_600k': '$400K – $600K',
                    '600k_800k': '$600K – $800K',
                    '800k_1m': '$800K – $1M',
                    over_1m: 'Over $1M',
                  }[client.budget] || client.budget.replace(/_/g, ' ') : '—'}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="rounded-2xl p-4" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
                  <TrendingUp className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>Status</span>
              </div>
              <p className="font-bold text-lg capitalize" style={{ color: GOLD }}>
                {client?.status?.replace(/_/g, ' ') || 'New Lead'}
              </p>
            </div>
          </div>

          {/* ─── ALL MILESTONE PILLS — single horizontal scroll row ─── */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #333' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#e5e5e5' }}>Intake Phase</p>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: `1px solid ${GOLD}33` }}>
                Current
              </span>
            </div>

            {showPivotGuidance && (
              <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Mid-journey pivot detected. Tell Charlie — your profile adapts.
                  </p>
                </div>
              </div>
            )}

            {/* Single horizontal scroll: intake pills + forward journey pills */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {/* Intake pills */}
              {intakeMilestones.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMilestone(m)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0 cursor-pointer transition-all hover:brightness-125"
                  style={{
                    background: '#000',
                    border: m.complete ? '1px solid rgba(34,197,94,0.5)' : `1px solid ${GOLD}66`,
                    minWidth: 'max-content',
                  }}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: m.complete ? '#22c55e' : GOLD }}>
                    {m.complete ? <Check className="w-3 h-3 text-black" /> : <span className="text-xs font-bold text-black">{i + 1}</span>}
                  </div>
                  <span className="text-sm font-medium" style={{ color: m.complete ? '#4ade80' : GOLD }}>
                    {m.label}
                  </span>
                  {m.id === 'buyer_broker' && m.complete && bbStatus && bbStatus.daysLeft <= 30 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: bbStatus.daysLeft <= 14 ? '#ef4444' : '#f59e0b', color: '#000' }}>
                      {bbStatus.daysLeft}d
                    </span>
                  )}
                </button>
              ))}

              {/* Divider dot between intake and forward */}
              <div className="flex items-center px-1 shrink-0">
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              </div>

              {/* Forward journey pills */}
              {FORWARD_MILESTONES.map((fm) => {
                const Icon = fm.icon;
                return (
                  <button
                    key={fm.id}
                    onClick={() => setForwardMilestone(fm)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0 transition-all hover:brightness-125"
                    style={{
                      background: '#000',
                      border: '1px solid rgba(255,255,255,0.2)',
                      minWidth: 'max-content',
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#aaa' }} />
                    <span className="text-sm font-medium" style={{ color: '#fff' }}>{fm.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#e5e5e5' }}>Tap any step for details · Scroll to see full journey →</p>
          </div>

          {/* Priorities */}
          {client?.priorities?.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #333' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#e5e5e5' }}>Your Priorities</p>
              <div className="flex flex-wrap gap-2">
                {client.priorities.map(p => (
                  <span key={p} className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}33`, color: GOLD }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Things That Change Panel */}
      <div className="rounded-3xl overflow-hidden" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)' }}>
        <button onClick={() => setShowCautions(s => !s)}
          className="w-full flex items-center justify-between px-6 py-4 transition-all hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: '#ef4444' }}>Things That Change Mid-Journey</p>
              <p className="text-xs" style={{ color: '#888' }}>Be ready for these common pivots</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#666' }}>{showCautions ? 'Hide' : 'Show'} 6 items</span>
            {showCautions ? <ChevronUp className="w-5 h-5" style={{ color: '#666' }} /> : <ChevronDown className="w-5 h-5" style={{ color: '#666' }} />}
          </div>
        </button>

        <AnimatePresence>
          {showCautions && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="px-6 pb-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CAUTIONS.map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <div key={i} className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
                            <Icon className="w-5 h-5" style={{ color: c.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold mb-1" style={{ color: '#fff' }}>{c.title}</p>
                            <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{c.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                  <p className="text-sm" style={{ color: '#888' }}>
                    Any of these happen? Just tell <span style={{ color: GOLD }}>Charlie</span> — your profile updates instantly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── INTAKE MILESTONE MODAL ─── */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSelectedMilestone(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #333' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: selectedMilestone.complete ? '#22c55e' : GOLD }}>
                    {selectedMilestone.complete
                      ? <Check className="w-4 h-4 text-black" />
                      : <span className="text-sm font-bold text-black">{intakeMilestones.findIndex(m => m.id === selectedMilestone.id) + 1}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#fff' }}>{selectedMilestone.label}</p>
                    <p className="text-xs" style={{ color: selectedMilestone.complete ? '#4ade80' : '#888' }}>
                      {selectedMilestone.complete ? '✓ Complete' : 'Intake phase'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedMilestone(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" style={{ color: '#888' }} />
                </button>
              </div>
              {renderMilestoneModal(selectedMilestone)}
              {/* Footer */}
              <div className="px-5 pb-5 flex justify-end">
                <button onClick={() => setSelectedMilestone(null)}
                  className="text-xs px-4 py-1.5 rounded-full font-semibold hover:brightness-110"
                  style={{ background: GOLD, color: '#000' }}>
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FORWARD MILESTONE MODAL ─── */}
      <AnimatePresence>
        {forwardMilestone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setForwardMilestone(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #333' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}44` }}>
                    {React.createElement(forwardMilestone.icon, { className: 'w-4 h-4', style: { color: GOLD } })}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#fff' }}>{forwardMilestone.label}</p>
                    <p className="text-xs capitalize" style={{ color: '#888' }}>{forwardMilestone.phase} phase</p>
                  </div>
                </div>
                <button onClick={() => setForwardMilestone(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" style={{ color: '#888' }} />
                </button>
              </div>
              {/* Body */}
              <div className="px-5 py-5 space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {forwardMilestone.reminder}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(212,175,55,0.07)', border: `1px solid ${GOLD}22` }}>
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: GOLD }} className="font-semibold">Pro tip: </span>{forwardMilestone.tip}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 flex justify-end">
                <button onClick={() => setForwardMilestone(null)}
                  className="text-xs px-4 py-1.5 rounded-full font-semibold hover:brightness-110"
                  style={{ background: GOLD, color: '#000' }}>
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}