import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Send, MessageCircle, Phone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ClientMessages({ clientId }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['client-messages', clientId],
    queryFn: () => appClient.entities.ChatMessage.filter({ client_id: clientId }, 'created_date', 200),
    enabled: !!clientId,
    refetchInterval: 8000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!clientId) return;
    const unsub = appClient.entities.ChatMessage.subscribe((event) => {
      if (event.data?.client_id === clientId) {
        queryClient.invalidateQueries({ queryKey: ['client-messages', clientId] });
      }
    });
    return unsub;
  }, [clientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !clientId) return;
    setSending(true);
    try {
      await appClient.entities.ChatMessage.create({
        client_id: clientId,
        role: 'user',
        content: text.trim(),
        message_type: 'text',
      });
      setText('');
      queryClient.invalidateQueries({ queryKey: ['client-messages', clientId] });
    } catch (e) {
      toast({ title: 'Could not send message', description: e.message, variant: 'destructive' });
    }
    setSending(false);
  };

  // Show only messages that are text exchanges (not system/task_update)
  const thread = messages.filter(m => m.message_type === 'text' || !m.message_type);

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#111', border: `1px solid rgba(212,175,55,0.2)`, height: '520px' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 shrink-0"
        style={{ background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <MessageCircle className="w-5 h-5" style={{ color: GOLD }} />
        <div>
          <p className="font-bold text-white text-sm">Direct Message — Dyson & Dyson Team</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>We typically respond within 1 hour · Mon–Sat 9am–7pm PT</p>
          </div>
        </div>
        <a href="tel:+18583531200" className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
          <Phone className="w-3 h-3" /> Call (858) 353-1200
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: '#0a0a0a' }}>
        {thread.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-10">
            <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
            <p className="text-sm font-semibold text-white mb-1">Send us a message</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Questions about your search? Updates on your timeline? Your Dyson concierge team is here.
            </p>
          </motion.div>
        )}

        {thread.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isAdmin = msg.role === 'admin';
          const isCharlie = msg.role === 'charlie';
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs sm:max-w-sm">
                <div className={`flex items-center gap-1 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] font-bold" style={{ color: isAdmin ? GOLD : isCharlie ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}>
                    {isUser ? 'You' : isAdmin ? 'Dyson Team' : 'Charlie AI'}
                  </span>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>· {timeAgo(msg.created_date)}</span>
                </div>
                <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: isUser ? 'rgba(212,175,55,0.15)' : isAdmin ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                    border: isUser ? `1px solid rgba(212,175,55,0.3)` : isAdmin ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    borderBottomRightRadius: isUser ? 4 : undefined,
                    borderBottomLeftRadius: !isUser ? 4 : undefined,
                  }}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-4 py-3 flex gap-3 items-end shrink-0"
        style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message your Dyson concierge team..."
          rows={2}
          className="flex-1 rounded-xl px-4 py-3 text-sm resize-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
        />
        <button onClick={handleSend} disabled={sending || !text.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 shrink-0"
          style={{ background: GOLD, color: '#000' }}>
          <Send className="w-4 h-4" />
          {sending ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}