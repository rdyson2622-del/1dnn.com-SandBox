import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Shield, TrendingUp, Users, DollarSign, Bell, CheckCircle, Clock, XCircle, Mail, BarChart3, Zap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const GOLD = '#D4AF37';

const TIER_CONFIG = {
  bronze: { label: 'Bronze', price: 497, color: '#cd7f32', desc: 'Single market listing' },
  silver: { label: 'Silver', price: 997, color: '#94a3b8', desc: 'Featured placement + badge' },
  gold:   { label: 'Gold',   price: 1997, color: '#D4AF37', desc: 'Exclusive market territory' },
};

const STATUS_CONFIG = {
  prospect:  { label: 'Prospect',  color: '#94a3b8', icon: Clock },
  active:    { label: 'Active',    color: '#4ade80', icon: CheckCircle },
  paused:    { label: 'Paused',    color: '#fbbf24', icon: Clock },
  churned:   { label: 'Churned',   color: '#f87171', icon: XCircle },
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black text-white mb-0.5">{value}</p>
      <p className="text-xs font-bold text-white">{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
    </div>
  );
}

function AgentRow({ agent, onStatusChange, onNotify }) {
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.prospect;
  const StatusIcon = status.icon;
  const tier = agent.featured_tier || 'bronze';
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.bronze;

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{agent.agent_name}</p>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.markets?.join(', ') || '—'}</p>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: `${tierCfg.color}18`, color: tierCfg.color, border: `1px solid ${tierCfg.color}30` }}>
        {tierCfg.label}
      </div>
      <div className="text-xs font-bold" style={{ color: GOLD }}>${(tierCfg.price).toLocaleString()}/mo</div>
      <div className="flex items-center gap-1 text-xs font-bold" style={{ color: status.color }}>
        <StatusIcon className="w-3 h-3" /> {status.label}
      </div>
      <select
        value={agent.status || 'prospect'}
        onChange={e => onStatusChange(agent.id, e.target.value)}
        className="text-xs px-2 py-1 rounded-lg focus:outline-none"
        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
      >
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
      <button
        onClick={() => onNotify(agent)}
        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
        style={{ background: 'rgba(212,175,55,0.12)', color: GOLD, border: '1px solid rgba(212,175,55,0.2)' }}
      >
        <Mail className="w-3 h-3" /> Notify
      </button>
    </div>
  );
}

