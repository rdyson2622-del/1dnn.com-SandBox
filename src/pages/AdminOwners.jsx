import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Upload, Send, Trash2, Pencil, MapPin, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import OwnerForm from '@/components/admin/OwnerForm';
import OwnerImportCSV from '@/components/admin/OwnerImportCSV';

const STATUS_COLORS = {
  not_contacted: 'bg-slate-100 text-slate-600',
  contacted:     'bg-blue-100 text-blue-700',
  in_conversation: 'bg-yellow-100 text-yellow-700',
  interested:    'bg-green-100 text-green-700',
  not_interested:'bg-red-100 text-red-700',
  converted:     'bg-purple-100 text-purple-700',
};

function fmt(price) {
  if (!price) return '';
  const n = parseFloat(price);
  if (isNaN(n)) return '';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
}

function CityGroup({ city, owners, onEdit, onDelete, onDeleteAll, onDeleteSelected, onStatusChange, onSendBatch, sendingBatch, batchStatus, activeCampaign }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());

  const filtered = owners.filter(o =>
    !search ||
    o.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.property_address?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.includes(search)
  );

  const unsent = owners.filter(o => o.phone && o.contact_status === 'not_contacted').length;

  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const allChecked = filtered.length > 0 && filtered.every(o => selected.has(o.id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(filtered.map(o => o.id)));

  return (
    <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
      {/* Group Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2 flex-1">
          {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800">{city || 'Unknown City'}</span>
          <span className="text-xs text-slate-500 ml-1">({owners.length} owners{unsent > 0 ? `, ${unsent} unsent` : ''})</span>
          {(unsent > 0 || batchStatus) && (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
              batchStatus === 'in_progress' ? 'bg-green-100 text-green-700' :
              batchStatus === 'completed' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {batchStatus === 'in_progress' ? '⏳ In Progress' :
               batchStatus === 'completed' ? '✓ Completed' : '⏳ Pending'}
            </span>
          )}
          {activeCampaign && (
            <span className="ml-auto text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {activeCampaign.progress}% • {activeCampaign.estimatedSent}/{activeCampaign.total} sent
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end" onClick={e => e.stopPropagation()}>
          {unsent > 0 && (
            <Button
              size="sm"
              className="gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs whitespace-nowrap"
              disabled={sendingBatch}
              onClick={(e) => { e.stopPropagation(); onSendBatch(city, owners); }}
            >
              {sendingBatch ? (
                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-3 h-3" /> Send All ({unsent})</>
              )}
            </Button>
          )}
          {selected.size > 0 && (
            <>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={(e) => { e.stopPropagation(); onSendBatch(city, owners.filter(o => selected.has(o.id))); }}
              >
                <Send className="w-3 h-3" /> Send ({selected.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-red-400 text-red-700 hover:bg-red-50 text-xs"
                onClick={(e) => { e.stopPropagation(); onDeleteSelected(Array.from(selected), () => setSelected(new Set())); }}
              >
                <Trash2 className="w-3 h-3" /> Delete ({selected.size})
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-red-400 text-red-700 hover:bg-red-50 text-xs"
            disabled={sendingBatch}
            onClick={(e) => { e.stopPropagation(); onDeleteAll(city, owners); }}
          >
            <Trash2 className="w-3 h-3" /> Delete All
          </Button>
        </div>
      </div>

      {open && (
        <div>
          {/* Search within group */}
          <div className="px-4 py-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Filter within this city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-2 w-8">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} className="cursor-pointer" />
                  </th>
                  <th className="text-left px-4 py-2 font-medium">Owner Name</th>
                  <th className="text-left px-4 py-2 font-medium">Address</th>
                  <th className="text-left px-4 py-2 font-medium">Phone</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Price</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((owner, i) => (
                  <tr key={owner.id} className={`border-b border-slate-100 hover:bg-slate-50 transition ${selected.has(owner.id) ? 'bg-red-50/40' : i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                    <td className="px-4 py-2.5 w-8">
                      <input type="checkbox" checked={selected.has(owner.id)} onChange={() => toggleSelect(owner.id)} className="cursor-pointer" />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900 max-w-[160px] truncate">{owner.owner_name || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-[200px] truncate">{owner.property_address || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{owner.phone || <span className="text-slate-300">no phone</span>}</td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-[160px] truncate">{owner.email || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap font-medium">{fmt(owner.listing_price)}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={owner.contact_status || 'not_contacted'}
                        onChange={e => onStatusChange(owner.id, e.target.value)}
                        className={`text-xs rounded-full px-2 py-1 font-medium border-0 cursor-pointer ${STATUS_COLORS[owner.contact_status] || STATUS_COLORS.not_contacted}`}
                      >
                        <option value="not_contacted">Not Contacted</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_conversation">In Conversation</option>
                        <option value="interested">Interested</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {owner.phone && (
                          <button 
                            onClick={() => onSendBatch(city, [owner])}
                            className="px-2.5 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
                            title="Send SMS to this owner"
                          >
                            Send
                          </button>
                        )}
                        <button onClick={() => onEdit(owner)} className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(owner.id)} className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400 text-sm">No results</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOwners() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [sendingBatchCity, setSendingBatchCity] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [batchStatuses, setBatchStatuses] = useState({}); // { city: 'pending' | 'in_progress' | 'completed' }
  const [activeCampaigns, setActiveCampaigns] = useState({}); // { city: { estimatedSent, total, failed, remainingMinutes } }
  const queryClient = useQueryClient();

  // Auto-clear batch result and status after 5 seconds
  React.useEffect(() => {
    if (batchResult) {
      const timer = setTimeout(() => {
        setBatchResult(null);
        setBatchStatuses(prev => {
          const next = { ...prev };
          delete next[batchResult.city];
          return next;
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [batchResult]);

  const { data: owners = [] } = useQuery({
    queryKey: ['listingOwners'],
    queryFn: () => appClient.entities.ListingOwner.list('-created_date', 2000),
  });

  const { data: batchLogs = [] } = useQuery({
    queryKey: ['batchSmsLogs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 100),
    refetchInterval: 5000, // Auto-refresh every 5 seconds for live progress
  });

  // Update active campaigns status
  React.useEffect(() => {
    const now = new Date();
    const active = {};
    batchLogs.forEach(log => {
      const sentAt = new Date(log.sent_at);
      const elapsedMs = now - sentAt;
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      const totalMinutes = log.sent_count * 3;
      const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);
      
      if (remainingMinutes > 0) {
        const estimatedSent = Math.min(log.sent_count, Math.floor(elapsedMinutes / 3));
        active[log.city] = {
          estimatedSent,
          total: log.sent_count,
          failed: log.failed_count || 0,
          remainingMinutes,
          progress: Math.min(100, Math.round((estimatedSent / log.sent_count) * 100)),
        };
      }
    });
    setActiveCampaigns(active);
  }, [batchLogs]);

  // Group by city
  const grouped = useMemo(() => {
    const filtered = globalSearch
      ? owners.filter(o =>
          o.owner_name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
          o.property_address?.toLowerCase().includes(globalSearch.toLowerCase()) ||
          o.property_city?.toLowerCase().includes(globalSearch.toLowerCase()) ||
          o.phone?.includes(globalSearch)
        )
      : owners;

    const map = {};
    for (const owner of filtered) {
      const city = owner.property_city?.trim() || 'Unknown';
      if (!map[city]) map[city] = [];
      map[city].push(owner);
    }
    // Sort cities alphabetically
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [owners, globalSearch]);

  const handleDeleteAll = async (city, cityOwners) => {
    if (!confirm(`Delete ALL ${cityOwners.length} records in ${city}? This cannot be undone.`)) return;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    for (const o of cityOwners) {
      try { await appClient.entities.ListingOwner.delete(o.id); await sleep(300); }
      catch (e) { await sleep(500); }
    }
    queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
  };

  const handleDeleteSelected = async (ids, onDone) => {
    if (!confirm(`Delete ${ids.length} selected record(s)? This cannot be undone.`)) return;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    for (const id of ids) {
      try { await appClient.entities.ListingOwner.delete(id); await sleep(300); }
      catch (e) { await sleep(500); }
    }
    queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
    onDone?.();
  };

  const handleDeleteUnknowns = async (city, cityOwners) => {
    const isUnknownName = (name) => !name || name.trim() === '' || /^unknown/i.test(name.trim());
    const toDelete = cityOwners.filter(o => isUnknownName(o.owner_name));
    if (!toDelete.length) return;
    if (!confirm(`Delete ${toDelete.length} records with no name/phone in ${city}? This cannot be undone.`)) return;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    for (const o of toDelete) {
      try {
        await appClient.entities.ListingOwner.delete(o.id);
        await sleep(300);
      } catch (e) {
        // skip not-found or already deleted
        await sleep(500);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
  };

  const [sendingBatchCities, setSendingBatchCities] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [scheduleDialog, setScheduleDialog] = useState(null); // { city, owners, count, estHours }
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const handleSendBatch = async (city, cityOwners) => {
    const unsent = cityOwners.filter(o => o.phone);
    if (!unsent.length) return;

    const estMinutes = unsent.length * 3;
    const estHours = (estMinutes / 60).toFixed(1);
    setConfirmDialog({
      city,
      count: unsent.length,
      estHours,
      owners: unsent,
    });
  };

  const handleScheduleLater = async () => {
    if (!scheduleDate || !scheduleTime) return;
    const { city, owners } = scheduleDialog;
    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    const me = await appClient.auth.me();
    await appClient.entities.ScheduledCampaign.create({
      city,
      scheduled_for: scheduledFor,
      owners: owners.map(o => ({
        listing_owner_id: o.id,
        phone: o.phone,
        owner_name: o.owner_name,
        property_address: o.property_address,
      })),
      owner_count: owners.length,
      status: 'scheduled',
      scheduled_by: me?.email || 'unknown',
    });
    setScheduleDialog(null);
    setScheduleDate('');
    setScheduleTime('09:00');
    setBatchResult({ city, scheduled: true, count: owners.length, scheduledFor });
  };

  const confirmSendBatch = async (city, owners) => {
    setConfirmDialog(null);
    if (sendingBatchCities.has(city)) return; // Already sending
    const unsent = owners.filter(o => o.phone);

    setSendingBatchCities(prev => new Set(prev).add(city));
    setBatchResult(null);
    setBatchStatuses(prev => ({ ...prev, [city]: 'in_progress' }));
    
    try {
      const prepRes = await appClient.functions.invoke('prepareBatchOutreachSMS', {
        city,
        owners: unsent.map(o => ({
          listing_owner_id: o.id,
          phone: o.phone,
          owner_name: o.owner_name,
          property_address: o.property_address,
        })),
      });

      if (!prepRes.data.success) {
        setBatchResult({ city, error: prepRes.data.error });
        setBatchStatuses(prev => ({ ...prev, [city]: 'completed' }));
        return;
      }

      const sendRes = await appClient.functions.invoke('sendPreparedBatchSMS', {
        city,
        prepared_batch: prepRes.data.prepared_batch,
      });

      setBatchResult({ city, ...sendRes.data });
      setBatchStatuses(prev => ({ ...prev, [city]: 'completed' }));
      queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
      
      // Disable button for 10 seconds
      setTimeout(() => {
        setSendingBatchCities(prev => { const next = new Set(prev); next.delete(city); return next; });
      }, 10000);
    } catch (e) {
      setBatchResult({ city, error: e.message });
      setBatchStatuses(prev => ({ ...prev, [city]: 'completed' }));
      setSendingBatchCities(prev => { const next = new Set(prev); next.delete(city); return next; });
    }
  };

  const handleAdd = async (formData) => {
    await appClient.entities.ListingOwner.create(formData);
    queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
    setShowForm(false);
  };

  const handleEdit = async (formData) => {
    await appClient.entities.ListingOwner.update(editingOwner.id, formData);
    queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
    setEditingOwner(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await appClient.entities.ListingOwner.delete(id);
    queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (id, status) => {
    await appClient.entities.ListingOwner.update(id, {
      contact_status: status,
      last_contacted: new Date().toISOString().split('T')[0],
    });
    queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
  };

  const totalUnsent = owners.filter(o => o.phone && o.contact_status === 'not_contacted').length;
  const totalActive = Object.keys(activeCampaigns).length;
  const totalQueued = Object.values(activeCampaigns).reduce((sum, c) => sum + c.total, 0);
  const totalSent = Object.values(activeCampaigns).reduce((sum, c) => sum + c.estimatedSent, 0);

  return (
    <div className="p-6 min-h-screen bg-white">
      {/* Active Campaigns Stats Bar */}
      {totalActive > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-600 font-medium">ACTIVE CAMPAIGNS</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalSent} / {totalQueued} sent</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Cities</p>
                <p className="text-lg font-bold text-blue-600">{totalActive}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Failed</p>
                <p className="text-lg font-bold text-red-600">{Object.values(activeCampaigns).reduce((sum, c) => sum + c.failed, 0)}</p>
              </div>
            </div>
          </div>
          <a href="/admin/active-campaigns" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition">
            View Live Dashboard →
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Listing Owners</h1>
          <p className="text-sm text-slate-500 mt-1">
            {owners.length} total · {totalUnsent} unsent · {grouped.length} cities
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button variant="outline" onClick={() => { setEditingOwner(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Owner
          </Button>
        </div>
      </div>

      {/* Batch result banner */}
      {batchResult && (
        <div className={`mb-4 border rounded-lg px-4 py-3 text-sm font-semibold ${batchResult.error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {batchResult.error
            ? `✗ ${batchResult.city}: ${batchResult.error}`
            : batchResult.scheduled
            ? `📅 ${batchResult.city}: ${batchResult.count} messages scheduled for ${new Date(batchResult.scheduledFor).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`
            : `✓ ${batchResult.city}: ${batchResult.sent} messages queued, ${batchResult.failed || 0} failed. All scheduled automatically, spaced 3 min apart.`
          }
          <button onClick={() => setBatchResult(null)} className="ml-3 text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Global search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search all owners by name, address, city, or phone..."
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* City Groups */}
      {grouped.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No owners yet</p>
          <p className="text-sm mt-1">Import a CSV to get started</p>
        </div>
      )}

      {grouped.map(([city, cityOwners]) => (
        <CityGroup
          key={city}
          city={city}
          owners={cityOwners}
          onEdit={(owner) => { setEditingOwner(owner); setShowForm(true); }}
          onDelete={(id) => setDeleteConfirm(id)}
          onDeleteAll={handleDeleteAll}
          onDeleteSelected={handleDeleteSelected}
          onStatusChange={handleStatusChange}
          onSendBatch={handleSendBatch}
          sendingBatch={sendingBatchCities.has(city)}
          batchStatus={batchStatuses[city] || null}
          activeCampaign={activeCampaigns[city]}
        />
      ))}

      {/* Modals */}
      <OwnerForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingOwner(null); }}
        owner={editingOwner}
        onSave={editingOwner ? handleEdit : handleAdd}
      />

      <OwnerImportCSV
        open={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={() => {
          setShowImport(false);
          queryClient.invalidateQueries({ queryKey: ['listingOwners'] });
        }}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
            <h2 className="font-semibold text-lg mb-2">Delete Owner?</h2>
            <p className="text-slate-600 mb-6 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <h2 className="font-semibold text-lg mb-1">Send {confirmDialog.count} Messages?</h2>
            <p className="text-slate-600 text-sm mb-4">
              {confirmDialog.city} · ~{confirmDialog.estHours} hours to deliver (3-min spacing)
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs text-blue-800">
              <strong>⚠️ Important:</strong> You can only click once. The button will be disabled for 10 seconds to prevent duplicate sends.
            </div>
            <div className="flex gap-3 justify-end flex-wrap">
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
              <Button
                variant="outline"
                className="border-amber-400 text-amber-700 hover:bg-amber-50 gap-1.5"
                onClick={() => {
                  setScheduleDialog({ city: confirmDialog.city, owners: confirmDialog.owners, count: confirmDialog.count, estHours: confirmDialog.estHours });
                  setConfirmDialog(null);
                }}
              >
                <Calendar className="w-4 h-4" /> Schedule for Later
              </Button>
              <Button onClick={() => confirmSendBatch(confirmDialog.city, confirmDialog.owners)} className="bg-blue-600 hover:bg-blue-700">
                Send Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {scheduleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" /> Schedule Campaign
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              {scheduleDialog.city} · {scheduleDialog.count} recipients · ~{scheduleDialog.estHours}h to deliver
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Time (your local time)</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                The system checks every 5 minutes and will fire this campaign automatically at the scheduled time.
                You can pause or cancel it from <Link to="/admin/scheduled-campaigns" className="underline font-semibold">Scheduled Campaigns</Link>.
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setScheduleDialog(null)}>Cancel</Button>
              <Button
                disabled={!scheduleDate || !scheduleTime}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                onClick={handleScheduleLater}
              >
                <Calendar className="w-4 h-4" /> Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}