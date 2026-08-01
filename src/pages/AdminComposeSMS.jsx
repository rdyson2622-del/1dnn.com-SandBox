import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Search, Send, CheckSquare, Square, MessageSquare, Eye,
  Trash2, RefreshCw, Clock, Layers, Plus, Edit2, AlertCircle
} from 'lucide-react';

// ─── TEMPLATE MODAL ──────────────────────────────────────────────────────────
function TemplateModal({ open, onClose, template, onSaved }) {
  const [form, setForm] = useState(
    template
      ? { name: template.name, category: template.category || 'initial_outreach', content: template.content, description: template.description || '' }
      : { name: '', category: 'initial_outreach', content: '', description: '' }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const placeholders = [...form.content.matchAll(/\{\{(\w+)\}\}/g)]
      .map(m => m[1])
      .filter((v, i, a) => a.indexOf(v) === i);
    const payload = { ...form, placeholders, communication_type: 'sms', is_active: true };
    if (template?.id) {
      await appClient.entities.MessageTemplate.update(template.id, payload);
    } else {
      await appClient.entities.MessageTemplate.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'New SMS Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Template Name *</label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Owner Outreach - Generic" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description (optional)</label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What this template is for" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Message Content * — use{' '}
              <code className="bg-slate-100 px-1 rounded text-xs">{'{'}{'{'} owner_name {'}'}{'}'}</code>{' '}
              <code className="bg-slate-100 px-1 rounded text-xs">{'{'}{'{'} property_address {'}'}{'}'}</code>
            </label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              required
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Hi {{owner_name}}, we help homeowners relocate to a new city with expert, free guidance. Interested? dysonrelo.com"
            />
            <div className="flex items-start gap-2 mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">Keep messages generic — avoid city-specific language like "Bay Area" or "San Francisco" unless this template is exclusively for that market.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name || !form.content}>
              {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── RENAME BATCH MODAL ───────────────────────────────────────────────────────
function RenameBatchModal({ open, onClose, currentLabel, owners, onRenamed }) {
  const [newName, setNewName] = useState(currentLabel === '⚠️ No Batch Label' ? '' : currentLabel);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const batchOwners = owners.filter(o =>
      currentLabel === '⚠️ No Batch Label'
        ? !o.import_batch?.trim()
        : o.import_batch?.trim() === currentLabel
    );
    // Update sequentially with a small delay to avoid rate limits
    for (const o of batchOwners) {
      await appClient.entities.ListingOwner.update(o.id, { import_batch: newName.trim() });
      await new Promise(r => setTimeout(r, 50));
    }
    setSaving(false);
    onRenamed();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Current name</label>
            <p className="text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">{currentLabel}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">New batch name *</label>
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              placeholder="e.g. San Francisco - April 22 2026"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">This will update all contacts in this batch ({owners.filter(o => currentLabel === '⚠️ No Batch Label' ? !o.import_batch?.trim() : o.import_batch?.trim() === currentLabel).length} contacts)</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !newName.trim()}>
              {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> Renaming...</> : 'Rename Batch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function fillTemplate(content, owner) {
  return content
    .replace(/\{\{owner_name\}\}/g, owner.owner_name || 'there')
    .replace(/\{\{property_address\}\}/g, owner.property_address || '')
    .replace(/\{\{listing_price\}\}/g, owner.listing_price ? `$${Number(owner.listing_price).toLocaleString()}` : '')
    .replace(/\{\{destination_city\}\}/g, owner.moving_to || '');
}

// ─── COMPOSE TAB ─────────────────────────────────────────────────────────────
function ComposeTab({ templates, owners, onTemplatesChanged }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateModal, setTemplateModal] = useState(null); // null | 'new' | template obj
  const [selectedOwners, setSelectedOwners] = useState(new Set());
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewOwner, setPreviewOwner] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [dryRun, setDryRun] = useState(true);

  // All distinct batch labels
  const batches = useMemo(() => {
    const set = new Set();
    owners.forEach(o => {
      const b = o.import_batch?.trim();
      if (b) set.add(b);
      else set.add('⚠️ No Batch Label');
    });
    return ['all', ...Array.from(set).sort()];
  }, [owners]);

  const filteredOwners = useMemo(() => {
    return owners.filter(o => {
      if (!o.phone) return false;
      const ownerBatch = o.import_batch?.trim() || '⚠️ No Batch Label';
      const matchBatch = batchFilter === 'all' || ownerBatch === batchFilter;
      const matchStatus = statusFilter === 'all' || o.contact_status === statusFilter;
      const matchSearch = !search ||
        o.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.property_address?.toLowerCase().includes(search.toLowerCase()) ||
        o.phone?.includes(search) ||
        ownerBatch.toLowerCase().includes(search.toLowerCase());
      return matchBatch && matchStatus && matchSearch;
    });
  }, [owners, batchFilter, statusFilter, search]);

  const ownersByBatch = useMemo(() => {
    const map = {};
    filteredOwners.forEach(o => {
      const key = o.import_batch?.trim() || '⚠️ No Batch Label';
      if (!map[key]) map[key] = [];
      map[key].push(o);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredOwners]);

  const toggleBatch = (batchOwners) => {
    const allSelected = batchOwners.every(o => selectedOwners.has(o.id));
    setSelectedOwners(prev => {
      const next = new Set(prev);
      batchOwners.forEach(o => allSelected ? next.delete(o.id) : next.add(o.id));
      return next;
    });
  };

  const toggleOwner = (id) => {
    setSelectedOwners(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedList = owners.filter(o => selectedOwners.has(o.id));

  const handleSend = async () => {
    if (!selectedTemplate || selectedOwners.size === 0) return;
    const confirmMsg = dryRun
      ? `DRY RUN: Simulate "${selectedTemplate.name}" to ${selectedOwners.size} contact(s)? No messages will be sent.`
      : `LIVE SEND: Send "${selectedTemplate.name}" to ${selectedOwners.size} contact(s) via Twilio NOW? You will be charged per message.`;
    if (!confirm(confirmMsg)) return;
    setSending(true);
    setResult(null);
    const res = await appClient.functions.invoke('manualSendSMS', {
      template_id: selectedTemplate.id,
      owner_ids: Array.from(selectedOwners),
      dry_run: dryRun,
    });
    setResult(res.data);
    if (res.data?.success) setSelectedOwners(new Set());
    setSending(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Template picker */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Step 1: Template
            </h2>
            <button
              onClick={() => setTemplateModal('new')}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 rounded-lg px-2 py-1 transition">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {templates.length === 0 && (
            <p className="text-sm text-slate-400 italic">No SMS templates yet. Click Add to create one.</p>
          )}

          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className={`rounded-lg border text-sm transition group relative ${
                selectedTemplate?.id === t.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}>
                <button className="w-full text-left px-3 py-3 pr-14"
                  onClick={() => { setSelectedTemplate(t); setResult(null); }}>
                  <p className="font-medium">{t.name}</p>
                  <p className={`text-xs mt-0.5 ${selectedTemplate?.id === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {t.category?.replace(/_/g, ' ')}
                  </p>
                </button>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={e => { e.stopPropagation(); setTemplateModal(t); }}
                    className={`p-1 rounded ${selectedTemplate?.id === t.id ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-500'}`}>
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      if (!confirm(`Delete template "${t.name}"?`)) return;
                      await appClient.entities.MessageTemplate.delete(t.id);
                      if (selectedTemplate?.id === t.id) setSelectedTemplate(null);
                      onTemplatesChanged();
                    }}
                    className={`p-1 rounded ${selectedTemplate?.id === t.id ? 'hover:bg-white/20 text-red-300' : 'hover:bg-red-50 text-red-400'}`}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {templateModal && (
          <TemplateModal
            open={true}
            onClose={() => setTemplateModal(null)}
            template={templateModal === 'new' ? null : templateModal}
            onSaved={onTemplatesChanged}
          />
        )}

        {selectedTemplate && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-yellow-400 font-semibold mb-2 uppercase tracking-wide">Preview</p>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {previewOwner ? fillTemplate(selectedTemplate.content, previewOwner) : selectedTemplate.content}
            </p>
            {previewOwner && <p className="text-xs text-slate-400 mt-2">Filled for: {previewOwner.owner_name}</p>}
          </div>
        )}
      </div>

      {/* RIGHT: Contacts + Send */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" /> Step 2: Select Contacts
          </h2>

          <div className="flex gap-2 mb-3 flex-wrap">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search name, phone, batch..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
              className="h-8 border border-slate-200 rounded-md px-2 text-xs text-slate-700 bg-white max-w-[200px]">
              {batches.map(b => <option key={b} value={b}>{b === 'all' ? 'All Batches' : b}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-8 border border-slate-200 rounded-md px-2 text-xs text-slate-700 bg-white">
              <option value="all">All Statuses</option>
              <option value="not_contacted">Not Contacted</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="in_conversation">In Conversation</option>
            </select>
          </div>

          <p className="text-xs text-slate-400 mb-2">
            {filteredOwners.length} contacts with phone · {ownersByBatch.length} batch{ownersByBatch.length !== 1 ? 'es' : ''}
            {selectedOwners.size > 0 && <span className="ml-2 text-blue-600 font-semibold">· {selectedOwners.size} selected</span>}
          </p>

          {owners.length > 0 && owners.filter(o => !o.import_batch?.trim()).length > 0 && (
            <div className="mb-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-700">
                <strong>{owners.filter(o => !o.import_batch?.trim()).length} contacts</strong> have no batch label. Go to <strong>Manage Batches</strong> → Rename "No Batch Label" to tag them.
              </p>
            </div>
          )}

          <div className="max-h-[460px] overflow-y-auto border border-slate-100 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-3 py-2 w-8"></th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Phone</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {ownersByBatch.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">No contacts with phone numbers match your filters</td></tr>
                )}
                {ownersByBatch.map(([batchLabel, batchOwners]) => {
                  const allSel = batchOwners.every(o => selectedOwners.has(o.id));
                  const someSel = batchOwners.some(o => selectedOwners.has(o.id));
                  const selCount = batchOwners.filter(o => selectedOwners.has(o.id)).length;
                  return (
                    <React.Fragment key={batchLabel}>
                      <tr className="bg-slate-800">
                        <td className="px-3 py-2">
                          <button onClick={() => toggleBatch(batchOwners)}>
                            {allSel
                              ? <CheckSquare className="w-4 h-4 text-white" />
                              : someSel
                                ? <CheckSquare className="w-4 h-4 text-slate-400" />
                                : <Square className="w-4 h-4 text-slate-400" />}
                          </button>
                        </td>
                        <td colSpan={4} className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${batchLabel.includes('No Batch') ? 'text-orange-300' : 'text-yellow-300'}`}>
                              📂 {batchLabel}
                            </span>
                            <span className="text-xs text-slate-400">{batchOwners.length} contacts</span>
                            {someSel && <span className="text-xs font-semibold text-blue-300">{selCount} selected</span>}
                          </div>
                        </td>
                      </tr>
                      {batchOwners.map((owner, i) => (
                        <tr key={owner.id}
                          className={`border-b border-slate-100 cursor-pointer transition ${selectedOwners.has(owner.id) ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-blue-50/60`}
                          onClick={() => toggleOwner(owner.id)}>
                          <td className="px-3 py-2.5">
                            {selectedOwners.has(owner.id)
                              ? <CheckSquare className="w-4 h-4 text-blue-600" />
                              : <Square className="w-4 h-4 text-slate-300" />}
                          </td>
                          <td className="px-3 py-2.5 font-medium text-slate-900 max-w-[160px] truncate">{owner.owner_name}</td>
                          <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap text-xs">{owner.phone}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              owner.contact_status === 'not_contacted' ? 'bg-slate-100 text-slate-600' :
                              owner.contact_status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                              owner.contact_status === 'interested' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>{owner.contact_status?.replace(/_/g, ' ') || 'not contacted'}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center" onClick={e => e.stopPropagation()}>
                            {selectedTemplate && (
                              <button onClick={() => setPreviewOwner(previewOwner?.id === owner.id ? null : owner)}
                                className={`p-1 rounded transition ${previewOwner?.id === owner.id ? 'text-yellow-600 bg-yellow-50' : 'text-slate-400 hover:text-slate-700'}`}>
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 3: Send */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Send className="w-4 h-4" /> Step 3: Review & Send
          </h2>

          {!selectedTemplate && <p className="text-sm text-slate-400">← Select a template first</p>}
          {selectedTemplate && selectedOwners.size === 0 && <p className="text-sm text-slate-400">← Select at least one contact above</p>}

          {selectedTemplate && selectedOwners.size > 0 && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Template:</span>
                  <span className="font-medium text-slate-800">{selectedTemplate.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipients:</span>
                  <span className="font-medium text-slate-800">{selectedOwners.size} contact{selectedOwners.size !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedList.slice(0, 8).map(o => (
                  <span key={o.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{o.owner_name}</span>
                ))}
                {selectedList.length > 8 && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">+{selectedList.length - 8} more</span>}
              </div>

              <div className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 ${dryRun ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'}`}>
                <div>
                  <p className={`text-sm font-bold ${dryRun ? 'text-yellow-800' : 'text-red-800'}`}>
                    {dryRun ? '🧪 DRY RUN — No messages will be sent' : '🔴 LIVE MODE — Real Twilio messages will be sent'}
                  </p>
                  <p className={`text-xs mt-0.5 ${dryRun ? 'text-yellow-600' : 'text-red-600'}`}>
                    {dryRun ? 'Toggle off to send real SMS (you will be charged)' : 'Toggle on to test safely without charges'}
                  </p>
                </div>
                <button onClick={() => setDryRun(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${dryRun ? 'bg-yellow-400' : 'bg-red-500'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${dryRun ? 'left-1' : 'left-7'}`} />
                </button>
              </div>

              <Button onClick={handleSend} disabled={sending}
                className={`w-full h-11 text-base font-semibold gap-2 ${dryRun ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                {sending
                  ? <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />{dryRun ? 'Simulating...' : 'Sending...'}</>
                  : dryRun
                    ? <><Send className="w-4 h-4" />Dry Run — {selectedOwners.size} Contact{selectedOwners.size !== 1 ? 's' : ''}</>
                    : <><Send className="w-4 h-4" />LIVE SEND to {selectedOwners.size} Contact{selectedOwners.size !== 1 ? 's' : ''}</>}
              </Button>
            </div>
          )}

          {result && (
            <div className={`mt-3 rounded-lg px-4 py-3 text-sm font-medium ${
              result.success
                ? result.dry_run
                  ? 'bg-yellow-50 border border-yellow-300 text-yellow-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {result.success
                ? result.dry_run
                  ? `🧪 Dry Run: Would have sent ${result.sent} message${result.sent !== 1 ? 's' : ''}. No charges.`
                  : `✓ Sent ${result.sent} successfully.${result.failed > 0 ? ` ${result.failed} failed.` : ''}`
                : `✗ Error: ${result.error}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SENT HISTORY TAB ────────────────────────────────────────────────────────
function SentHistoryTab() {
  const queryClient = useQueryClient();
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['batchSMSLogs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 200),
  });

  const handleDelete = async (log) => {
    if (!confirm(`Delete this log entry for "${log.city}"? This only removes the log record, not the actual sends.`)) return;
    await appClient.entities.BatchSMSLog.delete(log.id);
    queryClient.invalidateQueries({ queryKey: ['batchSMSLogs'] });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Clock className="w-4 h-4" /> Sent Campaign History</h2>
        <span className="text-xs text-slate-400">{logs.length} log entries</span>
      </div>
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">These logs record what was <strong>queued/attempted</strong>. "Sent" = queued to Twilio, not necessarily delivered. Delete any inaccurate entries using the trash icon.</p>
      </div>
      {logs.length === 0 ? (
        <div className="px-4 py-12 text-center text-slate-400">No SMS logs recorded yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs text-slate-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2">Batch / City</th>
              <th className="text-left px-4 py-2">Sent At</th>
              <th className="text-left px-4 py-2">Sent By</th>
              <th className="text-center px-4 py-2">Total</th>
              <th className="text-center px-4 py-2">Queued</th>
              <th className="text-center px-4 py-2">Failed</th>
              <th className="text-left px-4 py-2">Notes</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                <td className="px-4 py-3 font-medium text-slate-800">{log.city}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{new Date(log.sent_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[120px]">{log.sent_by || '—'}</td>
                <td className="px-4 py-3 text-center text-slate-700">{log.batch_size}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-blue-700 font-semibold">{log.sent_count ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${log.failed_count > 0 ? 'text-red-600' : 'text-slate-400'}`}>{log.failed_count ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">{log.notes || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(log)} className="text-slate-300 hover:text-red-500 transition p-1" title="Delete log entry">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── MANAGE BATCHES TAB ──────────────────────────────────────────────────────
function ManageBatchesTab({ owners, onOwnersChanged }) {
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [renamingBatch, setRenamingBatch] = useState(null); // label string

  const batches = useMemo(() => {
    const map = {};
    owners.forEach(o => {
      const key = o.import_batch?.trim() || '⚠️ No Batch Label';
      if (!map[key]) map[key] = { label: key, owners: [], statuses: {} };
      map[key].owners.push(o);
      const s = o.contact_status || 'not_contacted';
      map[key].statuses[s] = (map[key].statuses[s] || 0) + 1;
    });
    return Object.values(map).sort((a, b) => {
      // Put "No Batch Label" last
      if (a.label.includes('No Batch')) return 1;
      if (b.label.includes('No Batch')) return -1;
      return a.label.localeCompare(b.label);
    });
  }, [owners]);

  const handleDeleteBatch = async (batchLabel) => {
    const batchOwners = owners.filter(o =>
      batchLabel === '⚠️ No Batch Label'
        ? !o.import_batch?.trim()
        : o.import_batch?.trim() === batchLabel
    );
    if (!confirm(`Delete ALL ${batchOwners.length} contacts in batch "${batchLabel}"? This cannot be undone.`)) return;
    setDeletingBatch(batchLabel);
    for (const o of batchOwners) {
      await appClient.entities.ListingOwner.delete(o.id);
      await new Promise(r => setTimeout(r, 50));
    }
    onOwnersChanged();
    setDeletingBatch(null);
  };

  return (
    <div className="space-y-3">
      {renamingBatch && (
        <RenameBatchModal
          open={true}
          onClose={() => setRenamingBatch(null)}
          currentLabel={renamingBatch}
          owners={owners}
          onRenamed={() => { onOwnersChanged(); setRenamingBatch(null); }}
        />
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Imported Batches / Spreadsheets
          </h2>
          <span className="text-xs text-slate-400">{batches.length} batch{batches.length !== 1 ? 'es' : ''} · {owners.length} total contacts</span>
        </div>

        {batches.some(b => b.label === '⚠️ No Batch Label') && (
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-700">
              Some contacts have no batch label — they were likely imported before the batch-name feature was added.
              Click <strong>Rename</strong> on the "No Batch Label" row to tag them with the correct spreadsheet name.
            </p>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {batches.map(batch => (
            <div key={batch.label} className={`px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition ${batch.label === '⚠️ No Batch Label' ? 'bg-orange-50/40' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${batch.label === '⚠️ No Batch Label' ? 'text-orange-700' : 'text-slate-800'}`}>
                    📂 {batch.label}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{batch.owners.length} contacts</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(batch.statuses).map(([status, count]) => (
                    <span key={status} className={`text-xs px-2 py-0.5 rounded-full ${
                      status === 'not_contacted' ? 'bg-slate-100 text-slate-600' :
                      status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                      status === 'interested' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{count} {status.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setRenamingBatch(batch.label)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    batch.label === '⚠️ No Batch Label'
                      ? 'border-orange-300 text-orange-700 hover:bg-orange-100 font-semibold'
                      : 'border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900'
                  }`}>
                  {batch.label === '⚠️ No Batch Label' ? '⚡ Assign Name' : 'Rename'}
                </button>
                <button
                  onClick={() => handleDeleteBatch(batch.label)}
                  disabled={deletingBatch === batch.label}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center gap-1 disabled:opacity-50">
                  {deletingBatch === batch.label
                    ? <><RefreshCw className="w-3 h-3 animate-spin" />Deleting...</>
                    : <><Trash2 className="w-3 h-3" />Delete All</>}
                </button>
              </div>
            </div>
          ))}
          {batches.length === 0 && (
            <div className="px-4 py-12 text-center text-slate-400">No contacts imported yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function AdminComposeSMS() {
  const [tab, setTab] = useState('compose');
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['messageTemplates'],
    queryFn: () => appClient.entities.MessageTemplate.filter({ communication_type: 'sms', is_active: true }),
  });

  const { data: owners = [], isLoading: ownersLoading } = useQuery({
    queryKey: ['listingOwners'],
    queryFn: () => appClient.entities.ListingOwner.list('-created_date', 5000),
  });

  // Deduplicate templates by name, keep newest
  const uniqueTemplates = useMemo(() => {
    const map = {};
    templates.forEach(t => {
      if (!map[t.name] || new Date(t.updated_date) > new Date(map[t.name].updated_date)) map[t.name] = t;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [templates]);

  const refreshTemplates = () => queryClient.invalidateQueries({ queryKey: ['messageTemplates'] });
  const refreshOwners = () => queryClient.invalidateQueries({ queryKey: ['listingOwners'] });

  const TABS = [
    { id: 'compose', label: 'Compose & Send', icon: Send },
    { id: 'history', label: 'Sent History', icon: Clock },
    { id: 'batches', label: 'Manage Batches', icon: Layers },
  ];

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-slate-900">SMS Campaign Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Compose, review history, and manage imported contact batches.
            {ownersLoading && <span className="ml-2 text-slate-400">Loading contacts...</span>}
            {!ownersLoading && <span className="ml-2 text-slate-400">{owners.length} total contacts loaded.</span>}
          </p>
        </div>

        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.id ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'compose' && (
          <ComposeTab
            templates={uniqueTemplates}
            owners={owners}
            onTemplatesChanged={refreshTemplates}
          />
        )}
        {tab === 'history' && <SentHistoryTab />}
        {tab === 'batches' && (
          <ManageBatchesTab
            owners={owners}
            onOwnersChanged={refreshOwners}
          />
        )}
      </div>
    </div>
  );
}