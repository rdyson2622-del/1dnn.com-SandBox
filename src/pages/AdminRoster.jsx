import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Search, Upload, Phone, Mail, ChevronDown, ChevronUp, Edit2, Check, X, Trash2, UserPlus, Send, Loader2 } from 'lucide-react';
import VettedPartnerCSVImport from '@/components/admin/VettedPartnerCSVImport';
import AddAgentModal from '@/components/admin/AddAgentModal';

const GOLD = '#D4AF37';
const FRANCHISE_BRANDS = ['compass', 'coldwell banker', 'sotheby', 'century 21', 'remax', 're/max', 'berkshire hathaway', 'keller williams', 'exp realty', 'better homes'];

const CATEGORY_LABELS = {
  boutique_independent: { label: 'Boutique Independent', bg: 'rgba(212,175,55,0.15)', color: '#92400e', border: 'rgba(212,175,55,0.4)' },
  franchise:           { label: 'Franchise', bg: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  team:                { label: 'Team', bg: 'rgba(99,102,241,0.12)', color: '#6366f1', border: 'rgba(99,102,241,0.35)' },
  other:               { label: 'Other', bg: 'rgba(156,163,175,0.15)', color: '#6b7280', border: 'rgba(156,163,175,0.3)' },
};

const STATUS_COLORS = {
  pending:   { bg: 'rgba(251,191,36,0.15)',  color: '#b45309', border: 'rgba(251,191,36,0.4)' },
  active:    { bg: 'rgba(16,185,129,0.12)',  color: '#059669', border: 'rgba(16,185,129,0.35)' },
  contacted: { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1', border: 'rgba(99,102,241,0.35)' },
  converted: { bg: 'rgba(212,175,55,0.15)',  color: '#92400e', border: 'rgba(212,175,55,0.4)' },
  declined:  { bg: 'rgba(239,68,68,0.1)',    color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
};

function fmt(n) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function StatusBadge({ status, onChange }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <select
      value={status}
      onChange={e => onChange(e.target.value)}
      className="text-[10px] font-black px-2 py-0.5 rounded-full border outline-none cursor-pointer"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {Object.keys(STATUS_COLORS).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
    </select>
  );
}

function AgentRow({ agent, onUpdate, onDelete }) {
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState(agent.outreach_notes || '');

  const saveNotes = () => { onUpdate(agent.id, { outreach_notes: notes }); setEditNotes(false); };

  return (
    <tr className="border-b text-sm" style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
      <td className="px-3 py-3 font-bold" style={{ color: '#1a1a1a' }}>{agent.rank || '—'}</td>
      <td className="px-3 py-3 font-bold" style={{ color: '#1a1a1a' }}>{agent.agent_name}</td>
      <td className="px-3 py-3" style={{ color: '#4a3a28' }}>{agent.city}{agent.state ? `, ${agent.state}` : ''}</td>
      <td className="px-3 py-3" style={{ color: '#4a3a28' }}>{agent.brokerage || '—'}</td>
      <td className="px-3 py-3 text-center font-semibold" style={{ color: '#1a1a1a' }}>{agent.sales_count_2025 || '—'}</td>
      <td className="px-3 py-3 text-right font-semibold" style={{ color: GOLD }}>{fmt(agent.sales_volume_2025)}</td>
      <td className="px-3 py-3 text-right" style={{ color: '#4a3a28' }}>{fmt(agent.avg_price_point)}</td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {agent.phone && (
            <a href={`tel:${agent.phone}`} className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#059669' }}>
              <Phone className="w-3 h-3" />{agent.phone}
            </a>
          )}
          {agent.email && (
            <a href={`mailto:${agent.email}`} className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#6366f1' }}>
              <Mail className="w-3 h-3" />{agent.email}
            </a>
          )}
          {!agent.phone && !agent.email && <span className="text-xs" style={{ color: '#9b8a70' }}>No contact</span>}
        </div>
      </td>
      <td className="px-3 py-3">
        <select
          value={agent.brokerage_category || 'boutique_independent'}
          onChange={e => onUpdate(agent.id, { brokerage_category: e.target.value })}
          className="text-[10px] font-black px-2 py-0.5 rounded-full border outline-none cursor-pointer"
          style={(() => {
            const c = CATEGORY_LABELS[agent.brokerage_category || 'boutique_independent'];
            return { background: c.bg, color: c.color, borderColor: c.border };
          })()}
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </td>
      <td className="px-3 py-3">
        <select
          value={agent.market_type || 'destination'}
          onChange={e => onUpdate(agent.id, { market_type: e.target.value })}
          className="text-[10px] font-black px-2 py-0.5 rounded-full border outline-none cursor-pointer"
          style={agent.market_type === 'exodus'
            ? { background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' }
            : { background: 'rgba(16,185,129,0.1)', color: '#059669', borderColor: 'rgba(16,185,129,0.3)' }
          }
        >
          <option value="destination">Destination / Receiver</option>
          <option value="exodus">Exodus / Sender</option>
        </select>
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={agent.status || 'pending'} onChange={v => onUpdate(agent.id, { status: v })} />
      </td>
      <td className="px-3 py-3 max-w-[180px]">
        {editNotes ? (
          <div className="flex gap-1 items-start">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="text-xs px-2 py-1 rounded-lg flex-1 resize-none outline-none"
              style={{ background: '#ede0cc', border: `1px solid ${GOLD}`, color: '#1a1a1a' }} />
            <button onClick={saveNotes}><Check className="w-3.5 h-3.5 text-green-600" /></button>
            <button onClick={() => setEditNotes(false)}><X className="w-3.5 h-3.5 text-red-500" /></button>
          </div>
        ) : (
          <div className="flex gap-1 items-start group cursor-pointer" onClick={() => setEditNotes(true)}>
            <span className="text-xs leading-snug flex-1" style={{ color: '#6b5c45' }}>{notes || 'Add note…'}</span>
            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" style={{ color: GOLD }} />
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <button onClick={() => { if (window.confirm(`Delete ${agent.agent_name}?`)) onDelete(agent.id); }}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
        </button>
      </td>
    </tr>
  );
}

const FRANCHISE_KEYWORDS = ['compass', 'coldwell', "sotheby", 'sre', 'century 21', 'remax', 're/max', 'keller williams', 'exp realty', 'berkshire hathaway', 'better homes'];

function isFranchise(brokerage) {
  if (!brokerage) return false;
  const b = brokerage.toLowerCase();
  return FRANCHISE_KEYWORDS.some(kw => b.includes(kw));
}

export default function AdminRoster() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [independentOnly, setIndependentOnly] = useState(false);
  const [showImport, setShowImport] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignResult, setCampaignResult] = useState(null);
  const qc = useQueryClient();

  const launchCampaign = async () => {
    const pending = partners.filter(p => p.status === 'pending' || !p.status);
    if (pending.length === 0) { alert('No pending agents to invite.'); return; }
    if (!window.confirm(`Send email + SMS invitations to ${pending.length} agents?\n\nThis will use your Gmail and Twilio to send real messages.`)) return;
    setCampaignLoading(true);
    setCampaignResult(null);
    try {
      const res = await appClient.functions.invoke('agentInviteCampaign', { action: 'send' });
      setCampaignResult(res.data);
      qc.invalidateQueries({ queryKey: ['vetted_partners'] });
    } catch (e) {
      setCampaignResult({ error: e.message });
    }
    setCampaignLoading(false);
  };

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['vetted_partners'],
    queryFn: () => appClient.entities.VettedPartner.list('-created_date', 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.VettedPartner.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vetted_partners'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.VettedPartner.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vetted_partners'] }),
  });

  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete ALL ${partners.length} agents from the roster? This cannot be undone.`)) return;
    await Promise.allSettled(partners.map(p => appClient.entities.VettedPartner.delete(p.id)));
    qc.invalidateQueries({ queryKey: ['vetted_partners'] });
  };

  const filtered = partners.filter(p => {
    const matchSearch = !search ||
      p.agent_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.brokerage?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchIndependent = !independentOnly || !isFranchise(p.brokerage);
    return matchSearch && matchStatus && matchIndependent;
  });

  // Group by city
  const grouped = filtered.reduce((acc, p) => {
    const key = `${p.city}${p.state ? ', ' + p.state : ''}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: '#ede0cc' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-black tracking-[0.3em] mb-1" style={{ color: GOLD }}>PRN ADMIN</p>
            <h1 className="font-black text-2xl" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
              Master Partner Roster
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6b5c45' }}>
              {partners.length} agents across {Object.keys(partners.reduce((a, p) => ({ ...a, [p.city]: 1 }), {})).length} cities
            </p>
          </div>
          {partners.length > 0 && (
            <button onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
          <button onClick={() => setShowAddAgent(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}>
            <UserPlus className="w-4 h-4" /> Add Agent
          </button>
          <button onClick={() => setShowImport(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ background: showImport ? 'rgba(0,0,0,0.1)' : `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: showImport ? '#1a1a1a' : '#000', border: showImport ? '1px solid rgba(0,0,0,0.2)' : 'none' }}>
            <Upload className="w-4 h-4" /> {showImport ? 'Hide Importer' : 'Import Spreadsheet'}
          </button>
          <button onClick={launchCampaign} disabled={campaignLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none' }}>
            {campaignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {campaignLoading ? 'Sending…' : 'Launch Campaign'}
          </button>
        </div>

        {/* Campaign result */}
        {campaignResult && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: campaignResult.error ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${campaignResult.error ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            {campaignResult.error ? (
              <p className="text-sm font-bold text-red-600">✗ {campaignResult.error}</p>
            ) : (
              <div className="text-sm" style={{ color: '#059669' }}>
                <p className="font-black mb-1">✓ Campaign Sent</p>
                <p className="text-xs">{campaignResult.emailed} emails sent · {campaignResult.smsSent} SMS sent · {campaignResult.targets} total targets</p>
                {campaignResult.errors?.length > 0 && <p className="text-xs mt-1 text-red-500">{campaignResult.errors.length} errors (see logs)</p>}
              </div>
            )}
          </div>
        )}

        {showAddAgent && (
          <AddAgentModal onClose={() => setShowAddAgent(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['vetted_partners'] })} />
        )}

        {/* CSV Import Panel */}
        {showImport && (
          <div className="mb-8">
            <VettedPartnerCSVImport onDone={() => { setShowImport(false); qc.invalidateQueries({ queryKey: ['vetted_partners'] }); }} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full flex-1 min-w-[220px]"
            style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
            <input placeholder="Search agent, city, brokerage…" value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#1a1a1a' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-full text-sm font-semibold outline-none"
            style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)', color: '#1a1a1a' }}>
            <option value="all">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
          </select>
          <button
            onClick={() => setIndependentOnly(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black transition-all"
            style={{
              background: independentOnly ? `linear-gradient(135deg, #e8c84a, ${GOLD})` : '#fff8ee',
              color: independentOnly ? '#000' : '#6b5c45',
              border: independentOnly ? 'none' : '1px solid rgba(212,175,55,0.3)',
            }}>
            {independentOnly ? '✦ Independent Only' : '⬡ Independent Only'}
          </button>
          {independentOnly && (
            <span className="text-xs font-semibold px-3 py-2 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)' }}>
              {filtered.length} outreach-ready
            </span>
          )}
        </div>

        {/* Table by City Group */}
        {isLoading ? (
          <div className="text-center py-16" style={{ color: GOLD }}>Loading roster…</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-2xl mb-2">📋</p>
            <p className="font-bold" style={{ color: '#1a1a1a' }}>No agents yet</p>
            <p className="text-sm mt-1" style={{ color: '#6b5c45' }}>Use the Import CSV button to load your first batch.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cityLabel, agents]) => (
            <CityTable key={cityLabel} cityLabel={cityLabel} agents={agents}
              onUpdate={(id, data) => updateMutation.mutate({ id, data })}
              onDelete={(id) => deleteMutation.mutate(id)} />
          ))
        )}
      </div>
    </div>
  );
}

