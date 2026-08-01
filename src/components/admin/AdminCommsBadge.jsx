import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { MessageCircle, ArrowRight } from 'lucide-react';

const GOLD = '#D4AF37';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function AdminCommsBadge() {
  const queryClient = useQueryClient();

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['admin-comms-badge-chat'],
    queryFn: () => appClient.entities.ChatMessage.list('-created_date', 50),
    refetchInterval: 10000,
  });

  const { data: comms = [] } = useQuery({
    queryKey: ['admin-comms-badge-comm'],
    queryFn: () => appClient.entities.Communication.list('-sent_date', 50),
    refetchInterval: 10000,
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = appClient.entities.ChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data?.role === 'user') {
        queryClient.invalidateQueries({ queryKey: ['admin-comms-badge-chat'] });
      }
    });
    return unsub;
  }, []);

  // Inbound client messages (role=user only)
  const inboundChats = chatMessages.filter(m => m.role === 'user');

  // Inbound SMS/comms (where no outbound reply exists after it)
  const inboundComms = comms.filter(m => m.status === 'sent' || !m.status);

  // Combine and get most recent 3 inbound
  const allInbound = [
    ...inboundChats.map(m => ({ id: m.id, name: 'Client', preview: m.content, date: m.created_date, type: 'chat' })),
    ...inboundComms.slice(0, 10).map(m => ({ id: m.id, name: m.recipient_name || 'Owner', preview: m.message_content, date: m.sent_date, type: m.communication_type })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  const urgentCount = inboundChats.length;
  const totalCount = allInbound.length;

  return (
    <div className="mx-3 mb-1 rounded-xl overflow-hidden" style={{ border: urgentCount > 0 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(212,175,55,0.25)', background: urgentCount > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(212,175,55,0.05)' }}>
      {/* Header */}
      <Link to="/admin/communications" className="flex items-center justify-between px-3 py-2.5 group">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageCircle className="w-4 h-4" style={{ color: urgentCount > 0 ? '#ef4444' : GOLD }} />
            {urgentCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black animate-pulse"
                style={{ background: '#ef4444', color: '#fff' }}>
                {urgentCount > 9 ? '9+' : urgentCount}
              </span>
            )}
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider block" style={{ color: GOLD }}>
              COMMUNICATIONS HUB
            </span>
            {urgentCount > 0 && (
              <span className="text-[9px] font-semibold" style={{ color: '#ef4444' }}>
                {urgentCount} unread client message{urgentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" style={{ color: GOLD }} />
      </Link>

      {/* Recent messages preview */}
      {allInbound.length > 0 ? (
        <div className="px-3 space-y-1.5">
          {allInbound.map(msg => (
            <Link key={msg.id} to="/admin/communications"
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors block">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ background: msg.type === 'chat' ? '#ef4444' : msg.type === 'sms' ? '#22c55e' : '#60a5fa' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold truncate" style={{ color: '#fff' }}>{msg.name}</span>
                  <span className="text-[9px] shrink-0" style={{ color: '#fff' }}>{timeAgo(msg.date)}</span>
                </div>
                <p className="text-[10px] truncate mt-0.5" style={{ color: '#fff' }}>{msg.preview}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="px-3 text-[10px]" style={{ color: '#fff' }}>No pending messages</p>
      )}

      {/* View All footer */}
      <Link to="/admin/communications"
        className="flex items-center justify-center gap-1 mx-3 mb-2.5 mt-2 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-colors hover:bg-white/5"
        style={{ border: '1px solid rgba(255,255,255,0.08)', color: urgentCount > 0 ? '#ef4444' : GOLD }}>
        VIEW ALL COMMUNICATIONS →
      </Link>
    </div>
  );
}