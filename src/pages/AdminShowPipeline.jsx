import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import {
  RefreshCw, Zap, AlertTriangle
} from 'lucide-react';
import ShowPipelineCard from '@/components/dnn/ShowPipelineCard';
import ScriptEditorModal from '@/components/dnn/ScriptEditorModal';

const GOLD = '#D4AF37';
const DNN_LOGO = "/assets/dyson-logo.png";

export default function AdminShowPipeline() {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
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
      // 1. Poll HeyGen for clip render completions
      let renderMsg = '';
      try {
        const renderRes = await appClient.functions.invoke('dnnMorningBroadcast', { action: 'check' });
        renderMsg = renderRes.data?.checked?.length ? `Renders: ${renderRes.data.checked.length} checked` : '';
      } catch (e) { renderMsg = `Render check: ${e.message}`; }

      // 2. Poll HeyGen for stitching completions
      let stitchMsg = '';
      try {
        const stitchRes = await appClient.functions.invoke('dnnStitchBroadcast', { action: 'check' });
        stitchMsg = stitchRes.data?.checked?.length ? `Stitch: ${stitchRes.data.checked.length} checked` : '';
      } catch (e) { stitchMsg = `Stitch check: ${e.message}`; }

      // 3. Invalidate all cached queries so the UI picks up DB changes
      queryClient.invalidateQueries({ queryKey: ['showPipelineBroadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['heygenQuota'] });

      setRefreshMsg(`${renderMsg}${renderMsg && stitchMsg ? ' · ' : ''}${stitchMsg}`.trim() || 'All queries refreshed');
    } catch (error) {
      setRefreshMsg(`Error: ${error.message}`);
    }
    setRefreshing(false);
  };

  // Fetch all broadcasts (newest first)
  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['showPipelineBroadcasts'],
    queryFn: () => appClient.entities.DnnBroadcast.list('-broadcast_date', 50),
    refetchInterval: 15000,
    enabled: isAdmin,
  });

  // HeyGen credit balance
  const { data: quota, isLoading: quotaLoading } = useQuery({
    queryKey: ['heygenQuota'],
    queryFn: async () => {
      const res = await appClient.functions.invoke('heygenQuota', {});
      return res.data?.data || res.data;
    },
    refetchInterval: 30000,
    enabled: isAdmin,
  });

  const apiCredits = quota?.remaining_quota ?? 0;
  const planCredits = quota?.details?.plan_credit ?? 0;
  const totalCredits = apiCredits + planCredits;
  const avgCostPerVideo = 30;
  const isLow = apiCredits < 200;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="flex items-center gap-3">
          <img src={DNN_LOGO} alt="DNN" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: GOLD }}>Show Production Pipeline</p>
            <p className="text-[10px] text-slate-500">Step through each show — accumulate, select, script, render, stitch, preview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {refreshMsg && (
            <span className="text-[10px] text-slate-400 max-w-xs truncate">{refreshMsg}</span>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg text-black transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* HeyGen Credit Bar */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: isLow ? 'rgba(239,68,68,0.04)' : 'rgba(212,175,55,0.04)' }}>
        <Zap className="w-5 h-5 shrink-0" style={{ color: isLow ? '#ef4444' : GOLD }} fill={isLow ? '#ef4444' : GOLD} />
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase text-slate-500">API Credits</p>
            <p className="text-xl font-black" style={{ color: isLow ? '#ef4444' : GOLD, fontFamily: 'Cormorant Garamond, serif' }}>
              {quotaLoading ? '…' : apiCredits.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase text-slate-500">Plan Credits</p>
            <p className="text-xl font-black text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {quotaLoading ? '…' : planCredits.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase text-slate-500">Est. Renders Left</p>
            <p className="text-xl font-black text-slate-300" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {quotaLoading ? '…' : Math.floor(apiCredits / avgCostPerVideo)}
            </p>
          </div>
        </div>
        {isLow && !quotaLoading && (
          <div className="flex items-center gap-2 ml-auto px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">Low! Top up at heygen.com/settings/billing</p>
          </div>
        )}
      </div>

      {/* Pipeline shows */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">No shows yet. Run the morning broadcast to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map(show => (
              <ShowPipelineCard
                key={show.id}
                show={show}
                onEditScript={() => setEditingShow(show)}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['showPipelineBroadcasts'] })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Script Editor Modal */}
      {editingShow && (
        <ScriptEditorModal
          show={editingShow}
          onClose={() => setEditingShow(null)}
          onSaved={() => {
            setEditingShow(null);
            queryClient.invalidateQueries({ queryKey: ['showPipelineBroadcasts'] });
          }}
        />
      )}
    </div>
  );
}
