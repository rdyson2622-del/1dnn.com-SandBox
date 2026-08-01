import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';
import { Upload, AlertCircle, CheckCircle2, Eye, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN DETECTION — handles PropStream MLS export, PropStream SkipTrace export,
// BatchData, and generic MLS/CSV formats
// ─────────────────────────────────────────────────────────────────────────────

function normalize(s) { return String(s || '').toLowerCase().trim(); }

function findCol(headers, candidates) {
  const norm = headers.map(normalize);
  // 1. Exact match
  for (const c of candidates) {
    const i = norm.indexOf(normalize(c));
    if (i !== -1) return i;
  }
  // 2. Contains match
  for (const c of candidates) {
    const i = norm.findIndex(h => h.includes(normalize(c)));
    if (i !== -1) return i;
  }
  return -1;
}

// ── NAME extraction ───────────────────────────────────────────────────────────
function extractOwnerName(row, headers) {
  const norm = headers.map(normalize);

  // PropStream SkipTrace: "Owner 1 First Name" + "Owner 1 Last Name"
  const skipFirst = norm.indexOf('owner 1 first name');
  const skipLast  = norm.indexOf('owner 1 last name');
  if (skipFirst !== -1 || skipLast !== -1) {
    const f = skipFirst !== -1 ? row[skipFirst] : '';
    const l = skipLast  !== -1 ? row[skipLast]  : '';
    const combined = [f, l].filter(Boolean).join(' ').trim();
    if (combined) return combined;
  }

  // PropStream MLS: single "Owner Name" or "Seller Name"
  const singleCandidates = [
    'owner name', 'seller name', 'taxpayer name', 'contact name',
    'full name', 'name', 'owner', 'seller', 'client name',
  ];
  const singleIdx = findCol(headers, singleCandidates);
  if (singleIdx !== -1 && row[singleIdx]?.trim()) return row[singleIdx].trim();

  // Generic first + last
  const firstIdx = findCol(headers, ['first name', 'firstname', 'first']);
  const lastIdx  = findCol(headers, ['last name', 'lastname', 'last']);
  if (firstIdx !== -1 || lastIdx !== -1) {
    const f = firstIdx !== -1 ? row[firstIdx] : '';
    const l = lastIdx  !== -1 ? row[lastIdx]  : '';
    const combined = [f, l].filter(Boolean).join(' ').trim();
    if (combined) return combined;
  }

  return '';
}

// ── PHONE extraction — tries all phone columns in priority order ──────────────
function cleanPhone(raw) {
  if (!raw) return '';
  // Remove all non-digits
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  // Strip leading country code 1
  const stripped = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
  if (stripped.length !== 10) return String(raw).trim(); // keep original if not 10 digits
  // Format as (XXX) XXX-XXXX
  return `(${stripped.slice(0,3)}) ${stripped.slice(3,6)}-${stripped.slice(6)}`;
}

function extractBestPhone(row, headers) {
  const norm = headers.map(normalize);

  // PropStream SkipTrace priority — cell phones first
  const skipTracePriority = [
    'cell phone 1', 'cell phone1', 'cellphone1', 'cell1',
    'cell phone 2', 'cell phone2', 'cellphone2', 'cell2',
    'cell phone 3', 'cell phone3', 'cellphone3', 'cell3',
    'phone 1', 'phone1',
    'phone 2', 'phone2',
    'phone 3', 'phone3',
    'mobile phone 1', 'mobile1', 'mobile 1',
    'mobile phone 2', 'mobile2', 'mobile 2',
    'owner phone', 'contact phone',
    'mobile', 'cell', 'phone',
  ];

  for (const p of skipTracePriority) {
    const idx = norm.indexOf(p);
    if (idx !== -1 && row[idx]?.trim()) {
      const cleaned = cleanPhone(row[idx]);
      if (cleaned) return cleaned;
    }
  }

  // Fallback: any column containing "cell" or "phone"
  for (let i = 0; i < norm.length; i++) {
    if ((norm[i].includes('cell') || norm[i].includes('phone')) && row[i]?.trim()) {
      const cleaned = cleanPhone(row[i]);
      if (cleaned) return cleaned;
    }
  }

  return '';
}

// ── ADDRESS extraction ────────────────────────────────────────────────────────
// PropStream MLS uses "Property Address", SkipTrace uses "Property Street Address"
const STREET_CANDIDATES = [
  'property street address', 'property address', 'site address', 'street address',
  'prop address', 'mailing address', 'address', 'street', 'situs address',
];
const CITY_CANDIDATES = [
  'property city', 'site city', 'prop city', 'mailing city', 'city',
];
const STATE_CANDIDATES = [
  'property state', 'site state', 'prop state', 'mailing state', 'state',
];
const ZIP_CANDIDATES = [
  'property zip', 'property zip code', 'site zip', 'zip code', 'zip', 'postal code',
];
const PRICE_CANDIDATES = [
  'list price', 'listing price', 'estimated value', 'est value', 'est. value',
  'asking price', 'price', 'mls amount', 'sale price', 'assessed value',
];
const EMAIL_CANDIDATES = [
  'email 1', 'email1', 'email address', 'owner email', 'contact email', 'email',
];

// ─────────────────────────────────────────────────────────────────────────────
// PARSE — handles XLSX, XLS, and CSV
// ─────────────────────────────────────────────────────────────────────────────
function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject('Could not read file: ' + file.name);
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array', raw: false });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (jsonRows.length < 2) { resolve({ rows: [], headers: [] }); return; }

        // Find the actual header row — skip blank leading rows
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(5, jsonRows.length); i++) {
          const row = jsonRows[i];
          const nonEmpty = row.filter(c => String(c).trim()).length;
          if (nonEmpty >= 3) { headerRowIdx = i; break; }
        }

        const rawHeaders = jsonRows[headerRowIdx].map(h => String(h).trim());
        const dataRows = jsonRows.slice(headerRowIdx + 1)
          .map(r => rawHeaders.map((_, i) => String(r[i] || '').trim()))
          .filter(r => r.some(c => c)); // skip entirely blank rows

        // Detect file type for diagnostic
        const normHeaders = rawHeaders.map(normalize);
        const isSkipTrace = normHeaders.some(h => h.includes('owner 1 first') || h.includes('cell phone 1'));
        const isMLS = normHeaders.some(h => h.includes('list price') || h.includes('mls'));

        const streetIdx = findCol(rawHeaders, STREET_CANDIDATES);
        if (streetIdx < 0) {
          reject(
            `❌ Could not find a property address column.\n\n` +
            `Detected ${rawHeaders.length} columns:\n${rawHeaders.slice(0, 20).join(' | ')}\n\n` +
            `💡 Expected columns like: "Property Address", "Property Street Address", or "Address"\n` +
            `Make sure row 1 is the header row and the file is not filtered/grouped.`
          );
          return;
        }

        const cityIdx  = findCol(rawHeaders, CITY_CANDIDATES);
        const stateIdx = findCol(rawHeaders, STATE_CANDIDATES);
        const zipIdx   = findCol(rawHeaders, ZIP_CANDIDATES);
        const priceIdx = findCol(rawHeaders, PRICE_CANDIDATES);
        const emailIdx = findCol(rawHeaders, EMAIL_CANDIDATES);

        const rows = dataRows.map(row => ({
          owner_name:    extractOwnerName(row, rawHeaders),
          phone:         extractBestPhone(row, rawHeaders),
          email:         emailIdx  >= 0 ? row[emailIdx]  : '',
          street:        streetIdx >= 0 ? row[streetIdx] : '',
          city:          cityIdx   >= 0 ? row[cityIdx]   : '',
          state:         stateIdx  >= 0 ? row[stateIdx]  : '',
          zip:           zipIdx    >= 0 ? row[zipIdx]    : '',
          listing_price: priceIdx  >= 0 ? row[priceIdx]  : '',
        })).filter(r => r.street.trim());

        resolve({ rows, headers: rawHeaders, fileType: isSkipTrace ? 'PropStream SkipTrace' : isMLS ? 'PropStream MLS' : 'Generic CSV' });
      } catch (err) {
        reject('Could not parse file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function OwnerImportCSV({ open, onClose, onImportComplete }) {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null); // { rows, headers, fileType }
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef();

  const reset = () => {
    setError(null); setResult(null); setPreview(null); setBatchName(''); setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const processFile = async (file) => {
    if (!file) return;
    // Pre-fill batch name from filename (strip extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setFileName(file.name);
    setBatchName(nameWithoutExt);
    setLoading(true);
    setError(null);
    setResult(null);
    setPreview(null);
    try {
      const parsed = await parseFile(file);
      if (!parsed.rows.length) throw new Error('No rows with a property address found.');
      setPreview(parsed);
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (!preview?.rows) return;
    setImporting(true);

    try {
      const batch = batchName.trim() || fileName || 'Unnamed Import';
      const toInsert = preview.rows.map(r => ({
        owner_name:       r.owner_name || 'Unknown',
        phone:            r.phone || '',
        email:            r.email || '',
        property_address: [r.street, r.city, r.state].filter(Boolean).join(', '),
        property_city:    r.city || '',
        property_state:   r.state || '',
        listing_price:    r.listing_price ? parseFloat(String(r.listing_price).replace(/[^0-9.]/g, '')) || undefined : undefined,
        contact_status:   'not_contacted',
        import_batch:     batch,
      }));

      const CHUNK = 25;
      let totalCreated = 0;
      for (let i = 0; i < toInsert.length; i += CHUNK) {
        const created = await appClient.entities.ListingOwner.bulkCreate(toInsert.slice(i, i + CHUNK));
        totalCreated += created.length;
      }

      setResult({ count: totalCreated });
      setPreview(null);
      onImportComplete?.();
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const withPhone = preview?.rows.filter(r => r.phone).length ?? 0;
  const withName  = preview?.rows.filter(r => r.owner_name).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { reset(); onClose?.(); } }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Listing Owners</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Step 1: Upload */}
          {!preview && !result && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                <p className="font-bold text-sm">✅ Supports both PropStream formats automatically:</p>
                <p>• <strong>MLS Export</strong> — columns like "Property Address", "List Price", "Owner Name"</p>
                <p>• <strong>SkipTrace Export</strong> — columns like "Property Street Address", "Owner 1 First Name", "Cell Phone 1"</p>
                <p className="text-blue-600 mt-1">Phones are auto-formatted to (XXX) XXX-XXXX for Twilio compatibility.</p>
              </div>

              <label
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition"
                style={{
                  borderColor: dragging ? '#3b82f6' : '#cbd5e1',
                  background: dragging ? '#eff6ff' : 'transparent',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin mb-2" />
                    <span className="text-sm font-medium text-slate-600">Reading file…</span>
                  </>
                ) : dragging ? (
                  <>
                    <Upload className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm font-semibold text-blue-600">Drop it here!</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-semibold text-slate-700">Drag & drop your CSV / Excel file here</span>
                    <span className="text-xs text-slate-400 mt-1">or click to browse — .csv, .xlsx, .xls</span>
                    <span className="text-xs text-slate-400">PropStream MLS or SkipTrace export</span>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} disabled={loading} className="hidden" />
              </label>

              {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 mb-1">Could not parse file</p>
                    <p className="text-sm text-red-800 whitespace-pre-wrap font-mono text-xs">{error}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2: Preview */}
          {preview && !result && (
            <>
              {/* Batch Name */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 space-y-1.5">
                <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wide">
                  📂 Batch / Spreadsheet Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  placeholder="e.g. San Francisco - April 22 SkipTrace"
                  className="w-full rounded-lg border border-yellow-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <p className="text-xs text-yellow-700">This name tags every contact in this import so you can target them separately and avoid duplicate sends.</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'File Type', value: preview.fileType, color: 'text-blue-700 bg-blue-50' },
                  { label: 'Total Rows', value: preview.rows.length, color: 'text-slate-700 bg-slate-50' },
                  { label: 'With Phone', value: `${withPhone} (${Math.round(withPhone/preview.rows.length*100)}%)`, color: withPhone > 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50' },
                  { label: 'With Name', value: withName, color: 'text-slate-700 bg-slate-50' },
                ].map(s => (
                  <div key={s.label} className={`rounded-lg p-2 text-center ${s.color}`}>
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="font-bold text-sm mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>

              {withPhone === 0 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ <strong>No phone numbers found.</strong> This looks like a PropStream MLS export — you need to run SkipTrace first to get phone numbers, then re-import that file.
                </div>
              )}

              {/* Preview table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Preview (first 8 rows)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left px-3 py-2 text-slate-500 font-medium">Owner Name</th>
                        <th className="text-left px-3 py-2 text-slate-500 font-medium">Phone</th>
                        <th className="text-left px-3 py-2 text-slate-500 font-medium">Address</th>
                        <th className="text-left px-3 py-2 text-slate-500 font-medium">City</th>
                        <th className="text-left px-3 py-2 text-slate-500 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 8).map((r, i) => (
                        <tr key={i} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                          <td className="px-3 py-2 font-medium text-slate-800">{r.owner_name || <span className="text-red-400">missing</span>}</td>
                          <td className="px-3 py-2 text-slate-600">{r.phone || <span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-2 text-slate-600 max-w-[160px] truncate">{r.street}</td>
                          <td className="px-3 py-2 text-slate-500">{r.city}</td>
                          <td className="px-3 py-2 text-slate-500">{r.listing_price ? `$${Number(String(r.listing_price).replace(/[^0-9.]/g,'')).toLocaleString()}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Showing {Math.min(8, preview.rows.length)} of {preview.rows.length} rows
              </p>
            </>
          )}

          {/* Success */}
          {result && (
            <div className="flex gap-3 p-5 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900 text-lg">{result.count} owners imported! 🎉</p>
                <p className="text-sm text-green-700 mt-1">All records are now in your Listing Owners database, ready to send SMS.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { reset(); onClose?.(); }}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {error && <Button variant="outline" onClick={reset}>Try Different File</Button>}
          {preview && !result && (
            <>
              <Button variant="outline" onClick={reset}>
                ← Different File
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing}
                className="bg-slate-900 hover:bg-slate-700 text-white gap-2"
              >
                {importing
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing...</>
                  : <><ChevronRight className="w-3.5 h-3.5" /> Import {preview.rows.length} Owners</>
                }
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}