import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { RefreshCw, Zap, DollarSign, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Clock, Video, Linkedin, BarChart3, Pencil, Save, Plus, Trash2 } from 'lucide-react';

const GOLD = '#D4AF37';
const COST_PER_RENDER = 30; // HeyGen credits per video render
const COST_PER_COMBINED = 60; // Combined Charlie+Bob render (one call, two characters)
const USD_PER_CREDIT = 0.01; // HeyGen API: 1 credit ≈ $0.01 (verify at heygen.com/settings/billing)
const creditsToUsd = (c) => `$${(c * USD_PER_CREDIT).toFixed(2)}`;

const INVESTMENT_KEY = 'heygen_investment_tracker_v1';
const DEFAULT_CATEGORIES = [
  { id: 'api_credits', label: 'API Credits (Pay-As-You-Go)', amount: 0 },
  { id: 'monthly_plan', label: 'Monthly Plan / Subscription', amount: 0 },
  { id: 'avatar_cloning', label: 'Custom Avatar Cloning', amount: 0 },
  { id: 'voice_cloning', label: 'Voice Cloning', amount: 0 },
  { id: 'photo_avatar', label: 'Talking Photo Avatars', amount: 0 },
  { id: 'premium_features', label: 'Premium Features / Upsells', amount: 0 },
  { id: 'storage', label: 'Storage & Bandwidth', amount: 0 },
  { id: 'other', label: 'Other / Misc', amount: 0 },
];

const PIPELINES = [
  { entity: 'CorporateReloClip', label: 'Corporate Relo / HR', fn: 'corporateReloQARender' },
  { entity: 'RealEstateQAClip', label: 'Real Estate Answers', fn: 'realEstateQARender' },
  { entity: 'PortalLeadInClip', label: 'Portal Lead-In Duo', fn: 'portalLeadInRender' },
  { entity: 'DnnNewsClip', label: 'DNN News Clips', fn: 'dnnNewsRender' },
  { entity: 'LenderClip', label: 'Lender FAQ', fn: 'lenderRender' },
  { entity: 'VettingDeskClip', label: 'Vetting Desk', fn: 'vettingDeskQARender' },
  { entity: 'ReceivingAgentClip', label: 'Receiving Agent', fn: 'receivingAgentQARender' },
  { entity: 'RoadmapClip', label: 'Relocation Roadmap', fn: 'roadmapQARender' },
  { entity: 'SolveMyStoryClip', label: 'Solve My Story', fn: 'solveMyStoryRender' },
  { entity: 'DnnComparisonClip', label: 'DNN Comparison', fn: null },
];

