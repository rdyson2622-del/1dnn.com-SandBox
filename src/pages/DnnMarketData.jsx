import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, MapPin } from 'lucide-react';
import { appClient } from '@/api/appClient';

export default function DnnMarketData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await appClient.integrations.Core.InvokeLLM({
      prompt: `You are a real estate market data analyst. Search the web for today's most current data on:

1. Current 30-year fixed mortgage rate (US average)
2. Current 15-year fixed mortgage rate
3. Fed Funds Rate / Fed policy stance
4. Net migration flows: California (outflow), Arizona (inflow), Florida (inflow), Texas (inflow), Nevada (inflow), New York (outflow) — use most recent available data
5. Median home prices in: San Francisco, Los Angeles, Phoenix, Scottsdale, Miami, Tampa, Austin, Las Vegas — use most recent available
6. Year-over-year home price change % for each city above
7. Any notable relocation-trigger news from this week (max 3 bullet points)

Return as JSON matching this schema exactly.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          rates: {
            type: 'object',
            properties: {
              rate_30yr: { type: 'string' },
              rate_15yr: { type: 'string' },
              fed_funds: { type: 'string' },
              rate_trend: { type: 'string' },
              as_of: { type: 'string' },
            }
          },
          migration: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                state: { type: 'string' },
                direction: { type: 'string' },
                net_flow: { type: 'string' },
                rank: { type: 'string' },
              }
            }
          },
          home_prices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                state: { type: 'string' },
                median_price: { type: 'string' },
                yoy_change: { type: 'string' },
                trend: { type: 'string' },
              }
            }
          },
          news_bullets: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });
    setData(res);
    setLastFetched(new Date());
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>DNN Intelligence Bureau</span>
            </div>
            <h1 className="text-2xl font-black text-white">Market Data Hub</h1>
            <p className="text-sm text-slate-400 mt-1">Real-time rates, migration flows & home prices — pulled live from the web.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button onClick={fetchData} disabled={loading} className="gap-2 font-bold"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)', color: '#000' }}>
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Fetching...</> : <><RefreshCw className="w-4 h-4" />Refresh Data</>}
            </Button>
            {lastFetched && <p className="text-[10px] text-slate-600">Last updated: {lastFetched.toLocaleTimeString()}</p>}
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border p-6 flex items-center gap-3 mb-6" style={{ background: 'rgba(212,175,55,0.07)', borderColor: 'rgba(212,175,55,0.2)' }}>
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: '#D4AF37' }} />
            <div>
              <p className="text-sm font-semibold text-white">Scanning financial sources...</p>
              <p className="text-xs text-slate-400">Pulling current rates, migration data, and home prices. Takes 15–30 seconds.</p>
            </div>
          </div>
        )}

        {!data && !loading && (
          <div className="text-center py-24 border border-dashed rounded-xl" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-400 font-medium">No data loaded yet.</p>
            <p className="text-slate-600 text-sm mt-1">Click "Refresh Data" to pull live market stats from the web.</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Interest Rates */}
            {data.rates && (
              <Section title="Interest Rates" icon={TrendingUp}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatBox label="30-Year Fixed" value={data.rates.rate_30yr} sub={`As of ${data.rates.as_of || 'recent'}`} />
                  <StatBox label="15-Year Fixed" value={data.rates.rate_15yr} />
                  <StatBox label="Fed Funds Rate" value={data.rates.fed_funds} />
                  <StatBox label="Rate Trend" value={data.rates.rate_trend} highlight />
                </div>
              </Section>
            )}

            {/* Migration Flows */}
            {data.migration?.length > 0 && (
              <Section title="State Migration Flows" icon={MapPin}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {data.migration.map((m, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{m.state}</span>
                        {m.direction === 'inflow'
                          ? <TrendingUp className="w-4 h-4 text-green-400" />
                          : <TrendingDown className="w-4 h-4 text-red-400" />}
                      </div>
                      <p className={`text-xs font-semibold ${m.direction === 'inflow' ? 'text-green-400' : 'text-red-400'}`}>
                        {m.direction === 'inflow' ? '▲ Net Inflow' : '▼ Net Outflow'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{m.net_flow}</p>
                      {m.rank && <p className="text-[10px] text-slate-600 mt-0.5">Rank: {m.rank}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Home Prices */}
            {data.home_prices?.length > 0 && (
              <Section title="Median Home Prices" icon={BarChart3}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <th className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">City</th>
                        <th className="text-right py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">Median Price</th>
                        <th className="text-right py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">YoY Change</th>
                        <th className="text-right py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.home_prices.map((p, i) => {
                        const yoyNum = parseFloat(p.yoy_change);
                        const up = !isNaN(yoyNum) ? yoyNum >= 0 : p.trend === 'up';
                        return (
                          <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-white">{p.city}</p>
                              <p className="text-xs text-slate-500">{p.state}</p>
                            </td>
                            <td className="py-3 px-3 text-right font-bold" style={{ color: '#D4AF37' }}>{p.median_price}</td>
                            <td className={`py-3 px-3 text-right font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>{p.yoy_change}</td>
                            <td className="py-3 px-3 text-right">
                              {up ? <TrendingUp className="w-4 h-4 text-green-400 ml-auto" /> : <TrendingDown className="w-4 h-4 text-red-400 ml-auto" />}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* News Bullets */}
            {data.news_bullets?.length > 0 && (
              <Section title="This Week's Relocation Triggers" icon={TrendingUp}>
                <ul className="space-y-3">
                  {data.news_bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>{i + 1}</span>
                      <p className="text-sm text-slate-300 leading-relaxed">{b}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: '#111', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
        <Icon className="w-4 h-4" style={{ color: '#D4AF37' }} />
        <h2 className="text-sm font-bold tracking-wide text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatBox({ label, value, sub, highlight }) {
  return (
    <div className="rounded-lg p-4 text-center" style={{ background: '#1a1a1a', border: `1px solid ${highlight ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-black" style={{ color: highlight ? '#D4AF37' : '#fff' }}>{value || '—'}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}