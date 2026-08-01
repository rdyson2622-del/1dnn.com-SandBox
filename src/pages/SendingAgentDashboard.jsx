import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { ArrowRight, Clock, CheckCircle, AlertCircle, MapPin, Phone, Mail, Plus, Search, Shield, User } from 'lucide-react';
import SendingAgentModal from '@/components/directory/SendingAgentModal';

const GOLD = '#D4AF37';

const STATUS_CONFIG = {
  new:        { label: 'New Request',        color: '#6366f1', bg: 'rgba(99,102,241,0.12)',   icon: Clock },
  vetting:    { label: 'Vetting Agent',      color: GOLD,      bg: 'rgba(212,175,55,0.12)',   icon: Shield },
  matched:    { label: 'Agent Matched',      color: '#059669', bg: 'rgba(16,185,129,0.12)',   icon: CheckCircle },
  introduced: { label: 'Intro Made',         color: '#10b981', bg: 'rgba(16,185,129,0.18)',   icon: CheckCircle },
  in_escrow:  { label: 'In Escrow',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   icon: AlertCircle },
  closed:     { label: 'Closed ✓',           color: '#059669', bg: 'rgba(16,185,129,0.1)',    icon: CheckCircle },
  stalled:    { label: 'Stalled — Follow Up',color: '#dc2626', bg: 'rgba(239,68,68,0.1)',     icon: AlertCircle },
};

