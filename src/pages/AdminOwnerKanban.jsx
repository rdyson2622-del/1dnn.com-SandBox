import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Phone, MapPin, MessageSquare, Calendar, DollarSign, X, ChevronRight } from 'lucide-react';

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: 'outreach',
    label: 'Contacted',
    color: 'bg-blue-500',
    light: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    description: 'SMS sent, awaiting reply',
  },
  {
    id: 'response',
    label: 'Interested',
    color: 'bg-amber-500',
    light: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    description: 'Owner has responded',
  },
  {
    id: 'profile_complete',
    label: 'Meeting Scheduled',
    color: 'bg-purple-500',
    light: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    description: 'Profile gathered, next step set',
  },
  {
    id: 'processing',
    label: 'In Process',
    color: 'bg-orange-500',
    light: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    description: 'Agent matched / active deal',
  },
  {
    id: 'closed',
    label: 'Closed',
    color: 'bg-green-500',
    light: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    description: 'Deal closed / moved',
  },
];

// ── Lead Card ─────────────────────────────────────────────────────────────────
function LeadCard({ campaign, onDragStart, onClick }) {
  const price = campaign.listing_price
    ? `$${Number(campaign.listing_price).toLocaleString()}`
    : null;

  const daysSinceSMS = campaign.sms_sent_date
    ? Math.floor((Date.now() - new Date(campaign.sms_sent_date)) / 86400000)
    : null;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, campaign)}
      onClick={() => onClick(campaign)}
      className="bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">{campaign.owner_name}</p>
        {daysSinceSMS !== null && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium ${daysSinceSMS > 7 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {daysSinceSMS}d
          </span>
        )}
      </div>

      <div className="space-y-1 text-xs text-slate-500">
        {campaign.property_address && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{campaign.property_address}</span>
          </div>
        )}
        {price && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 flex-shrink-0" />
            <span>{price}</span>
          </div>
        )}
        {campaign.destination_city && (
          <div className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 flex-shrink-0 text-purple-400" />
            <span className="text-purple-600 font-medium">→ {campaign.destination_city}{campaign.destination_state ? `, ${campaign.destination_state}` : ''}</span>
          </div>
        )}
        {campaign.owner_phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>{campaign.owner_phone}</span>
          </div>
        )}
      </div>

      {campaign.charlie_engaged && (
        <div className="mt-2 text-xs bg-purple-50 text-purple-700 rounded px-2 py-0.5 inline-block font-medium">
          🤖 Charlie engaged
        </div>
      )}
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
function KanbanColumn({ col, cards, onDragStart, onDrop, onDragOver, onCardClick }) {
  return (
    <div
      className="flex flex-col min-w-[240px] w-[240px] flex-shrink-0"
      onDrop={e => onDrop(e, col.id)}
      onDragOver={onDragOver}
    >
      {/* Column header */}
      <div className={`rounded-t-xl border px-3 py-2.5 ${col.light} mb-0`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
          <span className="font-bold text-sm text-slate-800">{col.label}</span>
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
            {cards.length}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 ml-4">{col.description}</p>
      </div>

      {/* Cards area */}
      <div className={`flex-1 min-h-[400px] border border-t-0 rounded-b-xl p-2 space-y-2 ${col.light} overflow-y-auto max-h-[calc(100vh-220px)]`}>
        {cards.map(c => (
          <LeadCard
            key={c.id}
            campaign={c}
            onDragStart={onDragStart}
            onClick={onCardClick}
          />
        ))}
        {cards.length === 0 && (
          <div className="text-center py-8 text-slate-300 text-xs">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ campaign, onClose, onStageChange }) {
  const [notes, setNotes] = useState(campaign.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [saved, setSaved] = useState(false);

  const col = COLUMNS.find(c => c.id === campaign.workflow_stage) || COLUMNS[0];

  const saveNotes = async () => {
    setSavingNotes(true);
    await appClient.entities.OwnerOutreachCampaign.update(campaign.id, { notes });
    setSavingNotes(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">{campaign.owner_name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.badge}`}>{col.label}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Contact info */}
          <div className="space-y-2 text-sm">
            {campaign.property_address && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                {campaign.property_address}
              </div>
            )}
            {campaign.owner_phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${campaign.owner_phone}`} className="text-blue-600 hover:underline">{campaign.owner_phone}</a>
              </div>
            )}
            {campaign.listing_price && (
              <div className="flex items-center gap-2 text-slate-600">
                <DollarSign className="w-4 h-4 text-slate-400" />
                ${Number(campaign.listing_price).toLocaleString()} listing
              </div>
            )}
            {campaign.destination_city && (
              <div className="flex items-center gap-2 text-slate-600">
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span>Moving to <strong className="text-purple-700">{campaign.destination_city}{campaign.destination_state ? `, ${campaign.destination_state}` : ''}</strong></span>
              </div>
            )}
            {campaign.timeline && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                {campaign.timeline}
              </div>
            )}
            {campaign.sms_sent_date && (
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                SMS sent {new Date(campaign.sms_sent_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
            {campaign.response_date && (
              <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                <MessageSquare className="w-3.5 h-3.5" />
                Responded {new Date(campaign.response_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>

          {/* Move stage */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Move to Stage</p>
            <div className="grid grid-cols-1 gap-1.5">
              {COLUMNS.map(c => (
                <button
                  key={c.id}
                  disabled={c.id === campaign.workflow_stage}
                  onClick={() => onStageChange(campaign.id, c.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition ${
                    c.id === campaign.workflow_stage
                      ? `${c.badge} opacity-80 cursor-default`
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.color}`} />
                  {c.label}
                  {c.id === campaign.workflow_stage && <span className="ml-auto text-xs">← current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Notes</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-slate-400 min-h-[120px]"
              placeholder="Add notes about this lead…"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
            >
              {savingNotes ? 'Saving…' : saved ? '✓ Saved' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOwnerKanban() {
  const qc = useQueryClient();
  const dragItem = useRef(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [search, setSearch] = useState('');

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['outreachCampaignsKanban'],
    queryFn: () => appClient.entities.OwnerOutreachCampaign.list('-sms_sent_date', 2000),
    refetchInterval: 30000,
  });

  const filtered = search
    ? campaigns.filter(c =>
        c.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.property_address?.toLowerCase().includes(search.toLowerCase()) ||
        c.owner_phone?.includes(search) ||
        c.destination_city?.toLowerCase().includes(search.toLowerCase())
      )
    : campaigns;

  const grouped = {};
  for (const col of COLUMNS) {
    grouped[col.id] = filtered.filter(c => c.workflow_stage === col.id);
  }

  const handleDragStart = (e, campaign) => {
    dragItem.current = campaign;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const c = dragItem.current;
    if (!c || c.workflow_stage === targetStage) return;
    dragItem.current = null;

    // Optimistic update
    qc.setQueryData(['outreachCampaignsKanban'], prev =>
      (prev || []).map(x => x.id === c.id ? { ...x, workflow_stage: targetStage } : x)
    );

    await appClient.entities.OwnerOutreachCampaign.update(c.id, { workflow_stage: targetStage });
    qc.invalidateQueries({ queryKey: ['outreachCampaignsKanban'] });
  };

  const handleStageChange = async (id, newStage) => {
    qc.setQueryData(['outreachCampaignsKanban'], prev =>
      (prev || []).map(x => x.id === id ? { ...x, workflow_stage: newStage } : x)
    );
    setSelectedCard(prev => prev?.id === id ? { ...prev, workflow_stage: newStage } : prev);
    await appClient.entities.OwnerOutreachCampaign.update(id, { workflow_stage: newStage });
    qc.invalidateQueries({ queryKey: ['outreachCampaignsKanban'] });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0 flex-wrap gap-y-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Owner Response Board</h1>
          <p className="text-xs text-slate-500">Drag cards to move leads between stages</p>
        </div>

        {/* Summary pills */}
        <div className="flex gap-2 flex-wrap">
          {COLUMNS.map(col => (
            <span key={col.id} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${col.badge}`}>
              {col.label}: {grouped[col.id]?.length ?? 0}
            </span>
          ))}
        </div>

        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search owner, address, phone…"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              cards={grouped[col.id] || []}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onCardClick={setSelectedCard}
            />
          ))}
        </div>
      </div>

      {/* Detail drawer */}
      {selectedCard && (
        <DetailDrawer
          campaign={selectedCard}
          onClose={() => setSelectedCard(null)}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  );
}