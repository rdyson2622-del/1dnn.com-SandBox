import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { ChevronDown, ChevronRight, Send, CheckCircle2, AlertCircle, MapPin, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const SMS_TEMPLATE = `Hi {{owner_name}}, this is Dyson & Dyson Concierge Relocation. We noticed your home is listed — We offer our FREE Concierge Relocation Services to manage your entire move & find your next home. Learn more from: https://dysonrelo.com and a testimonial at https://youtu.be/In_JbQXZoy0 — Reply YES or call Bob at (858) 353-1200. Reply STOP to opt out.`;

function CityRow({ city, batches, onDelete }) {
  const [open, setOpen] = useState(false);

  const totalBatchSize = batches.reduce((s, b) => s + (b.batch_size || 0), 0);
  const totalSent = batches.reduce((s, b) => s + (b.sent_count || 0), 0);
  const totalFailed = batches.reduce((s, b) => s + (b.failed_count || 0), 0);
  const totalSkipped = batches.reduce((s, b) => s + (b.skipped_count || 0), 0);
  const totalDuration = batches.reduce((s, b) => s + (b.estimated_duration_minutes || 0), 0);
  const successRate = totalBatchSize > 0 ? Math.round((totalSent / totalBatchSize) * 100) : 0;
  const lastSent = batches[0]?.sent_at ? new Date(batches[0].sent_at) : null;

  return (
    <>
      {/* City summary row */}
      <tr
        className="border-b border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition"
        onClick={() => setOpen(v => !v)}
      >
        <td className="px-4 py-3 w-8">
          {open
            ? <ChevronDown className="w-4 h-4 text-slate-500" />
            : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{city}</span>
            <span className="text-xs text-slate-400">({batches.length} batch{batches.length !== 1 ? 'es' : ''})</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center text-slate-700 font-medium">{totalBatchSize}</td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" />{totalSent}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {totalFailed > 0
            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><AlertCircle className="w-3 h-3" />{totalFailed}</span>
            : <span className="text-slate-400 text-sm">0</span>}
        </td>
        <td className="px-4 py-3 text-center text-slate-500 text-sm">{totalSkipped}</td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 font-medium">{successRate}%</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center text-slate-600 text-sm">{totalDuration ? `${Math.round(totalDuration / 60 * 10) / 10}h` : '—'}</td>
        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
          {lastSent ? lastSent.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </td>
      </tr>

      {/* Expanded individual batches */}
      {open && batches.map((log, i) => (
        <tr key={log.id} className="border-b border-slate-100 bg-slate-50/70">
          <td className="px-4 py-2" />
          <td className="px-4 py-2 pl-10 text-xs text-slate-500">
            ↳ {new Date(log.sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
            <span className="ml-2 text-slate-400">by {log.sent_by?.split('@')[0]}</span>
            {log.notes && <span className="ml-2 italic text-slate-400">· {log.notes}</span>}
          </td>
          <td className="px-4 py-2 text-center text-xs text-slate-500">{log.batch_size}</td>
          <td className="px-4 py-2 text-center text-xs text-green-700 font-medium">{log.sent_count || 0}</td>
          <td className="px-4 py-2 text-center text-xs text-red-600 font-medium">{log.failed_count || 0}</td>
          <td className="px-4 py-2 text-center text-xs text-slate-400">{log.skipped_count || 0}</td>
          <td className="px-4 py-2 text-center text-xs text-slate-400" />
          <td className="px-4 py-2 text-center text-xs text-slate-400">{log.estimated_duration_minutes ? `${log.estimated_duration_minutes}m` : '—'}</td>
          <td className="px-4 py-2 text-center">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
              className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition"
              title="Delete this batch log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminBatchSMSLog() {
  const [templateOpen, setTemplateOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch log entry?')) return;
    await appClient.entities.BatchSMSLog.delete(id);
    queryClient.invalidateQueries({ queryKey: ['batchSMSLogs'] });
  };

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['batchSMSLogs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 500),
    refetchInterval: 10000,
    staleTime: 0,
  });

  // Group by city, sorted by most recent send
  const grouped = useMemo(() => {
    const map = {};
    for (const log of logs) {
      const city = log.city?.trim() || 'Unknown';
      if (!map[city]) map[city] = [];
      map[city].push(log);
    }
    // Sort cities by their most recent batch date
    return Object.entries(map).sort(([, a], [, b]) => {
      const aDate = new Date(a[0]?.sent_at || 0);
      const bDate = new Date(b[0]?.sent_at || 0);
      return bDate - aDate;
    });
  }, [logs]);

  const grandTotalSent = logs.reduce((s, l) => s + (l.sent_count || 0), 0);
  const grandTotalFailed = logs.reduce((s, l) => s + (l.failed_count || 0), 0);
  const grandTotalBatch = logs.reduce((s, l) => s + (l.batch_size || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* Header + Grand Totals */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Batch SMS Campaign Log</h1>
            <p className="text-sm text-slate-500 mt-1">{grouped.length} cities · {logs.length} batches · {grandTotalBatch.toLocaleString()} total contacts</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-green-600">{grandTotalSent.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">Sent</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-red-500">{grandTotalFailed.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">Failed</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-slate-700">{grouped.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Cities</p>
            </div>
          </div>
        </div>

        {/* SMS Template (collapsible) */}
        <div className="mb-5 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-3 text-left"
            onClick={() => setTemplateOpen(v => !v)}
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold text-white text-sm">Active SMS Template — Day 1 Initial Outreach</span>
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">LIVE</span>
            </div>
            {templateOpen
              ? <ChevronDown className="w-4 h-4 text-slate-400" />
              : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>
          {templateOpen && (
            <div className="px-5 pb-4">
              <div className="bg-slate-800 rounded-lg px-4 py-3 text-sm text-slate-100 leading-relaxed border border-slate-600">
                {SMS_TEMPLATE}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                <code className="bg-slate-700 text-yellow-300 px-1 rounded">{'{{owner_name}}'}</code> is replaced with each contact's name at send time.
              </p>
            </div>
          )}
        </div>

        {/* Main Table */}
        {logs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl py-16 text-center text-slate-400">
            <Send className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No batch campaigns sent yet</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-8" />
                  <th className="text-left px-4 py-3 font-semibold">City / Campaign</th>
                  <th className="text-center px-4 py-3 font-semibold">Total</th>
                  <th className="text-center px-4 py-3 font-semibold">Sent ✓</th>
                  <th className="text-center px-4 py-3 font-semibold">Failed ✗</th>
                  <th className="text-center px-4 py-3 font-semibold">Skipped</th>
                  <th className="text-center px-4 py-3 font-semibold">Success Rate</th>
                  <th className="text-center px-4 py-3 font-semibold">Est. Duration</th>
                  <th className="text-left px-4 py-3 font-semibold">Last Sent</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(([city, batches]) => (
                  <CityRow key={city} city={city} batches={batches} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}