import React from 'react';
import { Linkedin, Facebook, Instagram, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const CHANNELS = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0a66c2' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877f2' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
  { key: 'agent_private_label', label: 'Agents', icon: Users, color: '#A78BFA' },
];

export default function DistributionTracker({ show }) {
  const distribution = show.distribution || [];

  const getChannelStatus = (channelKey) => {
    const records = distribution.filter(d => d.channel === channelKey);
    if (records.length === 0) return 'not_sent';
    if (records.some(d => d.status === 'sent')) return 'sent';
    if (records.some(d => d.status === 'failed')) return 'failed';
    return 'pending';
  };

  const getAgentCount = () => {
    const agentDists = distribution.filter(d => d.channel === 'agent_private_label');
    return agentDists.length;
  };

  const agentCount = getAgentCount();

  return (
    <div className="flex items-center gap-1.5">
      {CHANNELS.map(ch => {
        const Icon = ch.icon;
        const status = ch.key === 'agent_private_label'
          ? (agentCount > 0 ? 'sent' : 'not_sent')
          : getChannelStatus(ch.key);

        const isSent = status === 'sent';
        const isFailed = status === 'failed';
        const isPending = status === 'pending';

        return (
          <div key={ch.key} className="flex items-center gap-1 px-2 py-1 rounded-md"
            style={{
              background: isSent ? 'rgba(74,222,128,0.08)' : isFailed ? 'rgba(239,68,68,0.08)' : isPending ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isSent ? 'rgba(74,222,128,0.2)' : isFailed ? 'rgba(239,68,68,0.2)' : isPending ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}
            title={`${ch.label}: ${isSent ? 'Posted' : isFailed ? 'Failed' : isPending ? 'Pending' : 'Not posted'}`}>
            <Icon className="w-3 h-3" style={{ color: isSent ? '#4ade80' : isFailed ? '#ef4444' : isPending ? '#fbbf24' : ch.color }} />
            {ch.key === 'agent_private_label' && isSent && (
              <span className="text-[9px] font-bold text-purple-300">{agentCount}</span>
            )}
            {isSent && ch.key !== 'agent_private_label' && <CheckCircle className="w-2.5 h-2.5 text-green-400" />}
            {isFailed && <XCircle className="w-2.5 h-2.5 text-red-400" />}
            {isPending && <Clock className="w-2.5 h-2.5 text-yellow-400" />}
          </div>
        );
      })}
    </div>
  );
}