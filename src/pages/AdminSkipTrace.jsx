import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, MapPin, Upload, CheckCircle2, AlertCircle, X, Users } from 'lucide-react';
import { appClient } from '@/api/appClient';
import * as XLSX from 'xlsx';

if (typeof window !== 'undefined') window.__XLSX__ = XLSX;

const GOLD = '#D4AF37';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
];

// ── Single Lookup (unchanged) ──────────────────────────────────────────────

function SingleLookup() {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [copied, setCopied] = useState(false);

  const fullAddress = [street, city, state].filter(Boolean).join(', ');

  const copyAddress = () => {
    if (!fullAddress) return;
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-6 mb-6" style={{ background: '#000', border: `1px solid rgba(212,175,55,0.25)` }}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: GOLD }}>STREET ADDRESS</label>
          <input value={street} onChange={e => setStreet(e.target.value)} placeholder="e.g. 123 Main St"
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: GOLD }}>CITY</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Los Angeles"
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: GOLD }}>STATE</label>
            <select value={state} onChange={e => setState(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', color: state ? '#fff' : 'rgba(255,255,255,0.4)', outline: 'none' }}>
              <option value="">Select State</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {fullAddress && (
          <>
            <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                <span className="text-sm font-semibold" style={{ color: '#fff' }}>{fullAddress}</span>
              </div>
              <button onClick={copyAddress} className="p-1 rounded hover:opacity-70 shrink-0 flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" style={{ color: GOLD }} />
                {copied && <span className="text-xs" style={{ color: GOLD }}>Copied!</span>}
              </button>
            </div>
            <a href="https://www.propstream.com" target="_blank" rel="noopener noreferrer"
              className="w-full py-3 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000', display: 'flex' }}>
              <ExternalLink className="w-4 h-4" />
              Open PropStream — Run Skip Trace
            </a>
            <p className="text-center text-xs" style={{ color: '#fff' }}>
              Copy the address above, then paste it into PropStream's Skip Trace tool.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Column detection helpers ───────────────────────────────────────────────

// PropStream skip trace exports use columns like:
// "First Name", "Last Name", "Cell Phone 1", "Cell Phone 2", "Phone 1", "Email 1"
// "Property Address", "Property City", "Property State", "Property Zip", "Estimated Value"
// We support all these plus generic fallbacks.

function findColExact(headers, candidates) {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function findColContains(headers, candidates) {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const c of candidates) {
    const idx = lower.findIndex(h => h.includes(c.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

function findCol(headers, candidates) {
  // Try exact match first, then contains
  const exact = findColExact(headers, candidates);
  if (exact !== -1) return exact;
  return findColContains(headers, candidates);
}

// Find the best phone number from a row — tries columns in priority order
function extractBestPhone(row, headers) {
  const lower = headers.map(h => h.toLowerCase().trim());
  // Priority: Cell Phone 1, Cell Phone 2, Phone 1, Mobile, Phone, then any column with "cell" or "phone"
  const priority = [
    'cell phone 1', 'cell phone1', 'cellphone1',
    'cell phone 2', 'cell phone2',
    'cell phone 3', 'cell phone3',
    'phone 1', 'phone1',
    'mobile phone 1', 'mobile 1', 'mobile1',
    'phone 2', 'phone2',
    'mobile', 'cell', 'phone',
    'owner phone', 'contact phone',
  ];
  for (const p of priority) {
    const idx = lower.indexOf(p);
    if (idx !== -1 && row[idx] && row[idx].trim()) return row[idx].trim();
  }
  // Fallback: any column containing "cell" or "phone"
  for (let i = 0; i < lower.length; i++) {
    if ((lower[i].includes('cell') || lower[i].includes('phone')) && row[i] && row[i].trim()) {
      return row[i].trim();
    }
  }
  return '';
}

// Combine First Name + Last Name if no single name column
function extractOwnerName(row, headers) {
  const lower = headers.map(h => h.toLowerCase().trim());
  // Try single name columns first
  const singleCol = findColExact(headers, [
    'owner name', 'seller name', 'taxpayer name', 'contact name', 'full name', 'name', 'owner', 'seller',
  ]);
  if (singleCol !== -1 && row[singleCol] && row[singleCol].trim()) return row[singleCol].trim();

  // PropStream skip trace export: "Owner 1 First Name" / "Owner 1 Last Name"
  const o1FirstIdx = lower.indexOf('owner 1 first name');
  const o1LastIdx  = lower.indexOf('owner 1 last name');
  if (o1FirstIdx !== -1 || o1LastIdx !== -1) {
    const first = o1FirstIdx !== -1 ? (row[o1FirstIdx] || '').trim() : '';
    const last  = o1LastIdx  !== -1 ? (row[o1LastIdx]  || '').trim() : '';
    const combined = [first, last].filter(Boolean).join(' ');
    if (combined) return combined;
  }

  // Generic first/last fallback
  const firstIdx = lower.indexOf('first name');
  const lastIdx  = lower.indexOf('last name');
  if (firstIdx !== -1 || lastIdx !== -1) {
    const first = firstIdx !== -1 ? (row[firstIdx] || '').trim() : '';
    const last  = lastIdx  !== -1 ? (row[lastIdx]  || '').trim() : '';
    const combined = [first, last].filter(Boolean).join(' ');
    if (combined) return combined;
  }

  return '';
}

const STREET_CANDIDATES = ['property address', 'property street', 'street address', 'address', 'prop address', 'site address', 'mailing address', 'street'];
const CITY_CANDIDATES   = ['property city', 'city', 'prop city', 'site city', 'mailing city'];
const STATE_CANDIDATES  = ['property state', 'state', 'prop state', 'site state', 'mailing state'];
const ZIP_CANDIDATES    = ['property zip', 'zip code', 'zip', 'postal code', 'prop zip', 'site zip', 'mailing zip'];
const PRICE_CANDIDATES  = ['list price', 'listing price', 'estimated value', 'price', 'asking price', 'sale price', 'value'];
const EMAIL_CANDIDATES  = ['email 1', 'email1', 'email address', 'email', 'owner email', 'contact email'];

function parseFileToRows(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject('Could not read file: ' + file.name);
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (jsonRows.length < 2) { resolve([]); return; }
        const headers = jsonRows[0].map(h => String(h).trim());
        const csvRows = jsonRows.slice(1).map(r => headers.map((_, i) => String(r[i] || '').trim()));

        const streetIdx     = findCol(headers, STREET_CANDIDATES);
        const cityIdx       = findCol(headers, CITY_CANDIDATES);
        const stateIdx      = findCol(headers, STATE_CANDIDATES);
        const zipIdx        = findCol(headers, ZIP_CANDIDATES);
        const priceIdx      = findCol(headers, PRICE_CANDIDATES);
        const emailIdx      = findCol(headers, EMAIL_CANDIDATES);

        if (streetIdx < 0) {
          console.warn('Headers found:', headers);
          reject('Could not find address column in: ' + file.name + '\nHeaders: ' + headers.slice(0, 10).join(', '));
          return;
        }

        const parsed = csvRows
          .map(row => ({
            owner_name:    extractOwnerName(row, headers),
            phone:         extractBestPhone(row, headers),
            email:         emailIdx >= 0 ? row[emailIdx] : '',
            street:        row[streetIdx] || '',
            city:          cityIdx  >= 0 ? row[cityIdx]  : '',
            state:         stateIdx >= 0 ? row[stateIdx] : '',
            zip:           zipIdx   >= 0 ? row[zipIdx]   : '',
            listing_price: priceIdx >= 0 ? row[priceIdx] : '',
          }))
          .filter(r => r.street.trim());
        resolve(parsed);
      } catch (err) { reject('Could not parse: ' + file.name + ' — ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ── Bulk Builder ───────────────────────────────────────────────────────────

function BulkBuilder() {
  const [rows, setRows] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [patching, setPatching] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setImportError('');
    setImportResult(null);
    setParsing(true);
    try {
      const allParsed = await Promise.all(Array.from(files).map(parseFileToRows));
      const merged = allParsed.flat();
      setRows(prev => {
        const combined = [...prev, ...merged];
        const seen = new Set();
        return combined.filter(r => {
          const key = r.street.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key); return true;
        });
      });
      setFileNames(prev => [...prev, ...Array.from(files).map(f => f.name)]);
    } catch (err) {
      setImportError(typeof err === 'string' ? err : (err?.message || 'Import failed — check file format'));
    } finally {
      setParsing(false);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  const reset = () => { setRows([]); setFileNames([]); setImportError(''); setImportResult(null); if (fileRef.current) fileRef.current.value = ''; };

  const importToListingOwners = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const records = rows.map(r => ({
        owner_name: r.owner_name || 'Unknown',
        phone: r.phone || '',
        email: r.email || '',
        property_address: [r.street, r.city, r.state].filter(Boolean).join(', '),
        property_city: r.city || '',
        property_state: r.state || '',
        listing_price: r.listing_price ? parseFloat(String(r.listing_price).replace(/[^0-9.]/g, '')) || undefined : undefined,
        contact_status: 'not_contacted',
      }));

      // Batch in chunks of 25 to avoid timeouts
      const CHUNK = 25;
      let totalCreated = 0;
      for (let i = 0; i < records.length; i += CHUNK) {
        const chunk = records.slice(i, i + CHUNK);
        const created = await appClient.entities.ListingOwner.bulkCreate(chunk);
        totalCreated += created.length;
      }
      setImportResult({ count: totalCreated });
    } catch (err) {
      setImportError('Import failed: ' + (err.message || err));
    } finally {
      setImporting(false);
    }
  };

  // Patch existing ListingOwner records that are missing name/phone — match by address
  const patchExistingOwners = async () => {
    setPatching(true);
    setImportResult(null);
    try {
      const existing = await appClient.entities.ListingOwner.list('-created_date', 500);
      let patched = 0;
      for (const row of rows) {
        if (!row.phone && !row.owner_name) continue;
        const streetLower = row.street.toLowerCase().trim();
        const match = existing.find(o => {
          const addr = (o.property_address || '').toLowerCase();
          return addr.includes(streetLower) || streetLower.includes(addr.split(',')[0]?.trim());
        });
        if (match) {
          const updates = {};
          if (row.phone && !match.phone) updates.phone = row.phone;
          if (row.owner_name && (!match.owner_name || match.owner_name === 'Unknown')) updates.owner_name = row.owner_name;
          if (row.email && !match.email) updates.email = row.email;
          if (Object.keys(updates).length > 0) {
            await appClient.entities.ListingOwner.update(match.id, updates);
            patched++;
          }
        }
      }
      setImportResult({ patched, count: 0 });
    } catch (err) {
      setImportError('Patch failed: ' + (err.message || err));
    } finally {
      setPatching(false);
    }
  };

  const phoneCount = rows.filter(r => r.phone).length;

  return (
    <>
      {/* Step 1 */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#000', border: `1px solid rgba(212,175,55,0.25)` }}>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>STEP 1 — RUN SKIP TRACE IN PROPSTREAM</p>
        <p className="text-xs mb-4" style={{ color: '#fff' }}>
          In PropStream, open your saved list → select all records → click <strong style={{ color: '#fff' }}>Skip Trace</strong> → then <strong style={{ color: '#fff' }}>Export CSV</strong>. The export will include owner names + cell numbers.
        </p>
        <a href="https://www.propstream.com" target="_blank" rel="noopener noreferrer"
          className="w-full py-3 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}>
          <ExternalLink className="w-4 h-4" />
          Open PropStream & Run Skip Trace
        </a>
      </div>

      {/* Step 2 */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#000', border: `1px solid rgba(212,175,55,0.25)` }}>
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: GOLD }}>STEP 2 — UPLOAD YOUR SKIP-TRACED CSV EXPORTS</p>
        <p className="text-xs mb-4" style={{ color: '#fff' }}>
          Upload your PropStream skip trace export. Owner names + phone numbers are read automatically.
        </p>

        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => !parsing && fileRef.current?.click()}
          className="rounded-xl flex flex-col items-center justify-center py-10 transition-all"
          style={{ border: '2px dashed rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.04)', cursor: parsing ? 'wait' : 'pointer' }}>
          {parsing ? (
            <>
              <div className="w-10 h-10 border-2 rounded-full animate-spin mb-3" style={{ borderColor: 'rgba(212,175,55,0.3)', borderTopColor: GOLD }} />
              <p className="font-bold mb-1" style={{ color: '#fff' }}>Reading file…</p>
              <p className="text-xs" style={{ color: '#fff' }}>Detecting columns and parsing rows</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-3" style={{ color: GOLD }} />
              <p className="font-bold mb-1" style={{ color: '#fff' }}>Drop your PropStream CSV here</p>
              <p className="text-xs" style={{ color: '#fff' }}>or click to browse · .csv, .xlsx, .xls</p>
            </>
          )}
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>

        {fileNames.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {fileNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#22C55E' }} />
                <span className="text-xs font-medium" style={{ color: '#fff' }}>{name}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-bold" style={{ color: GOLD }}>{rows.length} records</span>
                <span className="text-xs ml-2" style={{ color: phoneCount > 0 ? '#22C55E' : 'rgba(255,255,255,0.35)' }}>
                  · {phoneCount} with cell numbers

                </span>
                {phoneCount === 0 && (
                  <span className="block text-xs mt-1" style={{ color: '#EF4444' }}>
                    ⚠ No phones found — check detected columns below
                  </span>
                )}
              </div>
              <button onClick={reset} className="text-xs hover:opacity-70 flex items-center gap-1" style={{ color: '#fff' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
            {/* Preview first 3 rows */}
            {rows.length > 0 && (
              <div className="mt-2 rounded-lg overflow-hidden text-xs" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="px-3 py-1.5 font-bold tracking-widest" style={{ color: GOLD, background: 'rgba(255,255,255,0.04)' }}>
                  PREVIEW (first 3 rows)
                </div>
                {rows.slice(0, 3).map((r, i) => (
                  <div key={i} className="px-3 py-2 flex gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#fff' }}>
                    <span className="truncate w-36">{r.owner_name || <em style={{color:'#EF4444'}}>no name</em>}</span>
                    <span className="truncate w-32" style={{ color: r.phone ? '#22C55E' : '#EF4444' }}>{r.phone || 'no phone'}</span>
                    <span className="truncate flex-1">{r.street}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {importError && (
          <div className="flex items-center gap-2 mt-3">
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#EF4444' }} />
            <span className="text-xs" style={{ color: '#EF4444' }}>{importError}</span>
          </div>
        )}
      </div>

      {/* Step 3 — Import or Patch (always visible once CSV loaded) */}
      {rows.length > 0 && !importResult && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: '#000', border: `1px solid ${GOLD}` }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>STEP 3 — WHAT WOULD YOU LIKE TO DO?</p>

          {/* Import as New — PRIMARY action */}
          <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.35)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>✦ New addresses? Import them as fresh records.</p>
            <p className="text-xs mb-3" style={{ color: '#fff' }}>
              Adds all {rows.length} owners as new Listing Owner records, ready for SMS outreach.
            </p>
            <button onClick={importToListingOwners} disabled={importing || patching}
              className="w-full py-3 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}>
              {importing
                ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Importing {rows.length} records...</>
                : <><Users className="w-4 h-4" /> Import {rows.length} Owners to Database</>
              }
            </button>
          </div>

          {/* Patch existing — secondary */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#fff' }}>Already imported these addresses? Fill in missing names + phones instead.</p>
            <button onClick={patchExistingOwners} disabled={importing || patching}
              className="w-full py-2.5 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 mt-2"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
              {patching
                ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Patching...</>
                : <>✦ Patch Existing Records ({rows.length} from CSV)</>
              }
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div className="rounded-2xl p-5 mb-4 flex items-start gap-3"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
          <div>
            {importResult.count > 0 && (
              <p className="font-bold text-sm mb-1" style={{ color: '#22C55E' }}>✓ {importResult.count} owners imported!</p>
            )}
            {importResult.patched !== undefined && (
              <p className="font-bold text-sm mb-1" style={{ color: '#22C55E' }}>✓ {importResult.patched} existing records patched with names + phones!</p>
            )}
            <p className="text-xs" style={{ color: '#fff' }}>
              Go to <strong>Admin → Listing Owners</strong> to review and start outreach.
            </p>
            <button onClick={reset} className="mt-3 text-xs font-semibold hover:opacity-80 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              Upload Another CSV
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminSkipTrace() {
  const [mode, setMode] = useState('bulk');

  const steps = mode === 'single'
    ? [
        'Enter the property address above',
        'Click "Open PropStream" and log in',
        'Paste the address into PropStream\'s Skip Trace tool',
        'Export the result and note the owner name + cell number',
        'Add them manually to the Listing Owners database',
      ]
    : [
        'Log into PropStream and open your saved property list',
        'Select all records → click Skip Trace → PropStream finds cell numbers',
        'Export the skip-traced results as a CSV file',
        'Return here and upload the CSV',
        'Click "Import Owners to Database" — done, ready for SMS outreach',
      ];

  return (
    <div className="min-h-screen p-6" style={{ background: '#808080' }}>
      <div className="max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-xs font-bold tracking-[0.3em] mb-1" style={{ color: GOLD }}>ADMIN TOOL</p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#fff' }}>Skip Trace — PropStream</h1>
          <p className="text-sm" style={{ color: '#fff' }}>
            Run skip trace in PropStream to get owner cell numbers, then import directly into your outreach database.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex rounded-xl p-1 mb-6 w-fit"
          style={{ background: '#000', border: '1px solid rgba(212,175,55,0.2)' }}>
          {[{ id: 'bulk', label: 'Import CSV' }, { id: 'single', label: 'Single Address' }].map(opt => (
            <button key={opt.id} onClick={() => setMode(opt.id)}
              className="px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all"
              style={{
                background: mode === opt.id ? 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)' : 'transparent',
                color: mode === opt.id ? '#000' : '#fff',
              }}>
              {opt.label}
            </button>
          ))}
        </motion.div>

        <motion.div key={mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {mode === 'single' ? <SingleLookup /> : <BulkBuilder />}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mt-4"
          style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs font-bold tracking-widest mb-4" style={{ color: GOLD }}>
            HOW IT WORKS — {mode === 'single' ? 'SINGLE LOOKUP' : 'BULK IMPORT'}
          </p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 mb-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>
                {i + 1}
              </div>
              <p className="text-sm" style={{ color: '#fff' }}>{step}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}