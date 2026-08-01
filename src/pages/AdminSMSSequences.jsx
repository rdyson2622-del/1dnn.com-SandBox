import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Trash2, ChevronDown, ChevronRight, Clock, Users,
  MessageSquare, CheckSquare, Square, Search, Play, Pencil,
  CheckCircle2, Save, X
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
function fillPreview(msg, owner) {
  return (msg || '')
    .replace(/\{\{owner_name\}\}/g, owner?.owner_name || 'John')
    .replace(/\{\{property_address\}\}/g, owner?.property_address || '123 Main St')
    .replace(/\{\{listing_price\}\}/g, owner?.listing_price ? `$${Number(owner.listing_price).toLocaleString()}` : '$750,000')
    .replace(/\{\{destination_city\}\}/g, owner?.moving_to || 'Austin');
}

function delayLabel(days, hours) {
  if (!days && !hours) return 'Immediately';
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  return `+${parts.join(' ')}`;
}

const DEFAULT_STEPS = [
  { label: 'Day 1 — Initial', delay_days: 0, delay_hours: 0, message: "Hi {{owner_name}}, this is Dyson & Dyson Concierge Relocation. We noticed your home at {{property_address}} is listed — we offer FREE Concierge Relocation to manage your entire move. Reply YES or visit dysonrelo.com. Reply STOP to opt out." },
  { label: 'Day 3 — Follow-Up', delay_days: 3, delay_hours: 0, message: "Hi {{owner_name}}, just following up on our note about your move. Our AI concierge Charlie handles your ENTIRE relocation for FREE — neighborhoods, schools, agents. Reply YES to get started. Reply STOP to opt out." },
  { label: 'Day 7 — Value Add', delay_days: 4, delay_hours: 0, message: "Hey {{owner_name}} — Bob Dyson here. 54 years in real estate. We've helped hundreds of families move seamlessly. Our AI Charlie maps your entire move for free. Worth 2 min? Reply YES or call (858) 353-1200. Reply STOP to opt out." },
  { label: 'Day 14 — Last Touch', delay_days: 7, delay_hours: 0, message: "{{owner_name}}, last note from us — dysonrelo.com has AI neighborhood research, school ratings, agent matching — free. No obligation. Reply YES or visit dysonrelo.com. Reply STOP to opt out." },
];

// ── Step Editor ───────────────────────────────────────────────────────────────
function StepEditor({ step, index, onChange, onRemove, previewOwner }) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
        <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
        <Input
          value={step.label || ''}
          onChange={e => onChange({ ...step, label: e.target.value })}
          className="h-7 text-sm font-medium border-0 bg-transparent focus-visible:ring-0 p-0 flex-1"
          placeholder="Step label…"
        />
        <div className="flex items-center gap-2 ml-auto">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Send after:</span>
          <input
            type="number" min="0"
            value={step.delay_days ?? 0}
            onChange={e => onChange({ ...step, delay_days: parseInt(e.target.value) || 0 })}
            className="w-14 h-7 border border-slate-200 rounded px-2 text-xs text-center"
          />
          <span className="text-xs text-slate-400">days</span>
          <input
            type="number" min="0" max="23"
            value={step.delay_hours ?? 0}
            onChange={e => onChange({ ...step, delay_hours: parseInt(e.target.value) || 0 })}
            className="w-14 h-7 border border-slate-200 rounded px-2 text-xs text-center"
          />
          <span className="text-xs text-slate-400">hrs</span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="ml-2 p-1 rounded text-slate-300 hover:text-red-500 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        <textarea
          value={step.message || ''}
          onChange={e => onChange({ ...step, message: e.target.value })}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
          rows={3}
          placeholder="Message body… use {{owner_name}}, {{property_address}}, {{destination_city}}"
        />
        {step.message && (
          <p className="text-xs text-slate-400">
            <span className="font-medium text-slate-500">Preview: </span>
            {fillPreview(step.message, previewOwner)}
          </p>
        )}
        <p className="text-xs text-slate-400">{(step.message || '').length} chars</p>
      </div>
    </div>
  );
}

