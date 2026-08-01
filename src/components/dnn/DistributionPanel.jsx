import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { useQueryClient } from '@tanstack/react-query';
import {
  Linkedin, Facebook, Instagram, Mail, Users, CheckCircle, XCircle, Clock,
  RefreshCw, Send, DollarSign, ChevronRight
} from 'lucide-react';

const GOLD = '#D4AF37';
const DNN_STUDIO_IMAGE = "/assets/dnn-studio.png";

export default function DistributionPanel({ show, onRefresh, onAgentDistribute }) {
  const queryClient = useQueryClient();
  const [posting, setPosting] = useState(null);
  const [result, setResult] = useState(null);

  const distribution = show.distribution || [];

  const getDist = (channel) => distribution.find(d => d.channel === channel);

  const updateDistribution = async (newRecord) => {
    const existing = [...(show.distribution || [])];
    const idx = existing.findIndex(d => d.channel === newRecord.channel);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...newRecord };
    } else {
      existing.push(newRecord);
    }
    await appClient.entities.DnnBroadcast.update(show.id, { distribution: existing });
    onRefresh();
  };

  const handleLinkedIn = async () => {
    setPosting('linkedin');
    setResult(null);
    try {
      const res = await appClient.functions.invoke('postToLinkedInV2', {
        text: `📡 DNN Intelligence Bureau\n\n${show.headlines?.[0] || 'Daily Real Estate News Broadcast'}\n\nCharlie Simmons and Bob Dyson break down today's top relocation and real estate intelligence.\n\n🔔 Watch the full broadcast: https://1dnn.com/dnn-news?autoplay=1\nSubscribe for free: https://1dnn.com/subscribe`,
        videoUrl: show.videoUrl,
        imageUrl: DNN_STUDIO_IMAGE,
        title: show.headlines?.[0] || 'DNN Broadcast',
        description: "Charlie Simmons and Bob Dyson break down today's top relocation and real estate intelligence.",
        organizationName: 'DNN',
      });
      if (res.data?.success) {
        await updateDistribution({
          channel: 'linkedin',
          status: 'sent',
          recipient: res.data.posted_as || 'DNN LinkedIn Page',
          post_id: res.data.post_id || '',
          posted_at: new Date().toISOString(),
        });
        setResult({ success: true, msg: `Posted to ${res.data.posted_as}` });
      } else {
        await updateDistribution({ channel: 'linkedin', status: 'failed', error: res.data?.error || 'Unknown error' });
        setResult({ success: false, msg: res.data?.error || 'LinkedIn post failed' });
      }
    } catch (e) {
      setResult({ success: false, msg: e.message });
    }
    setPosting(null);
  };

  const handleFacebook = async () => {
    setPosting('facebook');
    setResult(null);
    try {
      const res = await appClient.functions.invoke('dnnSocialBlast', {});
      if (res.data?.facebook?.success || res.data?.success) {
        await updateDistribution({
          channel: 'facebook',
          status: 'sent',
          recipient: 'DNN Facebook Page',
          post_id: res.data?.facebook?.post_id || res.data?.post_id || '',
          posted_at: new Date().toISOString(),
        });
        setResult({ success: true, msg: 'Posted to Facebook' });
      } else {
        await updateDistribution({ channel: 'facebook', status: 'failed', error: res.data?.error || 'Facebook post failed' });
        setResult({ success: false, msg: res.data?.error || 'Facebook post failed' });
      }
    } catch (e) {
      setResult({ success: false, msg: e.message });
    }
    setPosting(null);
  };

  const handleEmailBlast = async () => {
    setPosting('email');
    setResult(null);
    try {
      const res = await appClient.functions.invoke('dnnMorningEmailBlast', {});
      await updateDistribution({
        channel: 'subscriber_email',
        status: 'sent',
        recipient: 'All Subscribers',
        posted_at: new Date().toISOString(),
        recipient_count: res.data?.sent || res.data?.total_sent || 0,
      });
      setResult({ success: true, msg: `Email sent to ${res.data?.sent || res.data?.total_sent || '?'} subscribers` });
    } catch (e) {
      setResult({ success: false, msg: e.message });
    }
    setPosting(null);
  };

  const channels = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: '#0a66c2',
      bgColor: 'rgba(10,102,194,0.1)',
      dist: getDist('linkedin'),
      action: handleLinkedIn,
      busy: posting === 'linkedin',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: '#1877f2',
      bgColor: 'rgba(24,119,242,0.1)',
      dist: getDist('facebook'),
      action: handleFacebook,
      busy: posting === 'facebook',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      color: '#E1306C',
      bgColor: 'rgba(225,48,108,0.1)',
      dist: getDist('instagram'),
      action: () => setResult({ success: false, msg: 'Instagram not connected — connect the Instagram Business connector to enable posting' }),
      busy: posting === 'instagram',
    },
    {
      key: 'subscriber_email',
      label: 'Subscriber Email',
      icon: Mail,
      color: GOLD,
      bgColor: 'rgba(212,175,55,0.1)',
      dist: getDist('subscriber_email'),
      action: handleEmailBlast,
      busy: posting === 'email',
    },
    {
      key: 'agent_private_label',
      label: 'Agent Private-Label',
      icon: Users,
      color: '#A78BFA',
      bgColor: 'rgba(167,139,250,0.1)',
      dist: null, // handled separately
      action: onAgentDistribute,
      busy: false,
      isAgent: true,
    },
  ];

  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Distribution & Posting Progress:</p>
      <div className="grid grid-cols-2 gap-2">
        {channels.map(ch => {
          const Icon = ch.icon;
          const isSent = ch.dist?.status === 'sent';
          const isFailed = ch.dist?.status === 'failed';
          return (
            <div key={ch.key} className="rounded-lg p-3" style={{ background: ch.bgColor, border: `1px solid ${ch.color}30` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: ch.color }} />
                  <span className="text-xs font-bold text-white">{ch.label}</span>
                </div>
                {isSent && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                {isFailed && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                {!isSent && !isFailed && ch.dist && <Clock className="w-3.5 h-3.5 text-yellow-400" />}
              </div>
              {ch.isAgent ? (
                <button onClick={ch.action}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold text-white transition-all"
                  style={{ background: ch.color }}>
                  <Users className="w-3 h-3" /> Select Agents
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <button onClick={ch.action} disabled={ch.busy || isSent}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold text-black transition-all disabled:opacity-50"
                  style={{ background: ch.busy ? '#666' : isSent ? 'rgba(74,222,128,0.2)' : GOLD }}>
                  {ch.busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : isSent ? <CheckCircle className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  {ch.busy ? 'Posting…' : isSent ? 'Posted' : `Post Now`}
                </button>
              )}
              {isSent && ch.dist?.posted_at && (
                <p className="text-[9px] text-slate-500 mt-1.5">
                  {ch.dist.recipient_count ? `${ch.dist.recipient_count} recipients · ` : ''}
                  {new Date(ch.dist.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
              {isFailed && ch.dist?.error && (
                <p className="text-[9px] text-red-400 mt-1.5 truncate">{ch.dist.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent distributions summary */}
      {distribution.filter(d => d.channel === 'agent_private_label').length > 0 && (
        <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#A78BFA' }}>Agent Private-Label Delivery</p>
            <span className="text-[10px] font-bold text-purple-300">
              {distribution.filter(d => d.channel === 'agent_private_label').length} agents
            </span>
          </div>
          <div className="space-y-1.5">
            {distribution.filter(d => d.channel === 'agent_private_label').map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  {d.status === 'sent' ? <CheckCircle className="w-3 h-3 text-green-400" /> :
                   d.status === 'failed' ? <XCircle className="w-3 h-3 text-red-400" /> :
                   <Clock className="w-3 h-3 text-yellow-400" />}
                  <span className="text-white">{d.recipient || 'Agent'}</span>
                </div>
                <div className="flex items-center gap-3">
                  {d.fee > 0 && <span className="text-green-400 font-bold"><DollarSign className="w-2.5 h-2.5 inline" />{d.fee}</span>}
                  <span className="text-slate-500">{d.recipient_count || 0} contacts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result message */}
      {result && (
        <div className="mt-3 rounded-lg p-2.5" style={{
          background: result.success ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${result.success ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          <p className="text-[10px]" style={{ color: result.success ? '#4ade80' : '#ef4444' }}>
            {result.success ? '✓ ' : '✗ '}{result.msg}
          </p>
        </div>
      )}
    </div>
  );
}