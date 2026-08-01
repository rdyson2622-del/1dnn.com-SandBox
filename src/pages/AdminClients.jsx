import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Eye, MessageSquare, User, MapPin, Calendar, DollarSign, CheckCircle2, Home, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AddClientModal from "@/components/admin/AddClientModal";

const GOLD = '#D4AF37';

const STATUS_CONFIG = {
  new_lead:          { label: 'New Lead',          color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  step: 1 },
  in_consultation:   { label: 'In Consultation',   color: GOLD,      bg: 'rgba(212,175,55,0.12)',  step: 2 },
  actively_searching:{ label: 'Actively Searching',color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', step: 3 },
  under_contract:    { label: 'Under Contract',    color: '#f97316', bg: 'rgba(249,115,22,0.12)',  step: 4 },
  in_escrow:         { label: 'In Escrow',         color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  step: 5 },
  final_negotiations:{ label: 'Final Negotiations',color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  step: 6 },
  close_of_escrow:   { label: 'Close of Escrow',   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   step: 7 },
  local_services:    { label: 'Local Setup',       color: '#14b8a6', bg: 'rgba(20,184,166,0.12)',  step: 8 },
  moved:             { label: 'Moved',             color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   step: 9 },
  closed:            { label: 'Closed Escrow File', color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   step: 10 },
  inactive:          { label: 'Inactive',          color: '#6b7280', bg: 'rgba(107,114,128,0.1)',  step: 0 },
};

const PIPELINE_STEPS = [
  { key: 'new_lead',           label: 'Lead' },
  { key: 'in_consultation',    label: 'Consult' },
  { key: 'actively_searching', label: 'Searching' },
  { key: 'under_contract',     label: 'Contract' },
  { key: 'in_escrow',          label: 'Escrow' },
  { key: 'final_negotiations', label: 'Negotiations' },
  { key: 'close_of_escrow',    label: 'Close' },
  { key: 'local_services',     label: 'Local Setup' },
  { key: 'moved',              label: 'Moved' },
  { key: 'closed',             label: 'Closed' },
];

const BUDGET_LABELS = {
  under_200k:  'Under $200k',
  '200k_400k': '$200k – $400k',
  '400k_600k': '$400k – $600k',
  '600k_800k': '$600k – $800k',
  '800k_1m':   '$800k – $1M',
  over_1m:     'Over $1M',
};

function PipelineBar({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new_lead;
  const currentStep = cfg.step;
  return (
    <div className="flex items-center gap-1 mt-3">
      {PIPELINE_STEPS.map((s, i) => {
        const stepNum = i + 1;
        const done = currentStep >= stepNum;
        const active = currentStep === stepNum;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all"
                style={{
                  background: done ? cfg.color : 'rgba(255,255,255,0.1)',
                  color: done ? '#000' : 'rgba(255,255,255,0.3)',
                  border: active ? `2px solid ${cfg.color}` : '2px solid transparent',
                  boxShadow: active ? `0 0 6px ${cfg.color}60` : 'none',
                }}
              >
                {done ? '✓' : stepNum}
              </div>
              <span className="text-[8px] font-semibold" style={{ color: done ? cfg.color : 'rgba(255,255,255,0.2)' }}>
                {s.label}
              </span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="flex-1 h-px mb-3" style={{ background: done && currentStep > stepNum ? cfg.color : 'rgba(255,255,255,0.08)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ClientCard({ client, onDelete, tasks, properties }) {
  const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.new_lead;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const keyFacts = [
    client.current_city && { icon: MapPin, label: 'From', value: client.current_city },
    { icon: MapPin, label: 'To', value: client.destination_city },
    client.move_date && { icon: Calendar, label: 'Timeline', value: client.move_date },
    client.budget && { icon: DollarSign, label: 'Budget', value: BUDGET_LABELS[client.budget] || client.budget },
    client.family_size && { icon: Users, label: 'Family', value: `${client.family_size} people` },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#111', border: `1px solid rgba(255,255,255,0.08)` }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: cfg.color }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base shrink-0"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
              {client.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{client.full_name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {client.email}{client.phone ? ` • ${client.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
              {cfg.label}
            </span>
            <Link to={`/admin/client-detail?id=${client.id}&tab=communicate`}>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" title="Message">
                <MessageSquare className="w-4 h-4" style={{ color: GOLD }} />
              </button>
            </Link>
            <Link to={`/admin/client-detail?id=${client.id}`}>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" title="View Full Profile">
                <Eye className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </Link>
            <button onClick={() => onDelete(client.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/15 transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
            </button>
          </div>
        </div>

        {/* Pipeline progress bar */}
        {client.status !== 'inactive' && <PipelineBar status={client.status} />}

        {/* Key facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">
          {keyFacts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
              <p className="text-xs font-semibold text-white leading-tight truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Task progress */}
          <div className="flex items-center gap-2 flex-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: totalTasks > 0 ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Roadmap Tasks</span>
                <span className="text-[10px] font-bold" style={{ color: totalTasks > 0 ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${taskPct}%`, background: '#22c55e' }} />
              </div>
            </div>
          </div>

          {/* Properties saved */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Home className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="font-bold text-white">{properties.length}</span> propert{properties.length !== 1 ? 'ies' : 'y'} saved
            </span>
          </div>

          {/* Agent assigned */}
          {client.assigned_agent ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Star className="w-3.5 h-3.5" style={{ color: GOLD }} />
              <span className="text-xs font-semibold" style={{ color: GOLD }}>{client.agent_name || 'Agent assigned'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <User className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>No agent yet</span>
            </div>
          )}

          {/* View full profile CTA */}
          <Link to={`/admin/client-detail?id=${client.id}`} className="shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-90"
              style={{ background: GOLD, color: '#000' }}>
              <Eye className="w-3 h-3" /> View Profile
            </button>
          </Link>
        </div>

        {/* Priorities */}
        {client.priorities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {client.priorities.slice(0, 5).map(p => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.7)', border: '1px solid rgba(212,175,55,0.15)' }}>
                {p.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminClients() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => appClient.entities.RelocationClient.list('-created_date'),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['admin-all-tasks'],
    queryFn: () => appClient.entities.RelocationTask.list('-created_date', 200),
  });

  const { data: allProperties = [] } = useQuery({
    queryKey: ['admin-all-properties'],
    queryFn: () => appClient.entities.PropertyCandidate.list('-created_date', 200),
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await appClient.entities.RelocationClient.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
  };

  const statusOrder = ['new_lead','in_consultation','actively_searching','under_contract','moved','closed','inactive'];
  const sorted = [...clients].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  const counts = {};
  clients.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });

  if (loadingClients) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="w-8 h-8 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] mb-1" style={{ color: GOLD }}>ADMIN PANEL</p>
            <h1 className="display-heading" style={{ fontSize: 'clamp(1.62rem, 3.6vw, 2.7rem)', color: '#fff' }}>Client Pipeline</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {clients.length} client{clients.length !== 1 ? 's' : ''} total
              {counts.actively_searching ? ` · ${counts.actively_searching} actively searching` : ''}
              {counts.under_contract ? ` · ${counts.under_contract} under contract` : ''}
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
            style={{ background: GOLD, color: '#000' }}>
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PIPELINE_STEPS.map(s => {
            const cfg = STATUS_CONFIG[s.key];
            const n = counts[s.key] || 0;
            return (
              <div key={s.key} className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: n > 0 ? cfg.bg : 'rgba(255,255,255,0.04)', color: n > 0 ? cfg.color : 'rgba(255,255,255,0.6)', border: `1px solid ${n > 0 ? cfg.color + '40' : 'rgba(255,255,255,0.15)'}` }}>
                {cfg.label} {n > 0 ? `(${n})` : ''}
              </div>
            );
          })}
        </div>

        {/* Client cards */}
        {clients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No clients yet. Add your first client above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={handleDelete}
                tasks={allTasks.filter(t => t.client_id === client.id)}
                properties={allProperties.filter(p => p.client_id === client.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['admin-clients'] })}
      />
    </div>
  );
}