// ── Sequence Card ─────────────────────────────────────────────────────────────
function SequenceCard({ sequence, onEdit, onEnroll, enrollments }) {
  const [open, setOpen] = useState(false);
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50" onClick={() => setOpen(v => !v)}>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{sequence.name}</p>
          {sequence.description && <p className="text-xs text-slate-400 truncate">{sequence.description}</p>}
        </div>
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <span className="text-xs text-slate-500">{sequence.steps?.length || 0} steps</span>
          {activeEnrollments > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{activeEnrollments} active</span>
          )}
          <button onClick={e => { e.stopPropagation(); onEdit(sequence); }} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEnroll(sequence); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition"
          >
            <Play className="w-3 h-3" /> Enroll Contacts
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
          {(sequence.steps || []).map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                {i < sequence.steps.length - 1 && <div className="w-px h-full bg-slate-200 my-1 min-h-[16px]" />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-800">{step.label || `Step ${i + 1}`}</span>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {delayLabel(step.delay_days, step.delay_hours)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{step.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Contact Picker ────────────────────────────────────────────────────────────
function ContactPicker({ owners, onEnroll, sequence, enrollments }) {
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const alreadyEnrolled = new Set(
    enrollments.filter(e => e.sequence_id === sequence.id && e.status === 'active').map(e => e.listing_owner_id)
  );

  const cities = useMemo(() => {
    const set = new Set(owners.map(o => o.property_city?.trim()).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [owners]);

  const filtered = owners.filter(o => {
    if (!o.phone) return false;
    if (cityFilter !== 'all' && o.property_city?.trim() !== cityFilter) return false;
    if (search && !o.owner_name?.toLowerCase().includes(search.toLowerCase()) && !o.property_address?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(o => selected.has(o.id));
  const toggle = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const n = new Set(prev); filtered.forEach(o => n.delete(o.id)); return n; });
    else setSelected(prev => { const n = new Set(prev); filtered.forEach(o => n.add(o.id)); return n; });
  };

  const handleEnroll = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Enroll ${selected.size} contact(s) into "${sequence.name}"? All ${sequence.steps?.length} SMS steps will be pre-scheduled in Twilio.`)) return;
    setSending(true);
    setResult(null);
    try {
      const res = await appClient.functions.invoke('scheduleSMSSequence', {
        sequence_id: sequence.id,
        owner_ids: Array.from(selected),
      });
      setResult(res.data);
      if (res.data.success) { setSelected(new Set()); onEnroll?.(); }
    } catch (e) {
      setResult({ success: false, error: e.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <Input placeholder="Search name or address…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="h-8 border border-slate-200 rounded-md px-2 text-xs text-slate-700 bg-white">
          {cities.map(c => <option key={c} value={c}>{c === 'all' ? 'All Cities' : c}</option>)}
        </select>
      </div>

      <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 uppercase tracking-wide">
              <th className="px-3 py-2 w-8"><button onClick={toggleAll}>{allSelected ? <CheckSquare className="w-3.5 h-3.5 text-slate-900" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}</button></th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Phone</th>
              <th className="text-left px-3 py-2">City</th>
              <th className="text-left px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const enrolled = alreadyEnrolled.has(o.id);
              return (
                <tr
                  key={o.id}
                  className={`border-b border-slate-50 cursor-pointer transition ${enrolled ? 'opacity-50 cursor-not-allowed' : selected.has(o.id) ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-blue-50/50`}
                  onClick={() => !enrolled && toggle(o.id)}
                >
                  <td className="px-3 py-2">
                    {enrolled
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      : selected.has(o.id) ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 text-slate-300" />}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-900 max-w-[130px] truncate">{o.owner_name}</td>
                  <td className="px-3 py-2 text-slate-600">{o.phone}</td>
                  <td className="px-3 py-2 text-slate-500">{o.property_city || '—'}</td>
                  <td className="px-3 py-2">
                    {enrolled
                      ? <span className="text-green-600 font-medium">In sequence</span>
                      : <span className="text-slate-400">{o.contact_status?.replace(/_/g, ' ')}</span>}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-400">No contacts found</td></tr>}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <Button
          onClick={handleEnroll}
          disabled={sending}
          className="w-full bg-slate-900 hover:bg-slate-700 text-white gap-2"
        >
          {sending
            ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enrolling…</>
            : <><Play className="w-3.5 h-3.5" /> Enroll {selected.size} contact{selected.size !== 1 ? 's' : ''} into "{sequence.name}"</>}
        </Button>
      )}

      {result && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${result.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {result.success
            ? `✓ Enrolled ${result.enrolled} contact(s). ${result.skipped ? `${result.skipped} skipped (already enrolled or no phone).` : ''}`
            : `✗ ${result.error}`}
        </div>
      )}
    </div>
  );
}

// ── Sequence Form (create / edit) ─────────────────────────────────────────────
function SequenceForm({ initial, onSave, onCancel, previewOwner }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [steps, setSteps] = useState(initial?.steps?.length ? initial.steps : DEFAULT_STEPS);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || steps.length === 0) return;
    setSaving(true);
    const data = { name: name.trim(), description, steps, is_active: true };
    if (initial?.id) {
      await appClient.entities.SMSSequence.update(initial.id, data);
    } else {
      await appClient.entities.SMSSequence.create(data);
    }
    setSaving(false);
    onSave();
  };

  const updateStep = (i, val) => setSteps(prev => prev.map((s, idx) => idx === i ? val : s));
  const removeStep = i => setSteps(prev => prev.filter((_, idx) => idx !== i));
  const addStep = () => setSteps(prev => [...prev, { label: `Step ${prev.length + 1}`, delay_days: 7, delay_hours: 0, message: '' }]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-lg">{initial?.id ? 'Edit Sequence' : 'New Sequence'}</h2>
        <button onClick={onCancel} className="p-1.5 rounded text-slate-400 hover:text-slate-700 transition"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Sequence Name *</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 3-Touch Initial Outreach" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this sequence for?" />
        </div>
      </div>

      {/* Placeholders hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
        Available placeholders: <code className="bg-blue-100 px-1 rounded">{'{{owner_name}}'}</code> <code className="bg-blue-100 px-1 rounded">{'{{property_address}}'}</code> <code className="bg-blue-100 px-1 rounded">{'{{listing_price}}'}</code> <code className="bg-blue-100 px-1 rounded">{'{{destination_city}}'}</code>
        <br />Delays are cumulative from initial enrollment. Step 1 with 0 delay sends immediately.
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <StepEditor
            key={i}
            step={step}
            index={i}
            onChange={val => updateStep(i, val)}
            onRemove={steps.length > 1 ? () => removeStep(i) : null}
            previewOwner={previewOwner}
          />
        ))}
        <button
          onClick={addStep}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-slate-400 hover:text-slate-600 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Step
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !name.trim()} className="flex-1 bg-slate-900 hover:bg-slate-700 text-white gap-2">
          {saving ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Sequence</>}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSMSSequences() {
  const qc = useQueryClient();
  const [editingSeq, setEditingSeq] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [enrollingSeq, setEnrollingSeq] = useState(null);
  const [activeTab, setActiveTab] = useState('sequences'); // sequences | enrollments

  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ['smsSequences'],
    queryFn: () => appClient.entities.SMSSequence.list('-created_date', 100),
  });

  const { data: owners = [] } = useQuery({
    queryKey: ['listingOwners'],
    queryFn: () => appClient.entities.ListingOwner.list('-created_date', 2000),
  });

  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ['smsEnrollments'],
    queryFn: () => appClient.entities.SMSSequenceEnrollment.list('-enrolled_at', 1000),
    refetchInterval: 30000,
  });

  const previewOwner = owners[0];

  const handleSaved = () => {
    qc.invalidateQueries({ queryKey: ['smsSequences'] });
    setEditingSeq(null);
    setCreatingNew(false);
  };

  // Enrollment stats
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">SMS Follow-Up Sequences</h1>
            <p className="text-sm text-slate-500 mt-1">Build multi-step SMS campaigns with configurable delays between messages.</p>
          </div>
          {!creatingNew && !editingSeq && (
            <Button onClick={() => setCreatingNew(true)} className="bg-slate-900 hover:bg-slate-700 text-white gap-2">
              <Plus className="w-4 h-4" /> New Sequence
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{sequences.length}</p>
            <p className="text-xs text-slate-500">Sequences</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-600">{activeEnrollments}</p>
            <p className="text-xs text-slate-500">Active Enrollments</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-500">{completedEnrollments}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {['sequences', 'enrollments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'sequences' ? `Sequences (${sequences.length})` : `Enrollments (${enrollments.length})`}
            </button>
          ))}
        </div>

        {/* Create / Edit Form */}
        {(creatingNew || editingSeq) && (
          <SequenceForm
            initial={editingSeq}
            onSave={handleSaved}
            onCancel={() => { setCreatingNew(false); setEditingSeq(null); }}
            previewOwner={previewOwner}
          />
        )}

        {/* Enroll modal */}
        {enrollingSeq && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Enroll Contacts → {enrollingSeq.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{enrollingSeq.steps?.length} steps will be pre-scheduled in Twilio for each contact.</p>
              </div>
              <button onClick={() => setEnrollingSeq(null)} className="p-1.5 rounded text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>

            {/* Sequence timeline preview */}
            <div className="flex gap-2 flex-wrap">
              {(enrollingSeq.steps || []).map((step, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="bg-slate-800 text-white text-xs px-2 py-0.5 rounded-full font-medium">{step.label || `Step ${i+1}`}</span>
                  <span className="text-xs text-blue-600">{delayLabel(step.delay_days, step.delay_hours)}</span>
                  {i < enrollingSeq.steps.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                </div>
              ))}
            </div>

            <ContactPicker
              owners={owners}
              sequence={enrollingSeq}
              enrollments={enrollments}
              onEnroll={() => { refetchEnrollments(); setEnrollingSeq(null); }}
            />
          </div>
        )}

        {/* Sequences tab */}
        {activeTab === 'sequences' && !creatingNew && !editingSeq && (
          <div className="space-y-3">
            {sequences.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl py-16 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No sequences yet</p>
                <p className="text-sm mt-1">Click "New Sequence" to build your first follow-up campaign.</p>
              </div>
            ) : sequences.map(seq => (
              <SequenceCard
                key={seq.id}
                sequence={seq}
                enrollments={enrollments.filter(e => e.sequence_id === seq.id)}
                onEdit={() => setEditingSeq(seq)}
                onEnroll={() => setEnrollingSeq(seq)}
              />
            ))}
          </div>
        )}

        {/* Enrollments tab */}
        {activeTab === 'enrollments' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {enrollments.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No enrollments yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Owner</th>
                    <th className="text-left px-4 py-3">Sequence</th>
                    <th className="text-left px-4 py-3">Enrolled</th>
                    <th className="text-center px-4 py-3">Steps Sent</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e, i) => (
                    <tr key={e.id} className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{e.owner_name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.property_address}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{e.sequence_name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-slate-700">{e.steps_log?.filter(s => s.status !== 'failed').length || 0} / {e.steps_log?.length || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          e.status === 'active'    ? 'bg-green-100 text-green-700' :
                          e.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                          e.status === 'opted_out' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {e.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}