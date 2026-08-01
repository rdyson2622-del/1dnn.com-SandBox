import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { 
  Send, AlertCircle, MessageSquare, 
  TrendingUp, Users, MapPin, RefreshCw, ChevronDown, ChevronRight,
  BarChart3, Phone, UserCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STAGE_CONFIG = {
  outreach:        { label: 'Sent / Pending',   color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  response:        { label: 'Responded',         color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  profile_complete:{ label: 'Profile Complete',  color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  processing:      { label: 'Processing',        color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  closed:          { label: 'Closed / Won',      color: 'bg-slate-100 text-slate-700',  dot: 'bg-slate-500' },
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#64748b'];

function StatCard({ icon: Icon, label, value, sub, color = 'text-slate-900' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
          <p className="text-xs text-slate-500 mt-1">{label}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function CityEngagementRow({ city, campaigns }) {
  const [open, setOpen] = useState(false);

  const total     = campaigns.length;
  const responded = campaigns.filter(c => c.workflow_stage !== 'outreach').length;
  const closed    = campaigns.filter(c => c.workflow_stage === 'closed').length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const stageCounts = Object.keys(STAGE_CONFIG).reduce((acc, s) => {
    acc[s] = campaigns.filter(c => c.workflow_stage === s).length;
    return acc;
  }, {});

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
        onClick={() => setOpen(v => !v)}
      >
        <td className="px-4 py-3 w-8">
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{city}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center text-slate-700 font-medium">{total}</td>
        <td className="px-4 py-3 text-center">
          <span className="text-blue-700 font-semibold">{stageCounts.outreach}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-green-700 font-semibold">{responded}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-slate-600">{closed}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${responseRate}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 font-medium w-8 text-right">{responseRate}%</span>
          </div>
        </td>
      </tr>

      {/* Expanded recipient rows */}
      {open && campaigns.map(c => {
        const stage = STAGE_CONFIG[c.workflow_stage] || STAGE_CONFIG.outreach;
        return (
          <tr key={c.id} className="border-b border-slate-50 bg-slate-50/60 text-xs">
            <td className="px-4 py-2" />
            <td className="px-4 py-2 pl-10 text-slate-700">
              <div className="font-medium">{c.owner_name}</div>
              <div className="text-slate-400 truncate max-w-xs">{c.property_address}</div>
            </td>
            <td className="px-4 py-2 text-center text-slate-500">{c.owner_phone || '—'}</td>
            <td className="px-4 py-2 text-center">
              <span className="text-slate-400">{c.sms_sent_date ? new Date(c.sms_sent_date).toLocaleDateString() : '—'}</span>
            </td>
            <td className="px-4 py-2 text-center">
              {c.response_date
                ? <span className="text-green-600 font-medium">{new Date(c.response_date).toLocaleDateString()}</span>
                : <span className="text-slate-300">—</span>}
            </td>
            <td className="px-4 py-2 text-center">
              {c.destination_city
                ? <span className="text-purple-600">{c.destination_city}{c.destination_state ? `, ${c.destination_state}` : ''}</span>
                : <span className="text-slate-300">—</span>}
            </td>
            <td className="px-4 py-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                {stage.label}
              </span>
            </td>
          </tr>
        );
      })}
    </>
  );
}

export default function AdminOutreachAnalytics() {
  const [selectedCity, setSelectedCity] = useState('All');

  const { data: campaigns = [], isLoading: loadingCampaigns, refetch } = useQuery({
    queryKey: ['outreachCampaigns'],
    queryFn: () => appClient.entities.OwnerOutreachCampaign.list('-sms_sent_date', 2000),
    refetchInterval: 30000,
  });

  const { data: batchLogs = [] } = useQuery({
    queryKey: ['batchSMSLogs'],
    queryFn: () => appClient.entities.BatchSMSLog.list('-sent_at', 200),
  });

  // All cities from campaigns
  const cities = useMemo(() => {
    const set = new Set(campaigns.map(c => c.property_address?.split(',').slice(-3, -2)[0]?.trim() || 'Unknown'));
    return ['All', ...Array.from(set).sort()];
  }, [campaigns]);

  // Group campaigns by city (extracted from property_address)
  const grouped = useMemo(() => {
    const map = {};
    for (const c of campaigns) {
      const city = c.property_address?.split(',')[1]?.trim() || 'Unknown';
      if (!map[city]) map[city] = [];
      map[city].push(c);
    }
    return Object.entries(map).sort(([, a], [, b]) => b.length - a.length);
  }, [campaigns]);

  // Grand totals
  const total       = campaigns.length;
  const totalSent   = batchLogs.reduce((s, l) => s + (l.sent_count || 0), 0);
  const totalFailed = batchLogs.reduce((s, l) => s + (l.failed_count || 0), 0);
  const responded   = campaigns.filter(c => c.workflow_stage !== 'outreach').length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const withDestination = campaigns.filter(c => c.destination_city).length;
  const charlieEngaged  = campaigns.filter(c => c.charlie_engaged).length;

  // Stage breakdown for pie chart
  const stageData = Object.entries(STAGE_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    value: campaigns.filter(c => c.workflow_stage === key).length,
  })).filter(d => d.value > 0);

  // City bar chart data (top 10)
  const cityBarData = grouped.slice(0, 10).map(([city, list]) => ({
    city: city.length > 12 ? city.slice(0, 12) + '…' : city,
    total: list.length,
    responded: list.filter(c => c.workflow_stage !== 'outreach').length,
  }));

  if (loadingCampaigns) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Outreach Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">SMS delivery tracking & recipient engagement</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={Send}        label="Total Queued"      value={totalSent.toLocaleString()} color="text-slate-900" />
          <StatCard icon={AlertCircle} label="Failed"            value={totalFailed.toLocaleString()} color="text-red-600" />
          <StatCard icon={Users}       label="In Campaign"       value={total.toLocaleString()} />
          <StatCard icon={MessageSquare} label="Responded"       value={responded.toLocaleString()} color="text-green-600" />
          <StatCard icon={TrendingUp}  label="Response Rate"     value={`${responseRate}%`} color={responseRate > 5 ? 'text-green-600' : 'text-slate-700'} />
          <StatCard icon={UserCheck}   label="Gave Destination"  value={withDestination.toLocaleString()} color="text-purple-600" />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Stage Breakdown Pie */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Recipient Stage Breakdown
            </h2>
            {stageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                    {stageData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-300 text-sm">No data yet</div>
            )}
          </div>

          {/* City Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Top Cities — Sent vs Responded
            </h2>
            {cityBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cityBarData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Sent" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="responded" name="Responded" fill="#22c55e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-300 text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Stage Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(STAGE_CONFIG).map(([key, cfg]) => {
            const count = campaigns.filter(c => c.workflow_stage === key).length;
            return (
              <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className="font-bold ml-0.5">{count}</span>
              </span>
            );
          })}
        </div>

        {/* Per-City Engagement Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Recipient Engagement by City</h2>
            <span className="text-xs text-slate-400 ml-auto">Click a city to expand individual contacts</span>
          </div>
          {grouped.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No campaign data yet</p>
              <p className="text-sm mt-1">Send your first batch from Admin → Owners</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-8" />
                  <th className="text-left px-4 py-3 font-semibold">City</th>
                  <th className="text-center px-4 py-3 font-semibold">Total</th>
                  <th className="text-center px-4 py-3 font-semibold">Pending</th>
                  <th className="text-center px-4 py-3 font-semibold">Responded</th>
                  <th className="text-center px-4 py-3 font-semibold">Closed</th>
                  <th className="px-4 py-3 font-semibold">Response Rate</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(([city, list]) => (
                  <CityEngagementRow key={city} city={city} campaigns={list} />
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}