// Parse subscriber notes to extract referral data
function parseReferralNote(notes = '') {
  const brokerage    = notes.match(/Brokerage:\s*([^|]+)/)?.[1]?.trim() || '—';
  const sellerCity   = notes.match(/Seller in:\s*([^|]+)/)?.[1]?.trim() || '—';
  const destination  = notes.match(/Destination:\s*([^|]+)/)?.[1]?.trim() || '—';
  const extraNotes   = notes.match(/Notes:\s*(.+)$/)?.[1]?.trim() || '';
  return { brokerage, sellerCity, destination, extraNotes };
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ReferralCard({ record, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const { brokerage, sellerCity, destination, extraNotes } = parseReferralNote(record.notes);
  const status = record.referral_status || 'new';

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>

      {/* Card Header */}
      <div className="px-5 py-4 flex items-start justify-between gap-3"
        style={{ borderBottom: expanded ? '1px solid rgba(212,175,55,0.15)' : 'none', background: 'rgba(212,175,55,0.04)' }}>
        <div className="flex-1 min-w-0">
          <p className="font-black text-base" style={{ color: '#1a1a1a' }}>{record.full_name || 'Unnamed'}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs" style={{ color: '#6b5c45' }}>
              <MapPin className="w-3 h-3" style={{ color: GOLD }} />
              {sellerCity} <ArrowRight className="w-3 h-3 mx-0.5" style={{ color: GOLD }} /> {destination}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(212,175,55,0.12)', color: '#92400e', border: '1px solid rgba(212,175,55,0.3)' }}>
              {brokerage}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={status} />
          <button onClick={() => setExpanded(v => !v)}
            className="text-[10px] font-bold" style={{ color: GOLD }}>
            {expanded ? 'Hide ▲' : 'Details ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-4">
          {/* Contact */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            {record.email && (
              <a href={`mailto:${record.email}`} className="flex items-center gap-1.5 hover:underline" style={{ color: '#6366f1' }}>
                <Mail className="w-3.5 h-3.5" /> {record.email}
              </a>
            )}
            {record.phone && (
              <a href={`tel:${record.phone}`} className="flex items-center gap-1.5 hover:underline" style={{ color: '#059669' }}>
                <Phone className="w-3.5 h-3.5" /> {record.phone}
              </a>
            )}
          </div>

          {/* Notes */}
          {extraNotes && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm leading-relaxed"
              style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', color: '#3a2f1e', fontFamily: 'Georgia, serif' }}>
              {extraNotes}
            </div>
          )}

          {/* Submitted date */}
          <p className="text-[10px] mb-4" style={{ color: '#9b8a70' }}>
            Submitted: {record.subscribed_at ? new Date(record.subscribed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
          </p>

          {/* Status update */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: GOLD }}>Update Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key}
                  onClick={() => onStatusChange(record.id, key)}
                  className="text-[11px] font-bold px-3 py-1 rounded-full transition-all hover:scale-105"
                  style={{
                    background: status === key ? cfg.bg : 'rgba(0,0,0,0.05)',
                    color: status === key ? cfg.color : '#666',
                    border: status === key ? `1px solid ${cfg.color}55` : '1px solid rgba(0,0,0,0.1)',
                    fontWeight: status === key ? 900 : 600,
                  }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SendingAgentDashboard() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const qc = useQueryClient();

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['sending_agent_referrals'],
    queryFn: () => appClient.entities.DnnSubscriber.filter({ source: 'Sending Agent Portal' }, '-subscribed_at', 200),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => appClient.entities.DnnSubscriber.update(id, { referral_status: status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sending_agent_referrals'] }),
  });

  const filtered = referrals.filter(r => {
    const matchSearch = !search ||
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (r.referral_status || 'new') === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const counts = Object.keys(STATUS_CONFIG).reduce((acc, k) => {
    acc[k] = referrals.filter(r => (r.referral_status || 'new') === k).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: '#ede0cc' }}>

      {/* Header */}
      <div className="px-8 pt-10 pb-8" style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-2" style={{ color: GOLD }}>DYSON NATIONAL VETTING DESK</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Sending Agent Referral Tracker
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Georgia, serif' }}>
              Track every outbound referral request — from vetting to close.
            </p>
          </div>
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
            <Plus className="w-4 h-4" /> New Referral Request
          </button>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => counts[key] > 0 && (
            <button key={key} onClick={() => setStatusFilter(key === statusFilter ? 'all' : key)}
              className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{
                background: statusFilter === key ? cfg.bg : 'rgba(255,255,255,0.07)',
                color: statusFilter === key ? cfg.color : 'rgba(255,255,255,0.6)',
                border: `1px solid ${statusFilter === key ? cfg.color + '66' : 'rgba(255,255,255,0.1)'}`,
              }}>
              {cfg.label} <span className="font-black">{counts[key]}</span>
            </button>
          ))}
          {statusFilter !== 'all' && (
            <button onClick={() => setStatusFilter('all')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              Clear Filter ×
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-8 max-w-4xl mx-auto">

        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-full mb-6"
          style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
          <input
            placeholder="Search by name, city, or brokerage…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#1a1a1a' }}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-16" style={{ color: GOLD }}>Loading referrals…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.2)' }}>
            <User className="w-10 h-10 mx-auto mb-3" style={{ color: GOLD, opacity: 0.4 }} />
            <p className="font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>
              {referrals.length === 0 ? 'No referral requests yet' : 'No results match your filter'}
            </p>
            <p className="text-sm mb-5" style={{ color: '#6b5c45' }}>
              {referrals.length === 0
                ? 'Sending agents submit requests through the Directory or Sidebar.'
                : 'Try clearing your search or status filter.'}
            </p>
            {referrals.length === 0 && (
              <button onClick={() => setShowNewModal(true)}
                className="px-6 py-2.5 rounded-full font-black text-sm"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
                Add First Referral →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-semibold mb-2" style={{ color: '#6b5c45' }}>
              {filtered.length} referral{filtered.length !== 1 ? 's' : ''} {statusFilter !== 'all' ? `· ${STATUS_CONFIG[statusFilter]?.label}` : ''}
            </p>
            {filtered.map(r => (
              <ReferralCard key={r.id} record={r}
                onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />
            ))}
          </div>
        )}
      </div>

      {showNewModal && <SendingAgentModal onClose={() => { setShowNewModal(false); qc.invalidateQueries({ queryKey: ['sending_agent_referrals'] }); }} />}
    </div>
  );
}