function CityTable({ cityLabel, agents, onUpdate, onDelete }) {
  const [open, setOpen] = useState(true);
  const citySlug = agents[0]?.city_slug || agents[0]?.city?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="mb-6 rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(212,175,55,0.25)' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
        style={{ background: 'rgba(212,175,55,0.08)', borderBottom: open ? '1px solid rgba(212,175,55,0.15)' : 'none' }}>
        <div className="flex items-center gap-3">
          <span className="font-black text-base" style={{ color: '#1a1a1a' }}>{cityLabel}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
            {agents.length} agents
          </span>
          <a href={`/vetted-agents/${citySlug}`} target="_blank" rel="noreferrer"
            className="text-[10px] font-bold px-2 py-0.5 rounded-full hover:opacity-80"
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}>
            SEO Page ↗
          </a>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: GOLD }} /> : <ChevronDown className="w-4 h-4" style={{ color: GOLD }} />}
      </button>
      {open && (
        <div style={{ background: '#fff8ee', overflowX: 'auto' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                {['Rank', 'Name', 'City', 'Brokerage', 'Sales #', 'Volume', 'Avg Price', 'Contact', 'Category', 'Market Type', 'Status', 'Notes', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-black tracking-wide" style={{ color: GOLD, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.sort((a, b) => (a.rank || 99) - (b.rank || 99)).map(agent => (
                <AgentRow key={agent.id} agent={agent} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}