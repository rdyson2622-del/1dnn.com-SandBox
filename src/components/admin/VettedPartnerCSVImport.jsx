import React, { useState, useRef } from 'react';
import { appClient } from '@/api/appClient';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const GOLD = '#D4AF37';

const FIELD_MAP = {
  // agent name
  'agent name': 'agent_name', 'name': 'agent_name', 'agent_name': 'agent_name',
  'full name': 'agent_name', 'fullname': 'agent_name', 'agent': 'agent_name',
  // city
  'city': 'city', 'market': 'city', 'market city': 'city',
  // state
  'state': 'state', 'st': 'state',
  // city slug
  'city slug': 'city_slug', 'slug': 'city_slug', 'city_slug': 'city_slug',
  // rank
  'rank': 'rank', '#': 'rank', 'ranking': 'rank',
  // brokerage
  'brokerage': 'brokerage', 'broker': 'brokerage', 'brokerage name': 'brokerage', 'company': 'brokerage', 'firm': 'brokerage',
  // brokerage category
  'brokerage category': 'brokerage_category', 'brokerage_category': 'brokerage_category', 'category': 'brokerage_category', 'type': 'brokerage_category',
  // market type
  'market type': 'market_type', 'market_type': 'market_type', 'market role': 'market_type',
  // sales count
  'sales count': 'sales_count_2025', 'sales #': 'sales_count_2025', 'transactions': 'sales_count_2025',
  '2025 sales': 'sales_count_2025', 'sales_2025': 'sales_count_2025', 'sales count 2025': 'sales_count_2025',
  'units': 'sales_count_2025', 'units sold': 'sales_count_2025', 'closed transactions': 'sales_count_2025',
  'sales': 'sales_count_2025', '# of sales': 'sales_count_2025', 'number of sales': 'sales_count_2025',
  // sales volume
  'sales volume': 'sales_volume_2025', 'volume': 'sales_volume_2025', '2025 volume': 'sales_volume_2025',
  'volume_2025': 'sales_volume_2025', 'sales volume 2025': 'sales_volume_2025',
  'total volume': 'sales_volume_2025', 'total sales volume': 'sales_volume_2025', 'gross volume': 'sales_volume_2025',
  // avg price
  'avg price': 'avg_price_point', 'avg price point': 'avg_price_point', 'average price': 'avg_price_point',
  'avg_price': 'avg_price_point', 'average sale price': 'avg_price_point', 'avg sale price': 'avg_price_point',
  'average sales price': 'avg_price_point', 'median price': 'avg_price_point', 'avg sold price': 'avg_price_point',
  // phone
  'phone': 'phone', 'phone number': 'phone', 'phone_number': 'phone', 'cell': 'phone', 'mobile': 'phone',
  'cell phone': 'phone', 'cell_phone': 'phone', 'telephone': 'phone', 'contact phone': 'phone',
  'contact_phone': 'phone', 'agent phone': 'phone', 'agent_phone': 'phone',
  'direct': 'phone', 'direct phone': 'phone', 'direct_phone': 'phone',
  // email
  'email': 'email', 'email address': 'email', 'email_address': 'email', 'contact email': 'email',
  'contact_email': 'email', 'e-mail': 'email', 'agent email': 'email', 'agent_email': 'email',
  // status
  'status': 'status', 'prn status': 'status', 'membership status': 'status',
  // notes
  'notes': 'outreach_notes', 'note': 'outreach_notes', 'outreach notes': 'outreach_notes', 'comments': 'outreach_notes', 'comment': 'outreach_notes',
};


function parseXLSX(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const headers = jsonRows.length > 0 ? Object.keys(jsonRows[0]) : [];
  const rows = jsonRows.map(raw => {
    const row = {};
    Object.entries(raw).forEach(([col, val]) => {
      const normalized = String(col).trim().toLowerCase().replace(/_/g, ' ');
      const key = FIELD_MAP[normalized] || FIELD_MAP[String(col).trim().toLowerCase()];
      if (key) row[key] = String(val ?? '');
    });
    return row;
  }).filter(r => r.agent_name);
  return { rows, headers };
}

