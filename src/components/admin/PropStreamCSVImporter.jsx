import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, CheckCircle2, AlertCircle, X, FileText, DatabaseZap } from 'lucide-react';
import * as XLSX from 'xlsx';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

// Common PropStream column name variations
const COLUMN_MAP = {
  street: ['property address', 'property street', 'street address', 'address', 'prop address', 'site address', 'street'],
  city: ['property city', 'city', 'prop city', 'site city'],
  state: ['property state', 'state', 'prop state', 'site state', 'st'],
  zip: ['property zip', 'zip', 'zip code', 'postal code', 'prop zip', 'site zip'],
  owner: ['owner name', 'owner 1 first name', 'owner name 1', 'first name', 'owner', 'seller name'],
  phone: ['phone', 'phone number', 'mobile', 'cell', 'owner phone', 'contact phone'],
  email: ['email', 'email address', 'owner email', 'contact email'],
  price: ['list price', 'listing price', 'price', 'est. value', 'estimated value', 'value'],
};

function findColumn(headers, candidates) {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = lower.findIndex(h => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

// Parse a combined address string like "123 Main St, Santa Monica, CA 90402"
function splitCombinedAddress(addr) {
  if (!addr) return { street: '', city: '', state: '', zip: '' };
  // Try: "Street, City, ST ZIP" or "Street, City, ST, ZIP"
  const parts = addr.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    const street = parts[0];
    const city = parts[1];
    // Last part might be "CA 90402" or just "CA"
    const lastPart = parts[parts.length - 1].trim();
    const stateZipMatch = lastPart.match(/^([A-Z]{2})\s*(\d{5})?$/);
    if (stateZipMatch) {
      return { street, city, state: stateZipMatch[1], zip: stateZipMatch[2] || '' };
    }
    // Or state and zip are separate parts
    if (parts.length >= 4) {
      const state = parts[2].trim();
      const zip = parts[3].trim();
      return { street, city, state, zip };
    }
    return { street, city, state: lastPart, zip: '' };
  }
  // Fallback: just use whole thing as street
  return { street: addr, city: '', state: '', zip: '' };
}

function parseFileToRows(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (jsonRows.length < 1) { callback(null, 'Empty file'); return; }

      const headers = jsonRows[0].map(h => String(h).trim());
      const dataRows = jsonRows.slice(1).map(r => r.map(v => String(v).trim()));

      callback({ headers, rows: dataRows });
    } catch (err) {
      callback(null, 'Could not parse file: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

export default function PropStreamCSVImporter() {
  const [open, setOpen] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState(null);
  const [isCombined, setIsCombined] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setParseError('');

    parseFileToRows(file, (result, err) => {
      if (err) { setParseError(err); return; }
      const { headers, rows } = result;

      // Try to detect columns
      const detected = {};
      for (const [field, candidates] of Object.entries(COLUMN_MAP)) {
        detected[field] = findColumn(headers, candidates);
      }

      // Check if we only have a combined "Address" column (street not found but address col is there)
      const streetIdx = detected.street;
      const hasSeparateCols = streetIdx >= 0 && detected.city >= 0 && detected.state >= 0;

      if (!hasSeparateCols && streetIdx >= 0) {
        // Single address column — we'll split it
        setIsCombined(true);
      } else if (!hasSeparateCols) {
        setParseError('Could not find address columns. Make sure this is a PropStream export with an "Address" or "Property Address" column.');
        return;
      } else {
        setIsCombined(false);
      }

      setParsed({ headers, rows });
      setMapping(detected);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  // Build normalized address rows for preview & download
  const normalizedRows = React.useMemo(() => {
    if (!parsed || !mapping) return [];
    return parsed.rows
      .filter(row => row.some(v => v.trim()))
      .map(row => {
        if (isCombined) {
          const rawAddr = mapping.street >= 0 ? row[mapping.street] : '';
          const parts = splitCombinedAddress(rawAddr);
          return { ...parts, owner: mapping.owner >= 0 ? row[mapping.owner] : '' };
        }
        return {
          street: mapping.street >= 0 ? row[mapping.street] : '',
          city: mapping.city >= 0 ? row[mapping.city] : '',
          state: mapping.state >= 0 ? row[mapping.state] : '',
          zip: mapping.zip >= 0 ? row[mapping.zip] : '',
          owner: mapping.owner >= 0 ? row[mapping.owner] : '',
          phone: mapping.phone >= 0 ? row[mapping.phone] : '',
          email: mapping.email >= 0 ? row[mapping.email] : '',
          price: mapping.price >= 0 ? row[mapping.price] : '',
        };
      })
      .filter(r => r.street.trim());
  }, [parsed, mapping, isCombined]);

  const validRows = normalizedRows.filter(r => r.street && r.city && r.state);

  const downloadBatchDataCSV = () => {
    if (!normalizedRows.length) return;
    const headers = ['First Name', 'Last Name', 'Property Address', 'Property City', 'Property State', 'Property Zip'];
    const dataRows = normalizedRows.map(r => {
      const parts = (r.owner || '').split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      return [firstName, lastName, r.street, r.city, r.state, r.zip]
        .map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propstream-outreach-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importToListingOwners = async () => {
    setImporting(true);
    setImportResult(null);
    let success = 0, skipped = 0;
    for (const row of normalizedRows) {
      if (!row.owner && !row.street) { skipped++; continue; }
      const priceNum = row.price ? parseFloat(String(row.price).replace(/[^0-9.]/g, '')) : undefined;
      await appClient.entities.ListingOwner.create({
        owner_name: row.owner || 'Unknown Owner',
        property_address: [row.street, row.zip].filter(Boolean).join(' '),
        property_city: row.city,
        property_state: row.state,
        phone: row.phone || undefined,
        email: row.email || undefined,
        listing_price: priceNum || undefined,
        contact_status: 'not_contacted',
      });
      success++;
    }
    setImporting(false);
    setImportResult({ success, skipped });
  };

  const reset = () => {
    setParsed(null);
    setMapping(null);
    setFileName('');
    setParseError('');
    setIsCombined(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all"
        style={{ background: '#000', border: `1px solid rgba(212,175,55,0.3)` }}
      >
        <div className="flex items-center gap-3">
          <Upload className="w-5 h-5" style={{ color: GOLD }} />
          <div className="text-left">
            <p className="font-bold text-sm" style={{ color: '#fff' }}>Import PropStream Export</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Upload your PropStream CSV or Excel → preview & download a clean outreach-ready CSV
            </p>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl p-6 mt-2" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>

              {/* Instructions */}
              <div className="mb-5 rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>HOW IT WORKS</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { step: '1', text: 'In PropStream → My Properties → select your list → Export CSV or Excel (contact info is already included)' },
                    { step: '2', text: 'Upload that file here — we auto-detect all columns including owner name, phone, email, and address' },
                    { step: '3', text: 'Preview your data and download a clean, standardized CSV ready for outreach — no BatchData needed' },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>{s.step}</div>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Drop Zone */}
              {!parsed ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer transition-all hover:opacity-80"
                  style={{ border: '2px dashed rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.04)' }}
                >
                  <FileText className="w-10 h-10 mb-3" style={{ color: GOLD }} />
                  <p className="font-bold mb-1" style={{ color: '#fff' }}>Drop PropStream CSV or Excel here</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>or click to browse — .csv, .xlsx, .xls supported</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div>
                  {/* File loaded summary */}
                  <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
                      <span className="text-sm font-semibold" style={{ color: '#fff' }}>{fileName}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        — {parsed.rows.length} rows, {normalizedRows.length} valid addresses found
                      </span>
                      {isCombined && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(212,175,55,0.2)', color: GOLD }}>
                          Combined address column — auto-split ✓
                        </span>
                      )}
                    </div>
                    <button onClick={reset} className="p-1 hover:opacity-70">
                      <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </button>
                  </div>

                  {/* Column mapping preview */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>DETECTED COLUMNS</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(COLUMN_MAP).map(([field]) => {
                        const colIdx = mapping[field];
                        const colName = colIdx >= 0 ? parsed.headers[colIdx] : null;
                        const isAutoSplit = isCombined && (field === 'city' || field === 'state' || field === 'zip');
                        return (
                          <div key={field} className="flex items-center gap-2">
                            {colName || isAutoSplit ? (
                              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: '#22C55E' }} />
                            ) : (
                              <AlertCircle className="w-3 h-3 shrink-0" style={{ color: '#F59E0B' }} />
                            )}
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{field}:</span>
                            <span className="text-xs font-semibold" style={{ color: (colName || isAutoSplit) ? '#fff' : '#F59E0B' }}>
                              {isAutoSplit ? 'auto-split' : (colName || 'not found')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview table */}
                  {normalizedRows.length > 0 && (
                    <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="px-4 py-2 text-xs font-bold tracking-widest" style={{ background: 'rgba(212,175,55,0.08)', color: GOLD }}>
                        PREVIEW (first 5 rows)
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              {['Street', 'City', 'State', 'Zip', 'Owner'].map(h => (
                                <th key={h} className="text-left px-3 py-2 font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {normalizedRows.slice(0, 5).map((row, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td className="px-3 py-2" style={{ color: '#fff' }}>{row.street || '—'}</td>
                                <td className="px-3 py-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{row.city || '—'}</td>
                                <td className="px-3 py-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{row.state || '—'}</td>
                                <td className="px-3 py-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{row.zip || '—'}</td>
                                <td className="px-3 py-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{row.owner || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={importToListingOwners}
                      disabled={!normalizedRows.length || importing}
                      className="flex-1 py-3 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}
                    >
                      {importing ? (
                        <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Importing...</>
                      ) : (
                        <><DatabaseZap className="w-4 h-4" /> Import {normalizedRows.length} Records → Listing Owners</>
                      )}
                    </button>
                    <button
                      onClick={downloadBatchDataCSV}
                      disabled={!normalizedRows.length}
                      className="py-3 px-5 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <Download className="w-4 h-4" /> Download CSV
                    </button>
                  </div>

                  {importResult && (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />
                      <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                        ✓ {importResult.success} owners imported to Listing Owners database!
                        {importResult.skipped > 0 && ` (${importResult.skipped} skipped)`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {parseError && (
                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#EF4444' }} />
                  <span className="text-xs" style={{ color: '#EF4444' }}>{parseError}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}