export default function AdminDnnRevenue() {
  const [sending, setSending] = useState(null);

  const { data: agents = [], refetch } = useQuery({
    queryKey: ['partnerAgents'],
    queryFn: () => appClient.entities.PartnerAgent.list('-created_date', 200),
  });

  const featuredAgents = agents.filter(a => a.status === 'active');
  const prospectAgents = agents.filter(a => a.status === 'prospect');

  // Revenue projection
  const monthlyRevenue = agents.reduce((sum, a) => {
    if (a.status !== 'active') return sum;
    const tier = a.featured_tier || 'bronze';
    return sum + (TIER_CONFIG[tier]?.price || 497);
  }, 0);

  const projectedAnnual = monthlyRevenue * 12;

  // If all prospects converted at bronze
  const potentialRevenue = monthlyRevenue + (prospectAgents.length * 497);

  const handleStatusChange = async (agentId, newStatus) => {
    await appClient.entities.PartnerAgent.update(agentId, { status: newStatus });
    refetch();
    toast({ title: 'Status updated', description: `Agent status changed to ${newStatus}` });
  };

  const handleNotify = async (agent) => {
    setSending(agent.id);
    try {
      await appClient.integrations.Core.SendEmail({
        to: agent.email,
        subject: `DNN Featured Agent Program — ${agent.agent_name}`,
        body: `Hi ${agent.agent_name},\n\nWe wanted to follow up regarding your DNN Featured Agent placement in ${agent.markets?.join(', ') || 'your market'}.\n\nAs a DNN Bureau partner, you receive:\n• Featured placement in daily DNN Intelligence Briefs\n• Co-branded "Brought to you by DNN" positioning\n• Exclusive market territory access\n• Direct referral routing from our audience\n\nLet's connect to finalize your placement.\n\nBest,\nThe DNN Intelligence Bureau\nDyson & Dyson Real Estate Concierge\n(858) 353-1200`
      });
      toast({ title: `Email sent to ${agent.agent_name}`, description: agent.email });
    } catch {
      toast({ title: 'Email failed', variant: 'destructive' });
    }
    setSending(null);
  };

  const handleNotifyAll = async () => {
    setSending('all');
    let count = 0;
    for (const agent of prospectAgents) {
      if (!agent.email) continue;
      try {
        await appClient.integrations.Core.SendEmail({
          to: agent.email,
          subject: `DNN Featured Agent Program — Invitation for ${agent.agent_name}`,
          body: `Hi ${agent.agent_name},\n\nYou're invited to become a DNN Featured Bureau Agent in ${agent.markets?.join(', ') || 'your market'}.\n\nDNN is building the leading relocation intelligence broadcast network. Featured agents receive:\n• Placement in daily market briefs delivered to relocating buyers\n• Exclusive territory in your market\n• Co-branded DNN authority positioning\n• Direct referral leads from our audience\n\nTiers start at $497/mo. Reply to learn more.\n\nBest,\nThe DNN Intelligence Bureau\n(858) 353-1200`
        });
        count++;
      } catch {}
    }
    toast({ title: `Notified ${count} prospects`, description: 'Emails sent to all prospect agents' });
    setSending(null);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#080808' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>DNN Intelligence Bureau</p>
          </div>
          <h1 className="text-2xl font-black text-white">Featured Agent Revenue Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Track signups, revenue projections, and agent status across all DNN markets.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Active Featured Agents" value={featuredAgents.length} sub="Paying placements" color="#4ade80" />
          <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} sub="Current MRR" color={GOLD} />
          <StatCard icon={BarChart3} label="Annual Run Rate" value={`$${projectedAnnual.toLocaleString()}`} sub="If retention holds" color="#818cf8" />
          <StatCard icon={Zap} label="Pipeline Potential" value={`$${potentialRevenue.toLocaleString()}`} sub={`+${prospectAgents.length} prospects at bronze`} color="#60a5fa" />
        </div>

        {/* Tier Reference */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {Object.entries(TIER_CONFIG).map(([key, tier]) => (
            <div key={key} className="rounded-xl p-4 text-center" style={{ background: '#111', border: `1px solid ${tier.color}30` }}>
              <p className="text-sm font-black mb-1" style={{ color: tier.color }}>{tier.label}</p>
              <p className="text-xl font-black text-white">${tier.price.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span></p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{tier.desc}</p>
            </div>
          ))}
        </div>

        {/* Agent Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: GOLD }} />
              <p className="text-sm font-black tracking-[0.15em] uppercase text-white">All Partner Agents</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(212,175,55,0.12)', color: GOLD }}>{agents.length}</span>
            </div>
            {prospectAgents.length > 0 && (
              <button
                onClick={handleNotifyAll}
                disabled={sending === 'all'}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'rgba(212,175,55,0.15)', color: GOLD, border: '1px solid rgba(212,175,55,0.3)' }}
              >
                <Bell className="w-3.5 h-3.5" />
                {sending === 'all' ? 'Sending...' : `Notify All ${prospectAgents.length} Prospects`}
              </button>
            )}
          </div>

          {agents.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(212,175,55,0.3)' }} />
              <p className="text-white font-bold mb-1">No agents yet</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Add agents via the Agent Bureau section to track revenue here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map(agent => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  onStatusChange={handleStatusChange}
                  onNotify={handleNotify}
                />
              ))}
            </div>
          )}
        </div>

        {/* Revenue Projection Note */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: GOLD }}>Revenue Model Notes</p>
          <ul className="space-y-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <li>• Featured agents pay monthly for exclusive territory placement in DNN daily briefs</li>
            <li>• Revenue is independent of relocation referral fees — pure broadcast advertising</li>
            <li>• Projections assume current tier mix; upgrades to Gold significantly increase MRR</li>
            <li>• At 50 active agents (avg Silver): ~$49,850/mo · $598,200 ARR</li>
            <li>• At 100 active agents (avg Silver): ~$99,700/mo · $1.2M ARR</li>
          </ul>
        </div>

      </div>
    </div>
  );
}