function parseCSVFull(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { rows: [], headers: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => {
      const normalized = h.toLowerCase().replace(/_/g, ' ');
      const key = FIELD_MAP[normalized] || FIELD_MAP[h.toLowerCase()];
      if (key) row[key] = vals[i] || '';
    });
    return row;
  }).filter(r => r.agent_name);
  return { rows, headers };
}

function cleanRow(row, batchName) {
  const out = { ...row, import_batch: batchName, status: row.status || 'pending' };
  const toInt = v => { const n = parseInt(String(v).replace(/[^0-9-]/g, '')); return isNaN(n) ? null : n; };
  const toFloat = v => { const n = parseFloat(String(v).replace(/[$,\s]/g, '')); return isNaN(n) ? null : n; };
  out.rank = out.rank ? toInt(out.rank) : null;
  out.sales_count_2025 = out.sales_count_2025 ? toInt(out.sales_count_2025) : null;
  out.sales_volume_2025 = out.sales_volume_2025 ? toFloat(out.sales_volume_2025) : null;
  out.avg_price_point = out.avg_price_point ? toFloat(out.avg_price_point) : null;
  if (!out.city_slug && out.city) out.city_slug = out.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return out;
}

export default function VettedPartnerCSVImport({ onDone }) {
  const [stage, setStage] = useState('idle'); // idle | preview | importing | done | error
  const [rows, setRows] = useState([]);
  const [rawHeaders, setRawHeaders] = useState([]);
  const [batchName, setBatchName] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const defaultBatch = file.name.replace(/\.(csv|xlsx|xls|numbers)$/i, '');
    setBatchName(defaultBatch);
    const isExcel = /\.(xlsx|xls|numbers)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      let result;
      if (isExcel) {
        result = parseXLSX(ev.target.result);
      } else {
        result = parseCSVFull(ev.target.result);
      }
      const { rows: parsed, headers } = result;
      setRawHeaders(headers || []);
      if (!parsed.length) { setErrorMsg('No valid rows found. Make sure your column headers match the expected names (see hint above).'); setStage('error'); return; }
      setRows(parsed);
      setStage('preview');
    };
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    setStage('importing');
    const clean = rows.map(r => cleanRow(r, batchName));
    // Bulk create in chunks of 50
    let created = 0, failed = 0;
    for (let i = 0; i < clean.length; i += 50) {
      const chunk = clean.slice(i, i + 50);
      const res = await appClient.entities.VettedPartner.bulkCreate(chunk);
      created += Array.isArray(res) ? res.length : chunk.length;
    }
    setResult({ created, total: clean.length });
    setStage('done');
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff8ee', border: `2px solid ${GOLD}` }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ background: '#0d0d0d' }}>
        <p className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>CSV BULK IMPORTER</p>
        <p className="text-white text-sm mt-0.5">Upload a spreadsheet to load 100 cities of agents at once.</p>
      </div>

      <div className="px-6 py-6">
        {/* Expected columns hint */}
        <div className="rounded-xl px-4 py-3 mb-5 text-xs leading-relaxed" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#6b5c45' }}>
          <strong style={{ color: GOLD }}>Expected Column Names (row 1 headers):</strong>{' '}
          Agent_Name · City · State · Rank · Brokerage · Market_Type · Sales_2025 · Volume_2025 · Avg_Price · Phone · Email
          <br />Also accepts: Rank, Brokerage_Category, Notes. Column names are flexible — we auto-map common variations.
          <br /><strong style={{ color: GOLD }}>Tip:</strong> Export from Numbers or Google Sheets as <strong>.xlsx</strong> — no conversion needed.
        </div>

        {stage === 'idle' && (
          <div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.numbers" className="hidden" onChange={handleFile} />
            <button onClick={() => fileRef.current.click()}
              className="w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 transition-all hover:opacity-80"
              style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.04)' }}>
              <Upload className="w-8 h-8" style={{ color: GOLD }} />
              <span className="font-bold text-sm" style={{ color: '#1a1a1a' }}>Click to select your spreadsheet</span>
              <span className="text-xs" style={{ color: '#9b8a70' }}>Supports .xlsx · .csv · Apple Numbers · Google Sheets</span>
            </button>
          </div>
        )}

        {stage === 'preview' && (
          <div>
            {/* Header mapping debug */}
            <div className="rounded-xl px-4 py-3 mb-4 text-xs" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="font-black mb-2" style={{ color: GOLD }}>Column Detection ({rawHeaders.length} headers found)</p>
              <div className="flex flex-wrap gap-1.5">
                {rawHeaders.map(h => {
                  const mapped = FIELD_MAP[h.toLowerCase().replace(/_/g, ' ')] || FIELD_MAP[h.toLowerCase()];
                  return (
                    <span key={h} className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: mapped ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: mapped ? '#059669' : '#dc2626', border: `1px solid ${mapped ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}` }}>
                      {h} {mapped ? `→ ${mapped}` : '✗ unmapped'}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: GOLD }} />
                <span className="font-bold text-sm" style={{ color: '#1a1a1a' }}>{rows.length} agents ready to import</span>
              </div>
              <input value={batchName} onChange={e => setBatchName(e.target.value)}
                placeholder="Batch name…"
                className="px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: '#ede0cc', border: `1px solid ${GOLD}`, color: '#1a1a1a' }} />
            </div>
            {/* Preview table */}
            <div className="overflow-x-auto rounded-xl mb-5" style={{ border: '1px solid rgba(212,175,55,0.2)', maxHeight: 260 }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'rgba(212,175,55,0.08)', position: 'sticky', top: 0 }}>
                  <tr>
                    {['Name', 'City', 'State', 'Rank', 'Brokerage', 'Market Type', 'Sales #', 'Volume', 'Avg Price', 'Phone', 'Email'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-black whitespace-nowrap" style={{ color: GOLD }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-t text-xs" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: '#1a1a1a' }}>{r.agent_name}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.city}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.state}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.rank}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.brokerage}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.market_type}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.sales_count_2025}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.sales_volume_2025}</td>
                      <td className="px-3 py-2" style={{ color: '#4a3a28' }}>{r.avg_price_point}</td>
                      <td className="px-3 py-2" style={{ color: '#059669' }}>{r.phone}</td>
                      <td className="px-3 py-2" style={{ color: '#6366f1' }}>{r.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 20 && (
                <p className="text-center text-xs py-2" style={{ color: '#9b8a70' }}>…and {rows.length - 20} more rows</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleImport}
                className="flex-1 py-3 rounded-full font-black text-sm tracking-wide transition-all hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
                Import {rows.length} Agents →
              </button>
              <button onClick={() => { setStage('idle'); setRows([]); }}
                className="px-6 py-3 rounded-full font-bold text-sm"
                style={{ background: 'rgba(0,0,0,0.08)', color: '#444' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {stage === 'importing' && (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
            <p className="font-bold" style={{ color: '#1a1a1a' }}>Importing agents…</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#10b981' }} />
            <p className="font-black text-lg mb-1" style={{ color: '#1a1a1a' }}>Import Complete</p>
            <p className="text-sm mb-5" style={{ color: '#6b5c45' }}>{result?.created} of {result?.total} agents added to the Master Roster.</p>
            <button onClick={onDone}
              className="px-8 py-2.5 rounded-full font-bold text-sm"
              style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})`, color: '#000' }}>
              View Roster →
            </button>
          </div>
        )}

        {stage === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#dc2626' }} />
            <p className="font-black text-base mb-1" style={{ color: '#1a1a1a' }}>Import Failed</p>
            <p className="text-sm mb-4" style={{ color: '#6b5c45' }}>{errorMsg}</p>
            <button onClick={() => setStage('idle')}
              className="px-6 py-2.5 rounded-full font-bold text-sm"
              style={{ background: 'rgba(0,0,0,0.08)', color: '#444' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}