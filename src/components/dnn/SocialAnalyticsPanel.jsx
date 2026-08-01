import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import {
  Linkedin, Facebook, Instagram, Eye, Heart, MessageCircle, Share2,
  TrendingUp, TrendingDown, Minus, RefreshCw, BarChart3
} from 'lucide-react';

const GOLD = '#D4AF37';

export default function SocialAnalyticsPanel({ show, onRefresh }) {
  const [polling, setPolling] = useState(false);
  const [pollMsg, setPollMsg] = useState(null);

  const distribution = (show.distribution || []).filter(d => d.analytics || (d.status === 'sent' && d.post_id && (d.channel === 'linkedin' || d.channel === 'facebook')));

  const handlePoll = async () => {
    setPolling(true);
    setPollMsg(null);
    try {
      const res = await appClient.functions.invoke('pollSocialAnalytics', { broadcastId: show.id });
      const count = res.data?.polled?.length || 0;
      setPollMsg(count > 0 ? `Updated stats for ${count} channel(s)` : 'No new stats found');
      onRefresh();
    } catch (e) {
      setPollMsg(`Error: ${e.message}`);
    }
    setPolling(false);
  };

  if (distribution.length === 0) return null;

  const totalImpressions = distribution.reduce((s, d) => s + (d.analytics?.impressions || 0), 0);
  const totalLikes = distribution.reduce((s, d) => s + (d.analytics?.likes || 0), 0);
  const totalComments = distribution.reduce((s, d) => s + (d.analytics?.comments || 0), 0);
  const totalShares = distribution.reduce((s, d) => s + (d.analytics?.shares || 0), 0);

  const getTrend = (dist) => {
    const curr = dist.analytics?.impressions || 0;
    const prev = dist.analytics?.previous_impressions || 0;
    if (prev === 0) return 'new';
    if (curr > prev) return 'up';
    if (curr < prev) return 'down';
    return 'flat';
  };

  const channelMeta = {
    linkedin: { icon: Linkedin, color: '#0a66c2', label: 'LinkedIn' },
    facebook: { icon: Facebook, color: '#1877f2', label: 'Facebook' },
    instagram: { icon: Instagram, color: '#E1306C', label: 'Instagram' },
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Social Analytics</p>
        </div>
        <button onClick={handlePoll} disabled={polling}
          className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md text-black transition-opacity disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
          {polling ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
          {polling ? 'Polling…' : 'Poll Stats'}
        </button>
      </div>

      {/* Aggregate totals */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <StatPill icon={Eye} value={totalImpressions} label="Views" color="#60a5fa" />
        <StatPill icon={Heart} value={totalLikes} label="Likes" color="#f87171" />
        <StatPill icon={MessageCircle} value={totalComments} label="Comments" color="#4ade80" />
        <StatPill icon={Share2} value={totalShares} label="Shares" color="#fbbf24" />
      </div>

      {/* Per-channel breakdown */}
      <div className="space-y-2">
        {distribution.map((dist, i) => {
          const meta = channelMeta[dist.channel];
          if (!meta) return null;
          const Icon = meta.icon;
          const a = dist.analytics || {};
          const trend = getTrend(dist);
          const polledAt = a.polled_at ? new Date(a.polled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

          return (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}20` }}>
              <Icon className="w-4 h-4 shrink-0" style={{ color: meta.color }} />
              <span className="text-[10px] font-bold text-white w-16 shrink-0">{meta.label}</span>

              <div className="flex items-center gap-3 flex-1 text-[10px]">
                <span className="flex items-center gap-1 text-slate-300">
                  <Eye className="w-2.5 h-2.5" /> {(a.impressions || 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Heart className="w-2.5 h-2.5" /> {a.likes || 0}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MessageCircle className="w-2.5 h-2.5" /> {a.comments || 0}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Share2 className="w-2.5 h-2.5" /> {a.shares || 0}
                </span>
                {a.engagement_rate > 0 && (
                  <span className="text-[9px] text-slate-500">{a.engagement_rate}% eng.</span>
                )}
              </div>

              {/* Trend indicator */}
              {trend !== 'new' && (
                <span className="flex items-center gap-0.5 shrink-0">
                  {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                  {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  {trend === 'flat' && <Minus className="w-3 h-3 text-slate-500" />}
                </span>
              )}

              {polledAt && <span className="text-[8px] text-slate-600 shrink-0">{polledAt}</span>}
            </div>
          );
        })}
      </div>

      {pollMsg && (
        <p className="mt-2 text-[9px] text-slate-500">{pollMsg}</p>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, value, label, color }) {
  return (
    <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <Icon className="w-3 h-3 mx-auto mb-1" style={{ color }} />
      <p className="text-sm font-black text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{value.toLocaleString()}</p>
      <p className="text-[8px] text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}