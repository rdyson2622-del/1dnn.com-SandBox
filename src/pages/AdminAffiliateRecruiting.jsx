import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import {
  UserPlus, Search, Trash2, Edit2, Send, Loader2, Mail, AlertTriangle,
  CheckCircle, Clock, XCircle, Newspaper, Users,
  ChevronDown, ChevronRight, Building2, BadgeCheck, Calendar
} from 'lucide-react';
import RecruitFormModal from '@/components/admin/RecruitFormModal';

const GOLD = '#D4AF37';
const DNN_LOGO = '/assets/dnn-logo.png';

const STATUS_STYLES = {
  pending:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'PENDING' },
  contacted:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', label: 'CONTACTED' },
  converted:   { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', label: 'CONVERTED' },
  active:      { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'ACTIVE' },
  declined:    { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'DECLINED' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AdminAffiliateRecruiting() {
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignResult, setCampaignResult] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (user?.role !== 'admin') window.location.href = '/';
      else setIsAdmin(true);
    }).catch(() => window.location.href = '/');
  }, []);

  const { data: recruits = [], isLoading } = useQuery({
    queryKey: ['affiliate_recruits'],
    queryFn: () => appClient.entities.VettedPartner.list('-created_date', 500),
    enabled: isAdmin,
  });

  const filtered = recruits.filter(r => {
    const matchSearch = !search ||
      r.agent_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase()) ||
      r.brokerage?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchMarket = marketFilter === 'all' || r.market_type === marketFilter;
    return matchSearch && matchStatus && matchMarket;
  });

  // Group by city
  const grouped = filtered.reduce((acc, r) => {
    const key = `${r.city}${r.state ? ', ' + r.state : ''}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  // Stats
  const stats = {
    total: recruits.length,
    pending: recruits.filter(r => r.status === 'pending').length,
    contacted: recruits.filter(r => r.status === 'contacted').length,
    converted: recruits.filter(r => r.status === 'converted' || r.status === 'active').length,
    dailyNews: recruits.filter(r => r.daily_news_subscribed).length,
    licenseExpiring: recruits.filter(r => {
      const days = daysUntil(r.dre_license_expiration);
      return days !== null && days <= 90 && days >= 0;
    }).length,
    licenseExpired: recruits.filter(r => {
      const days = daysUntil(r.dre_license_expiration);
      return days !== null && days < 0;
    }).length,
  };

  const launchCampaign = async () => {
    const pending = recruits.filter(r => r.status === 'pending' || !r.status);
    if (pending.length === 0) { alert('No pending recruits to invite.'); return; }
    if (!window.confirm(`Send recruitment campaign (email + SMS) to ${pending.length} pending affiliates?`)) return;
    setCampaignLoading(true);
    setCampaignResult(null);
    try {
      const res = await appClient.functions.invoke('agentInviteCampaign', { action: 'send' });
      setCampaignResult(res.data);
      qc.invalidateQueries({ queryKey: ['affiliate_recruits'] });
    } catch (e) {
      setCampaignResult({ error: e.message });
    }
    setCampaignLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the affiliate roster?`)) return;
    await appClient.entities.VettedPartner.delete(id);
    qc.invalidateQueries({ queryKey: ['affiliate_recruits'] });
  };

  const toggleDailyNews = async (recruit) => {
    await appClient.entities.VettedPartner.update(recruit.id, {
      daily_news_subscribed: !recruit.daily_news_subscribed,
      daily_news_subscribed_at: !recruit.daily_news_subscribed ? new Date().toISOString() : null,
    });
    qc.invalidateQueries({ queryKey: ['affiliate_recruits'] });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="flex items-center gap-3">
          <img src={DNN_LOGO} alt="DNN" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>Affiliate Recruiting Pipeline</p>
            <p className="text-[10px] text-slate-500">Recruit, track, and manage full-time affiliate brokers across all markets</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={launchCampaign} disabled={campaignLoading}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            {campaignLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {campaignLoading ? 'Sending…' : 'Launch Campaign'}
          </button>
          <button onClick={() => { setEditing(null); setShowAdd(true); }}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg text-black"
            style={{ background: `linear-gradient(135deg, #e8c84a, ${GOLD})` }}>
            <UserPlus className="w-3.5 h-3.5" /> Add Affiliate
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { icon: Users, label: 'Total', value: stats.total, color: '#fff' },
          { icon: Clock, label: 'Pending', value: stats.pending, color: '#fbbf24' },
          { icon: Mail, label: 'Contacted', value: stats.contacted, color: '#60a5fa' },
          { icon: CheckCircle, label: 'Converted', value: stats.converted, color: '#4ade80' },
          { icon: Newspaper, label: 'Daily News', value: stats.dailyNews, color: GOLD },
          { icon: AlertTriangle, label: 'Lic Expiring', value: stats.licenseExpiring, color: '#fbbf24' },
          { icon: XCircle, label: 'Lic Expired', value: stats.licenseExpired, color: '#f87171' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-slate-500">{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Result */}
      {campaignResult && (
        <div className="mx-6 mt-4 p-3 rounded-xl" style={{ background: campaignResult.error ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${campaignResult.error ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
          {campaignResult.error ? (
            <p className="text-xs font-bold text-red-400">✗ {campaignResult.error}</p>
          ) : (
            <p className="text-xs text-green-400">✓ Campaign sent — {campaignResult.emailed || 0} emails · {campaignResult.smsSent || 0} SMS · {campaignResult.targets || 0} targets</p>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full flex-1 min-w-[220px]" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
          <input placeholder="Search name, city, brokerage, email…" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-slate-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-full text-sm text-white outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="active">Active</option>
          <option value="declined">Declined</option>
        </select>
        <select value={marketFilter} onChange={e => setMarketFilter(e.target.value)}
          className="px-4 py-2 rounded-full text-sm text-white outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.2)' }}>
          <option value="all">All Markets</option>
          <option value="destination">Destination</option>
          <option value="exodus">Exodus</option>
        </select>
      </div>

      {/* Roster Table — dark mode, no grid lines */}
      <div className="px-6 pb-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">No affiliates found. Add one or import a roster to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([city, agents]) => (
              <div key={city}>
                {/* City header */}
                <button onClick={() => setExpandedCity(expandedCity === city ? null : city)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  {expandedCity === city ? <ChevronDown className="w-4 h-4" style={{ color: GOLD }} /> : <ChevronRight className="w-4 h-4" style={{ color: GOLD }} />}
                  <Building2 className="w-4 h-4" style={{ color: GOLD }} />
                  <span className="text-sm font-black text-white">{city}</span>
                  <span className="text-xs text-slate-500">({agents.length} agents)</span>
                </button>

                {expandedCity === city && (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Market</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Agent Name</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Brokerage</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Email</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Phone</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">License #</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Lic Exp</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Status</th>
                          <th className="text-left py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Daily News</th>
                          <th className="text-right py-3 px-3 text-[10px] font-black tracking-widest uppercase text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map(r => {
                          const licDays = daysUntil(r.dre_license_expiration);
                          const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                          return (
                            <tr key={r.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td className="py-3 px-3">
                                <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full"
                                  style={{ background: r.market_type === 'exodus' ? 'rgba(239,68,68,0.12)' : 'rgba(96,165,250,0.12)', color: r.market_type === 'exodus' ? '#f87171' : '#60a5fa' }}>
                                  {r.market_type === 'exodus' ? 'SENDER' : 'RECEIVER'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-white font-bold">{r.agent_name}</td>
                              <td className="py-3 px-3 text-slate-300">{r.brokerage || '—'}</td>
                              <td className="py-3 px-3 text-slate-400 text-xs">{r.email || '—'}</td>
                              <td className="py-3 px-3 text-slate-400 text-xs">{r.phone || '—'}</td>
                              <td className="py-3 px-3 text-slate-400 text-xs">
                                {r.dre_license_number ? (
                                  <span className="flex items-center gap-1">
                                    <BadgeCheck className="w-3 h-3" style={{ color: GOLD }} />
                                    {r.dre_license_number}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="py-3 px-3 text-xs">
                                {r.dre_license_expiration ? (
                                  <span style={{
                                    color: licDays < 0 ? '#f87171' : licDays <= 90 ? '#fbbf24' : '#4ade80'
                                  }}>
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {new Date(r.dre_license_expiration).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    {licDays < 0 ? ' ⚠ EXPIRED' : licDays <= 90 ? ` (${licDays}d)` : ''}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full"
                                  style={{ background: st.bg, color: st.color }}>
                                  {st.label}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <button onClick={() => toggleDailyNews(r)}
                                  className="text-xs px-2 py-1 rounded-lg font-bold transition-all"
                                  style={{
                                    background: r.daily_news_subscribed ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                                    color: r.daily_news_subscribed ? '#4ade80' : '#666',
                                    border: `1px solid ${r.daily_news_subscribed ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                  }}>
                                  {r.daily_news_subscribed ? '✓ Subscribed' : 'Subscribe'}
                                </button>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => { setEditing(r); setShowAdd(true); }}
                                    className="text-slate-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDelete(r.id, r.agent_name)}
                                    className="text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <RecruitFormModal
          recruit={editing}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ['affiliate_recruits'] })}
        />
      )}
    </div>
  );
}