const InvestmentTracker = ({ apiCredits = 0 }) => {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(INVESTMENT_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });
  const [editing, setEditing] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const save = (cats) => {
    setCategories(cats);
    localStorage.setItem(INVESTMENT_KEY, JSON.stringify(cats));
  };

  const updateAmount = (id, amount) => {
    save(categories.map(c => c.id === id ? { ...c, amount: parseFloat(amount) || 0 } : c));
  };

  const addCategory = () => {
    if (!newLabel.trim()) return;
    save([...categories, { id: 'custom_' + Date.now(), label: newLabel.trim(), amount: 0 }]);
    setNewLabel('');
  };

  const removeCategory = (id) => {
    save(categories.filter(c => c.id !== id));
  };

  const total = categories.reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a1a', border: `1px solid rgba(212,175,55,0.2)` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Total HeyGen Investment</p>
        </div>
        <button onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-black transition-all hover:scale-105"
          style={{ background: editing ? '#333' : 'linear-gradient(135deg, #e8c84a, #D4AF37)', color: editing ? GOLD : '#000' }}>
          {editing ? <Save className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Grand Total Banner */}
      <div className="mb-5 p-4 rounded-xl text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid rgba(212,175,55,0.3)` }}>
        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-400 mb-1">All-Time HeyGen Spend</p>
        <p className="text-4xl font-black" style={{ color: GOLD, fontFamily: 'Cormorant Garamond, serif' }}>
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          + {apiCredits.toLocaleString()} API credits remaining (≈ {creditsToUsd(apiCredits)})
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="flex-1 text-xs text-slate-300">{cat.label}</span>
            {editing ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={cat.amount || ''}
                  onChange={(e) => updateAmount(cat.id, e.target.value)}
                  placeholder="0.00"
                  className="w-24 bg-black/40 text-white text-xs px-2 py-1 rounded border border-white/10 focus:border-yellow-500/50 outline-none"
                />
                <button onClick={() => removeCategory(cat.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-sm font-bold" style={{ color: cat.amount > 0 ? GOLD : '#555' }}>
                ${(cat.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add new category (edit mode) */}
      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            placeholder="Add category (e.g. 'Photo Avatar Pro')"
            className="flex-1 bg-black/40 text-white text-xs px-3 py-2 rounded-lg border border-white/10 focus:border-yellow-500/50 outline-none"
          />
          <button onClick={addCategory} className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg text-black" style={{ background: GOLD }}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      )}

      <p className="mt-4 text-[10px] text-slate-600">
        Manual entry — HeyGen's API only returns remaining credits, not billing history. Update these amounts as you add funds or upgrade plans. Saved to this browser.
      </p>
    </div>
  );
};

const creditsToUsdNum = (c) => c * USD_PER_CREDIT;

export default function AdminProductionDashboard() {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState(null);

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (user?.role !== 'admin') {
        window.location.href = '/';
      } else {
        setIsAdmin(true);
      }
    }).catch(() => window.location.href = '/');
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      let renderMsg = '';
      try {
        const r = await appClient.functions.invoke('dnnMorningBroadcast', { action: 'check' });
        renderMsg = r.data?.checked?.length ? `Renders: ${r.data.checked.length}` : '';
      } catch (e) { renderMsg = `Render: ${e.message}`; }

      let stitchMsg = '';
      try {
        const s = await appClient.functions.invoke('dnnStitchBroadcast', { action: 'check' });
        stitchMsg = s.data?.checked?.length ? `Stitch: ${s.data.checked.length}` : '';
      } catch (e) { stitchMsg = `Stitch: ${e.message}`; }

      queryClient.invalidateQueries({ queryKey: ['productionDashboard'] });

      setRefreshMsg(`${renderMsg}${renderMsg && stitchMsg ? ' · ' : ''}${stitchMsg}`.trim() || 'Dashboard refreshed');
    } catch (error) {
      setRefreshMsg(`Error: ${error.message}`);
    }
    setRefreshing(false);
  };

  // Fetch all clip entities in parallel
  const pipelineQueries = useQuery({
    queryKey: ['productionDashboard'],
    queryFn: async () => {
      const results = {};
      for (const p of PIPELINES) {
        try {
          const clips = await appClient.entities[p.entity].list(undefined, 200);
          results[p.entity] = { clips, pipeline: p };
        } catch (err) {
          results[p.entity] = { error: err.message, pipeline: p };
        }
      }

      // Also fetch DnnArticle video readiness
      try {
        const articles = await appClient.entities.DnnArticle.list(undefined, 100);
        results._articles = articles;
      } catch (err) {
        results._articles = [];
      }

      // Fetch DnnBroadcast status
      try {
        const broadcasts = await appClient.entities.DnnBroadcast.list(undefined, 50);
        results._broadcasts = broadcasts;
      } catch (err) {
        results._broadcasts = [];
      }

      // Fetch HeyGen quota
      try {
        const res = await appClient.functions.invoke('heygenQuota', {});
        results._quota = res.data?.data || res.data;
      } catch (err) {
        results._quota = null;
      }

      return results;
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const data = pipelineQueries.data || {};
  const articles = data._articles || [];
  const broadcasts = data._broadcasts || [];
  const quota = data._quota;

  // Build pipeline stats
  const pipelineStats = PIPELINES.map(p => {
    const entry = data[p.entity];
    if (!entry || entry.error) return { ...p, error: true, total: 0, charlieDone: 0, bobDone: 0, failed: 0, notStarted: 0, combinedDone: 0 };
    const clips = entry.clips || [];
    const charlieDone = clips.filter(c => c.charlieStatus === 'completed').length;
    const bobDone = clips.filter(c => c.bobStatus === 'completed').length;
    const charlieFailed = clips.filter(c => c.charlieStatus === 'failed').length;
    const bobFailed = clips.filter(c => c.bobStatus === 'failed').length;
    const charlieNotStarted = clips.filter(c => c.charlieScript && (!c.charlieStatus || c.charlieStatus === 'not_started')).length;
    const bobNotStarted = clips.filter(c => c.bobScript && (!c.bobStatus || c.bobStatus === 'not_started')).length;
    const combinedDone = clips.filter(c => c.combinedStatus === 'completed').length;
    const combinedRendering = clips.filter(c => c.combinedStatus === 'rendering').length;
    const combinedFailed = clips.filter(c => c.combinedStatus === 'failed').length;
    const totalRenders = charlieDone + bobDone;
    const totalFailed = charlieFailed + bobFailed;
    const totalNotStarted = charlieNotStarted + bobNotStarted;
    return {
      ...p,
      total: clips.length,
      charlieDone, bobDone, totalRenders,
      charlieFailed, bobFailed, totalFailed,
      charlieNotStarted, bobNotStarted, totalNotStarted,
      combinedDone, combinedRendering, combinedFailed,
      clips,
    };
  });

  // Cost calculations
  const totalCompletedRenders = pipelineStats.reduce((s, p) => s + p.charlieDone + p.bobDone, 0);
  const totalFailedRenders = pipelineStats.reduce((s, p) => s + p.totalFailed, 0);
  const totalNotStarted = pipelineStats.reduce((s, p) => s + p.totalNotStarted, 0);
  const totalCombinedDone = pipelineStats.reduce((s, p) => s + p.combinedDone, 0);

  const creditsSpent = (totalCompletedRenders * COST_PER_RENDER) + (totalCombinedDone * COST_PER_COMBINED);
  const creditsWasted = totalFailedRenders * COST_PER_RENDER;
  const creditsNeeded = totalNotStarted * COST_PER_RENDER;

  // LinkedIn readiness
  const publishedWithVideo = articles.filter(a => a.status === 'published' && a.video_url && !a.video_url.startsWith('heygen:'));
  const stagedWithVideo = articles.filter(a => a.status === 'staged' && a.video_url && !a.video_url.startsWith('heygen:'));
  const completedBroadcasts = broadcasts.filter(b => b.status === 'completed');
  const linkedInReady = publishedWithVideo.length + stagedWithVideo.length + completedBroadcasts.length;

  // Daily/weekly/monthly projections (based on current pipeline patterns)
  const dailyArticleRenders = 3; // estimated daily article video renders
  const dailyCost = dailyArticleRenders * COST_PER_RENDER;
  const weeklyCost = dailyCost * 7;
  const monthlyCost = dailyCost * 30;

  const apiCredits = quota?.remaining_quota ?? 0;
  const planCredits = quota?.details?.plan_credit ?? 0;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}` }}>
              <BarChart3 className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>Production Cost Dashboard</h1>
              <p className="text-[10px] text-slate-500">HeyGen render costs, pipeline status & LinkedIn readiness</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {refreshMsg && <span className="text-[10px] text-slate-400 max-w-xs truncate">{refreshMsg}</span>}
            <button onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg text-black transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Total HeyGen Investment Tracker */}
        <InvestmentTracker apiCredits={apiCredits} />

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard icon={DollarSign} label="Credits Spent" value={creditsSpent.toLocaleString()} sub={`≈ ${creditsToUsd(creditsSpent)} on completed renders`} color={GOLD} />
          <KpiCard icon={Zap} label="API Credits Left" value={apiCredits.toLocaleString()} sub={`≈ ${creditsToUsd(apiCredits)} remaining`} color={apiCredits < 200 ? '#ef4444' : '#4ade80'} />
          <KpiCard icon={AlertTriangle} label="Credits Wasted" value={creditsWasted.toLocaleString()} sub={`≈ ${creditsToUsd(creditsWasted)} on ${totalFailedRenders} failed renders`} color="#ef4444" />
          <KpiCard icon={Linkedin} label="LinkedIn Ready" value={linkedInReady} sub="videos ready to post" color="#0a66c2" />
        </div>

        {/* Cost Projections */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-4">Cost Projections</p>
          <div className="grid grid-cols-3 gap-4">
            <ProjectionCard label="Daily" cost={dailyCost} sub={`${dailyArticleRenders} renders/day · ${creditsToUsd(dailyCost)}`} />
            <ProjectionCard label="Weekly" cost={weeklyCost} sub={`7-day projection · ${creditsToUsd(weeklyCost)}`} />
            <ProjectionCard label="Monthly" cost={monthlyCost} sub={`30-day projection · ${creditsToUsd(monthlyCost)}`} />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Combined render strategy saves ~50% — Charlie+Bob in one API call instead of two.</span>
          </div>
          {apiCredits > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(74,222,128,0.06)' }}>
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
              <span className="text-slate-300">
                Account balance: <span className="font-bold text-green-400">{apiCredits.toLocaleString()} credits</span> ≈ <span className="font-bold text-green-400">{creditsToUsd(apiCredits)}</span>
                {totalNotStarted > 0 && (
                  <span className="text-yellow-400 ml-2">· {totalNotStarted} pending renders need ~{totalNotStarted * COST_PER_RENDER} credits ({creditsToUsd(totalNotStarted * COST_PER_RENDER)})</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Pipeline Status Table */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-4">Pipeline Render Status</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-white/10">
                  <th className="text-left py-2 px-2 font-bold uppercase tracking-wider">Pipeline</th>
                  <th className="text-center py-2 px-2 font-bold uppercase tracking-wider">Total</th>
                  <th className="text-center py-2 px-2 font-bold uppercase tracking-wider">Done</th>
                  <th className="text-center py-2 px-2 font-bold uppercase tracking-wider">Failed</th>
                  <th className="text-center py-2 px-2 font-bold uppercase tracking-wider">Not Started</th>
                  <th className="text-center py-2 px-2 font-bold uppercase tracking-wider">Combined</th>
                  <th className="text-right py-2 px-2 font-bold uppercase tracking-wider">Credits Spent</th>
                  <th className="text-right py-2 px-2 font-bold uppercase tracking-wider">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {pipelineStats.map(p => (
                  <tr key={p.entity} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2 font-semibold text-white">{p.label}</td>
                    <td className="text-center py-2 px-2 text-slate-400">{p.total}</td>
                    <td className="text-center py-2 px-2">
                      <span className="text-green-400 font-bold">{p.charlieDone + p.bobDone}</span>
                    </td>
                    <td className="text-center py-2 px-2">
                      {p.totalFailed > 0 ? <span className="text-red-400 font-bold">{p.totalFailed}</span> : <span className="text-slate-600">0</span>}
                    </td>
                    <td className="text-center py-2 px-2">
                      {p.totalNotStarted > 0 ? <span className="text-yellow-400 font-bold">{p.totalNotStarted}</span> : <span className="text-slate-600">0</span>}
                    </td>
                    <td className="text-center py-2 px-2">
                      {p.combinedDone > 0 ? <span className="font-bold" style={{ color: GOLD }}>{p.combinedDone}</span> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="text-right py-2 px-2 font-bold" style={{ color: GOLD }}>
                      {((p.charlieDone + p.bobDone) * COST_PER_RENDER + p.combinedDone * COST_PER_COMBINED).toLocaleString()}
                    </td>
                    <td className="text-right py-2 px-2 text-slate-400">
                      {creditsToUsd((p.charlieDone + p.bobDone) * COST_PER_RENDER + p.combinedDone * COST_PER_COMBINED)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-white/20">
                  <td className="py-3 px-2 font-black text-white uppercase tracking-wider text-[10px]">TOTALS</td>
                  <td className="text-center py-3 px-2 font-black text-slate-400">{pipelineStats.reduce((s, p) => s + p.total, 0)}</td>
                  <td className="text-center py-3 px-2 font-black text-green-400">{totalCompletedRenders}</td>
                  <td className="text-center py-3 px-2 font-black text-red-400">{totalFailedRenders}</td>
                  <td className="text-center py-3 px-2 font-black text-yellow-400">{totalNotStarted}</td>
                  <td className="text-center py-3 px-2 font-black" style={{ color: GOLD }}>{totalCombinedDone}</td>
                  <td className="text-right py-3 px-2 font-black" style={{ color: GOLD }}>{creditsSpent.toLocaleString()}</td>
                  <td className="text-right py-3 px-2 font-black text-slate-300">{creditsToUsd(creditsSpent)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Attention Required */}
        {(totalFailedRenders > 0 || totalNotStarted > 0) && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a1a', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-red-400">Attention Required</p>
            </div>
            <div className="space-y-3">
              {pipelineStats.filter(p => p.totalFailed > 0 || p.totalNotStarted > 0).map(p => {
                const failedClips = (p.clips || []).filter(c => c.charlieStatus === 'failed' || c.bobStatus === 'failed');
                const notStartedClips = (p.clips || []).filter(c =>
                  (c.charlieScript && (!c.charlieStatus || c.charlieStatus === 'not_started')) ||
                  (c.bobScript && (!c.bobStatus || c.bobStatus === 'not_started'))
                );
                return (
                  <div key={p.entity} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{p.label}</span>
                      <div className="flex items-center gap-4 text-xs">
                        {p.totalFailed > 0 && (
                          <span className="flex items-center gap-1 text-red-400">
                            <XCircle className="w-3 h-3" /> {p.totalFailed} failed
                          </span>
                        )}
                        {p.totalNotStarted > 0 && (
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Clock className="w-3 h-3" /> {p.totalNotStarted} not started
                          </span>
                        )}
                      </div>
                    </div>
                    {failedClips.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {failedClips.map(c => (
                          <div key={c.id} className="flex items-start gap-2 text-[10px] pl-2 border-l-2 border-red-500/30">
                            <span className="text-red-400 shrink-0">✗</span>
                            <div>
                              <span className="text-slate-300">{c.question || c.kind}</span>
                              {c.errorMessage && (
                                <span className="text-red-400 ml-1">— {c.errorMessage}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {notStartedClips.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {notStartedClips.map(c => (
                          <div key={c.id} className="flex items-start gap-2 text-[10px] pl-2 border-l-2 border-yellow-500/30">
                            <span className="text-yellow-400 shrink-0">⏳</span>
                            <span className="text-slate-300">{c.question || c.kind}</span>
                            <span className="text-slate-500">— script: {c.scriptStatus || 'unknown'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
              Failed clips need re-rendering. Not-started clips need credits or script approval. Use the Q&A Script Studio to approve scripts, then trigger renders from each pipeline's function.
            </p>
          </div>
        )}

        {/* LinkedIn Readiness */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1a1a1a', border: '1px solid rgba(10,102,194,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Linkedin className="w-4 h-4" style={{ color: '#0a66c2' }} />
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">LinkedIn Posting Readiness</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ReadinessCard icon={Video} label="Articles with Video" value={publishedWithVideo.length + stagedWithVideo.length} sub={`${articles.length} total articles`} />
            <ReadinessCard icon={CheckCircle2} label="Completed Broadcasts" value={completedBroadcasts.length} sub={`${broadcasts.length} total broadcasts`} />
            <ReadinessCard icon={Linkedin} label="Total Ready" value={linkedInReady} sub="ready to post now" />
          </div>
          {linkedInReady > 0 && (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-xs text-green-300">
                {linkedInReady} video{linkedInReady !== 1 ? 's' : ''} ready for LinkedIn posting. Use the DNN Video Preview & Blast page to post.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          Auto-refreshes every 30 seconds · ~{COST_PER_RENDER} credits/render · {USD_PER_CREDIT < 0.01 ? `${(USD_PER_CREDIT * 100).toFixed(1)}¢` : `$${USD_PER_CREDIT.toFixed(2)}`}/credit · Verify actual costs at heygen.com/settings/billing
        </p>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-black tracking-[0.25em] uppercase text-slate-500">{label}</p>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-3xl font-black" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function ProjectionCard({ label, cost, sub }) {
  return (
    <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.06)' }}>
      <p className="text-[9px] font-black tracking-[0.25em] uppercase text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black" style={{ color: GOLD, fontFamily: 'Cormorant Garamond, serif' }}>{cost.toLocaleString()}</p>
      <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function ReadinessCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(10,102,194,0.06)' }}>
      <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: '#0a66c2' }} />
      <p className="text-2xl font-black text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{value}</p>
      <p className="text-[10px] font-bold text-slate-400 mt-1">{label}</p>
      <p className="text-[9px] text-slate-600">{sub}</p>
    </div>
  );
}