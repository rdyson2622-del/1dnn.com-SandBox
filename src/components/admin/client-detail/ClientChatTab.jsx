import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Flag, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GOLD = '#D4AF37';

const flagColors = {
  none: '',
  reviewed: 'bg-blue-100 text-blue-700',
  concern: 'bg-amber-100 text-amber-700',
  fraud: 'bg-red-100 text-red-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

export default function ClientChatTab({ client }) {
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['client-chat', client.id],
    queryFn: () => appClient.entities.ChatMessage.filter({ client_id: client.id }, 'created_date', 500),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-4 border-slate-200 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border p-10 text-center" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(0,0,0,0.2)' }} />
        <p className="font-medium" style={{ color: 'rgba(0,0,0,0.4)' }}>No chat history yet</p>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.3)' }}>Messages between {client.full_name} and Charlie will appear here.</p>
      </div>
    );
  }

  const flagged = messages.filter(m => m.flag_status && m.flag_status !== 'none');

  return (
    <div className="space-y-4">
      {flagged.length > 0 && (
        <div className="rounded-2xl border p-4" style={{ background: '#fff8f0', borderColor: '#f59e0b44' }}>
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700">{flagged.length} flagged message{flagged.length > 1 ? 's' : ''}</span>
          </div>
          {flagged.map(m => (
            <div key={m.id} className="text-xs p-2 rounded-lg mb-1" style={{ background: 'rgba(245,158,11,0.08)' }}>
              <Badge className={`${flagColors[m.flag_status]} border-0 text-xs mr-2`}>{m.flag_status}</Badge>
              <span style={{ color: '#7a5000' }}>{m.content?.slice(0, 120)}…</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)', background: '#f9f9f9' }}>
          <h2 className="font-bold text-sm" style={{ color: '#000' }}>Full Chat History ({messages.length} messages)</h2>
        </div>
        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: isUser ? '#000' : GOLD }}>
                      {isUser ? client.full_name : '🎩 Charlie'}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>
                      {new Date(msg.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                    {msg.flag_status && msg.flag_status !== 'none' && (
                      <Badge className={`${flagColors[msg.flag_status]} border-0 text-xs`}>{msg.flag_status}</Badge>
                    )}
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: isUser ? '#000' : `${GOLD}18`,
                      color: isUser ? '#fff' : '#2a2a2a',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}