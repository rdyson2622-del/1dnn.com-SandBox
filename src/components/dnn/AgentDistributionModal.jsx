import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { X, Users, DollarSign, CheckCircle, XCircle, Send, RefreshCw } from 'lucide-react';

const GOLD = '#D4AF37';
const DEFAULT_FEE = 50;

export default function AgentDistributionModal({ show, onClose, onRefresh }) {
  const [selectedAgents, setSelectedAgents] = useState({});
  const [fees, setFees] = useState({});
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);

  // Fetch all partner agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['partnerAgentsForDist'],
    queryFn: () => appClient.entities.PartnerAgent.list('-created_date', 200),
  });

  // Fetch existing agent distributions for this show
  const { data: existingDists = [] } = useQuery({
    queryKey: ['agentShowDists', show.id],
    queryFn: () => appClient.entities.AgentShowDistribution.filter({ broadcast_id: show.id }),
  });

  useEffect(() => {
    // Pre-select agents that already have distributions
    const existing = {};
    existingDists.forEach(d => {
      existing[d.agent_id] = true;
      setFees(prev => ({ ...prev, [d.agent_id]: d.fee || DEFAULT_FEE }));
    });
    setSelectedAgents(existing);
  }, [existingDists]);

  const toggleAgent = (agentId) => {
    setSelectedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
    if (!fees[agentId]) {
      setFees(prev => ({ ...prev, [agentId]: DEFAULT_FEE }));
    }
  };

  const handleFeeChange = (agentId, value) => {
    setFees(prev => ({ ...prev, [agentId]: parseFloat(value) || 0 }));
  };

  const getExistingDist = (agentId) => existingDists.find(d => d.agent_id === agentId);

  const handleSend = async () => {
    setSending(true);
    setResults([]);
    const agentIds = Object.keys(selectedAgents).filter(id => selectedAgents[id]);
    const newResults = [];

    for (const agentId of agentIds) {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) continue;
      const fee = fees[agentId] || DEFAULT_FEE;
      const existing = getExistingDist(agentId);

      try {
        if (existing) {
          // Update existing distribution
          await appClient.entities.AgentShowDistribution.update(existing.id, {
            fee,
            fee_paid: existing.fee_paid,
            status: existing.status === 'delivered' ? 'delivered' : 'pending',
          });
          newResults.push({ agent_name: agent.agent_name || agent.name, success: true, action: 'updated' });
        } else {
          // Create new distribution record
          await appClient.entities.AgentShowDistribution.create({
            broadcast_id: show.id,
            broadcast_date: show.broadcast_date,
            show_name: show.show_name || `Show ${show.show_number}`,
            agent_id: agentId,
            agent_name: agent.agent_name || agent.name,
            agent_email: agent.email || '',
            fee,
            fee_paid: false,
            status: 'pending',
            video_url: show.videoUrl || '',
            private_label_name: agent.agent_name || agent.name || '',
          });
          newResults.push({ agent_name: agent.agent_name || agent.name, success: true, action: 'created' });
        }
      } catch (e) {
        newResults.push({ agent_name: agent.agent_name || agent.name, success: false, error: e.message });
      }
    }

    // Also update the DnnBroadcast.distribution array
    const distRecords = agentIds.map(agentId => {
      const agent = agents.find(a => a.id === agentId);
      const existing = getExistingDist(agentId);
      return {
        channel: 'agent_private_label',
        status: existing?.status === 'delivered' ? 'sent' : 'pending',
        recipient: agent?.agent_name || agent?.name || 'Agent',
        agent_id: agentId,
        fee: fees[agentId] || DEFAULT_FEE,
        recipient_count: existing?.recipient_count || 0,
        posted_at: existing?.delivered_at || '',
      };
    });

    // Merge with existing non-agent distributions
    const nonAgentDists = (show.distribution || []).filter(d => d.channel !== 'agent_private_label');
    await appClient.entities.DnnBroadcast.update(show.id, {
      distribution: [...nonAgentDists, ...distRecords],
    });

    setResults(newResults);
    setSending(false);
    onRefresh();
  };

  const selectedCount = Object.values(selectedAgents).filter(Boolean).length;
  const totalFees = Object.keys(selectedAgents)
    .filter(id => selectedAgents[id])
    .reduce((sum, id) => sum + (fees[id] || DEFAULT_FEE), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-sm font-black text-white">{show.show_name || 'Show'} — Agent Private-Label Distribution</p>
            <p className="text-[10px] text-slate-500">Select affiliated agents to receive this show for their client & contact lists</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="px-5 py-3 flex items-center gap-4 shrink-0" style={{ background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: GOLD }} />
            <span className="text-xs font-bold text-white">{selectedCount} agents selected</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400">${totalFees.toLocaleString()} total fees</span>
          </div>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${GOLD}30`, borderTopColor: GOLD }} />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-10">No affiliated agents found. Add agents in the Partner Agent Roster.</p>
          ) : (
            <div className="space-y-2">
              {agents.map(agent => {
                const isSelected = selectedAgents[agent.id];
                const existing = getExistingDist(agent.id);
                return (
                  <div key={agent.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: isSelected ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                    onClick={() => toggleAgent(agent.id)}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: isSelected ? GOLD : 'transparent', border: `1.5px solid ${isSelected ? GOLD : '#444'}` }}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{agent.agent_name || agent.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{agent.email || agent.city || ''}</p>
                    </div>
                    {existing && (
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          background: existing.status === 'delivered' ? 'rgba(74,222,128,0.15)' : existing.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
                          color: existing.status === 'delivered' ? '#4ade80' : existing.status === 'failed' ? '#ef4444' : '#fbbf24',
                        }}>
                        {existing.status}
                      </span>
                    )}
                    {isSelected && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-400" />
                          <input
                            type="number"
                            value={fees[agent.id] ?? DEFAULT_FEE}
                            onChange={(e) => handleFeeChange(agent.id, e.target.value)}
                            className="w-16 px-2 py-1 rounded text-[10px] text-white"
                            style={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.2)', outline: 'none' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="px-5 py-3 max-h-32 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] py-1">
                {r.success ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                <span className="text-white">{r.agent_name}</span>
                <span className="text-slate-500">— {r.success ? r.action : r.error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: '#333', border: '1px solid rgba(255,255,255,0.1)' }}>
            Close
          </button>
          <button onClick={handleSend} disabled={sending || selectedCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all disabled:opacity-50"
            style={{ background: sending ? '#666' : 'linear-gradient(135deg, #e8c84a, #D4AF37)' }}>
            {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending ? 'Distributing…' : `Distribute to ${selectedCount} Agent${selectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}