import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
];

function formatPrice(val) {
  if (!val) return '—';
  return '$' + Number(val).toLocaleString();
}

export default function AdminBulkSkipTrace() {
  const [city, setCity] = useState('');
  const [state, setState] = useState('CA');
  const [minPrice, setMinPrice] = useState('2000000');
  const [maxResults, setMaxResults] = useState('10');
  const [daysListed, setDaysListed] = useState('1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const res = await appClient.functions.invoke('searchListingsForSkipTrace', {
        city: city.trim(),
        state,
        min_price: parseInt(minPrice) || 0,
        max_results: parseInt(maxResults) || 10,
        days_listed: parseInt(daysListed) || 1,
      });

      if (res.data?.error) {
        setError(res.data.error + (res.data.details ? `\n\nDetails: ${res.data.details}` : ''));
      } else {
        setResults(res.data);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!results?.properties?.length) return;

    // BatchData bulk skip trace CSV format
    const headers = ['First Name', 'Last Name', 'Property Address', 'Property City', 'Property State', 'Property Zip'];
    const rows = results.properties.map(p => {
      const nameParts = (p.owner_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      return [
        firstName,
        lastName,
        p.street,
        p.city,
        p.state,
        p.zip
      ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skip-trace-${city.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#808080' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-bold tracking-[0.3em] mb-1" style={{ color: GOLD }}>ADMIN TOOL</p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#fff' }}>Bulk Skip Trace Builder</h1>
          <p className="text-sm" style={{ color: '#fff' }}>
            Search active listings by criteria → download a CSV → upload to BatchData's bulk skip trace tool.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-6"
          style={{ background: '#000', border: `1px solid rgba(212,175,55,0.25)` }}
        >
          <p className="text-xs font-bold tracking-widest mb-4" style={{ color: GOLD }}>SEARCH CRITERIA</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: '#fff' }}>CITY *</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Los Angeles"
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: '#fff' }}>STATE</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
              >
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: '#fff' }}>MIN PRICE</label>
              <input
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="2000000"
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: '#fff' }}>DAYS LISTED ≤</label>
              <input
                value={daysListed}
                onChange={e => setDaysListed(e.target.value)}
                placeholder="1"
                type="number"
                min="1"
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: '#fff' }}>MAX RESULTS</label>
              <input
                value={maxResults}
                onChange={e => setMaxResults(e.target.value)}
                placeholder="10"
                type="number"
                min="1"
                max="100"
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !city.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Searching Listings...' : 'Find Active Listings'}
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-5 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
            <div>
              <p className="font-bold text-sm mb-1" style={{ color: '#EF4444' }}>Search Failed</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.7)' }}>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: '#000', border: `1px solid ${GOLD}` }}>

            {/* Results header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: '#22C55E' }} />
                <span className="font-bold" style={{ color: '#fff' }}>{results.count} Listings Found</span>
                <span className="text-sm" style={{ color: '#fff' }}>
                  — {city}, {state} · Listed ≤{daysListed} day{daysListed !== '1' ? 's' : ''} · Min {formatPrice(minPrice)}
                </span>
              </div>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}
              >
                <Download className="w-4 h-4" />
                Download CSV for BatchData
              </button>
            </div>

            {/* Table */}
            {results.properties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Address', 'City', 'ST', 'Zip', 'List Price', 'Listed', 'DOM', 'Beds', 'Baths', 'SqFt', 'Owner'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold tracking-widest" style={{ color: GOLD }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.properties.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium" style={{ color: '#fff' }}>{p.street || '—'}</td>
                        <td className="px-4 py-3" style={{ color: '#fff' }}>{p.city}</td>
                        <td className="px-4 py-3" style={{ color: '#fff' }}>{p.state}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.zip || '—'}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: GOLD }}>{formatPrice(p.list_price)}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.list_date || '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.days_on_market ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.beds || '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.baths || '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.sqft ? Number(p.sqft).toLocaleString() : '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{p.owner_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                No listings found matching your criteria. Try expanding your search.
              </div>
            )}

            {/* Instructions */}
            {results.properties.length > 0 && (
              <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(212,175,55,0.05)' }}>
                <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>NEXT STEPS</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {['1. Click "Download CSV for BatchData"', '2. Go to app.batchdata.com → Skip Trace → Bulk Upload', '3. Upload the CSV file', '4. Download results and add owners to your database'].map((s, i) => (
                    <p key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}