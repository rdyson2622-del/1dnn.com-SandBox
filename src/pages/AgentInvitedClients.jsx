import React, { useEffect, useState, useRef } from 'react';
import { appClient } from '@/api/appClient';
import { X, Bell, BellOff, Send, CheckCircle, ChevronRight } from 'lucide-react';

const GOLD = '#D4AF37';
const TAN = '#ede0cc';

const PHASE_LABELS = {
  new_lead:           { label: 'Phase 1 — New Lead',           color: '#6b7280', number: 1 },
  in_consultation:    { label: 'Phase 2 — In Consultation',    color: '#3b82f6', number: 2 },
  actively_searching: { label: 'Phase 3 — Actively Searching', color: '#8b5cf6', number: 3 },
  under_contract:     { label: 'Phase 4 — Under Contract',     color: '#f59e0b', number: 4 },
  moved:              { label: 'Phase 5 — Moved',              color: '#10b981', number: 5 },
  closed:             { label: 'Phase 6 — Closed',             color: '#059669', number: 6 },
  inactive:           { label: 'Inactive',                     color: '#9ca3af', number: 0 },
};

function PhaseTag({ status }) {
  const p = PHASE_LABELS[status] || { label: status, color: '#9ca3af' };
  return (
    <span className="text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}55` }}>
      {p.label}
    </span>
  );
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Activity Thread Panel ──────────────────────────────────────────
function ActivityPanel({ client, agentEmail, isAdmin, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [followed, setFollowed] = useState(false);
  const bottomRef = useRef(null);

  const fetchLogs = () => {
    appClient.entities.AgentActivityLog.filter({ client_id: client.id }, 'created_date', 100)
      .then(data => {
        setLogs(data);
        setLoading(false);
        // Check follow status from any log for this agent
        const followLog = data.find(l => l.agent_email === agentEmail);
        if (followLog) setFollowed(followLog.agent_followed ?? false);
      });
  };

  useEffect(() => {
    fetchLogs();
    const unsub = appClient.entities.AgentActivityLog.subscribe(ev => {
      if (ev.data?.client_id === client.id) fetchLogs();
    });
    return unsub;
  }, [client.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const postUpdate = async () => {
    if (!message.trim()) return;
    setPosting(true);
    await appClient.entities.AgentActivityLog.create({
      client_id: client.id,
      agent_email: client.assigned_agent || agentEmail,
      phase: client.status || 'general',
      message: message.trim(),
      posted_by: agentEmail,
      posted_by_label: isAdmin ? 'Dyson Team' : 'Agent',
      is_milestone: false,
      agent_followed: followed,
    });
    setMessage('');
    setPosting(false);
  };

  const toggleFollow = async () => {
    const next = !followed;
    setFollowed(next);
    // Update all logs for this agent+client to sync the follow flag
    // Just post a system note
    await appClient.entities.AgentActivityLog.create({
      client_id: client.id,
      agent_email: client.assigned_agent || agentEmail,
      phase: 'general',
      message: next
        ? '🔔 Agent enabled "Follow Client Move" — notifications active.'
        : '🔕 Agent disabled "Follow Client Move".',
      posted_by: agentEmail,
      posted_by_label: 'System',
      is_milestone: false,
      agent_followed: next,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="h-full w-full max-w-lg flex flex-col shadow-2xl"
        style={{ background: '#fff8ee', borderLeft: `2px solid ${GOLD}` }}
        onClick={e => e.stopPropagation()}>

        {/* Panel header */}
        <div className="px-5 py-4 flex items-start justify-between shrink-0"
          style={{ borderBottom: '1px solid rgba(212,175,55,0.25)', background: '#0d0d0d' }}>
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: GOLD }}>ACTIVITY THREAD</p>
            <p className="font-black text-lg text-white leading-tight">{client.full_name}</p>
            {client.current_city && client.destination_city && (
              <p className="text-xs text-gray-400 mt-0.5">{client.current_city} → {client.destination_city}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* Follow Toggle */}
            <button onClick={toggleFollow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: followed ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${followed ? GOLD : 'rgba(255,255,255,0.15)'}`,
                color: followed ? GOLD : '#9ca3af',
              }}>
              {followed ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
              {followed ? 'Following' : 'Follow Move'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Phase progress bar */}
        <div className="px-5 py-3 shrink-0 flex items-center gap-1.5" style={{ background: '#111', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          {[1,2,3,4,5,6].map(n => {
            const currentNum = PHASE_LABELS[client.status]?.number || 1;
            const done = n <= currentNum;
            return (
              <div key={n} className="flex-1 h-1.5 rounded-full transition-all"
                style={{ background: done ? GOLD : 'rgba(255,255,255,0.1)' }} />
            );
          })}
          <span className="text-[10px] font-black ml-2 whitespace-nowrap" style={{ color: GOLD }}>
            {PHASE_LABELS[client.status]?.label || 'Unknown Phase'}
          </span>
        </div>

        {/* Log feed */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: '#9b8a70' }}>
              No activity yet. Dyson team updates will appear here.
            </div>
          ) : (
            logs.map(log => {
              const isDyson = log.posted_by_label === 'Dyson Team';
              const isSystem = log.posted_by_label === 'System';
              return (
                <div key={log.id} className={`flex gap-3 ${isDyson ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-black"
                    style={{
                      background: isSystem ? 'rgba(255,255,255,0.08)' : isDyson ? GOLD : 'rgba(212,175,55,0.2)',
                      color: isDyson ? '#000' : GOLD,
                    }}>
                    {isSystem ? '⚙' : isDyson ? 'D' : 'A'}
                  </div>
                  <div className={`max-w-[80%] ${isDyson ? '' : 'items-end flex flex-col'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black" style={{ color: isSystem ? '#9ca3af' : isDyson ? GOLD : '#fff' }}>
                        {log.posted_by_label || log.posted_by}
                      </span>
                      <span className="text-[9px]" style={{ color: '#9b8a70' }}>{timeAgo(log.created_date)}</span>
                      {log.is_milestone && (
                        <CheckCircle className="w-3 h-3" style={{ color: '#10b981' }} />
                      )}
                    </div>
                    <div className="px-3 py-2 rounded-xl text-xs leading-relaxed"
                      style={{
                        background: isSystem
                          ? 'rgba(255,255,255,0.05)'
                          : isDyson
                          ? 'rgba(212,175,55,0.12)'
                          : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${isSystem ? 'rgba(255,255,255,0.08)' : 'rgba(212,175,55,0.2)'}`,
                        color: '#2a1f0e',
                        fontStyle: isSystem ? 'italic' : 'normal',
                      }}>
                      {log.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose bar — admin can always post; agent can post too */}
        <div className="px-4 py-3 shrink-0 flex gap-2" style={{ borderTop: '1px solid rgba(212,175,55,0.2)', background: '#fff8ee' }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && postUpdate()}
            placeholder={isAdmin ? "Post a Dyson Team update…" : "Add a note to this thread…"}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#ede0cc', border: `1px solid rgba(212,175,55,0.3)`, color: '#1a1a1a' }}
          />
          <button onClick={postUpdate} disabled={posting || !message.trim()}
            className="px-3 py-2 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: GOLD, color: '#000' }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Client Card ────────────────────────────────────────────────────
function ClientCard({ client, agentEmail, isAdmin, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl px-5 py-4 transition-all hover:shadow-md hover:scale-[1.005]"
      style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-black text-base truncate" style={{ color: '#1a1a1a' }}>{client.full_name}</p>
          {client.current_city && client.destination_city && (
            <p className="text-xs mt-0.5" style={{ color: '#6b5c45' }}>
              {client.current_city} → {client.destination_city}
            </p>
          )}
          {client.email && (
            <p className="text-xs mt-0.5" style={{ color: '#9b8a70' }}>{client.email}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <PhaseTag status={client.status} />
          {client.buyer_broker_signed && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)' }}>
              ✓ Broker Signed
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5" style={{ color: GOLD }} />
        </div>
      </div>

      {/* Status pills row */}
      <div className="mt-3 pt-3 flex items-center gap-3 flex-wrap" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: client.agent_name ? GOLD : '#4b5563' }} />
          <span className="text-[10px] font-semibold" style={{ color: client.agent_name ? GOLD : '#9ca3af' }}>
            {client.agent_name ? `Agent: ${client.agent_name}` : 'Agent: Pending'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: client.budget ? '#10b981' : '#4b5563' }} />
          <span className="text-[10px] font-semibold" style={{ color: client.budget ? '#10b981' : '#9ca3af' }}>
            {client.budget ? `Budget: ${client.budget.replace(/_/g, ' ')}` : 'Financing: Not Set'}
          </span>
        </div>
        {client.target_close_of_escrow && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#f59e0b' }}>
              Close: {new Date(client.target_close_of_escrow).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AgentInvitedClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentEmail, setAgentEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    appClient.auth.me().then(user => {
      if (!user?.email) return;
      setAgentEmail(user.email);
      const admin = user.role === 'admin';
      setIsAdmin(admin);

      // Admins see ALL clients; agents see only their assigned clients
      const fetchPromise = admin
        ? appClient.entities.RelocationClient.list('-created_date', 100)
        : appClient.entities.RelocationClient.filter({ assigned_agent: user.email }, '-created_date', 50);

      fetchPromise.then(data => { setClients(data); setLoading(false); });
    });
  }, []);

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: TAN }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.3em] mb-1" style={{ color: GOLD }}>PRN AGENT PORTAL</p>
          <h1 className="font-black text-3xl mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a1a' }}>
            {isAdmin ? 'All Client Activity Threads' : 'My Invited Clients'}
          </h1>
          <p className="text-sm" style={{ color: '#6b5c45' }}>
            {isAdmin
              ? 'Post milestones and updates. Agents see your updates instantly — no CC needed.'
              : 'Click any client to open their Activity Thread and see real-time Dyson team updates.'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: '#fff8ee', border: '1px solid rgba(212,175,55,0.3)' }}>
            <p className="text-4xl mb-3">🤝</p>
            <p className="font-bold text-lg mb-2" style={{ color: '#1a1a1a' }}>No invited clients yet.</p>
            <p className="text-sm" style={{ color: '#6b5c45' }}>
              Clients assigned to your email will appear here:<br />
              <span className="font-black" style={{ color: GOLD }}>{agentEmail}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                agentEmail={agentEmail}
                isAdmin={isAdmin}
                onClick={() => setSelectedClient(client)}
              />
            ))}
          </div>
        )}

        <div className="h-12" />
      </div>

      {/* Activity Thread Slide-in Panel */}
      {selectedClient && (
        <ActivityPanel
          client={selectedClient}
          agentEmail={agentEmail}
          isAdmin={isAdmin}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}