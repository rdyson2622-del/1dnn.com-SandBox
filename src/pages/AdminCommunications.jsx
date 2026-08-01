import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail, Phone, Send, Trash2, X, Pencil, Check, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

// Merge Communications + ChatMessages into unified threads keyed by contact name/id
function buildThreads(comms, chatMessages, clients) {
  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = c; });

  const threads = {};

  // Communications (SMS/email from admin → client or inbound)
  comms.forEach(c => {
    const key = c.recipient_name || 'Unknown';
    if (!threads[key]) threads[key] = { name: key, phone: c.recipient_phone, email: c.recipient_email, messages: [], source: 'comm', clientId: c.listing_owner_id };
    threads[key].messages.push({
      id: c.id,
      content: c.message_content,
      date: c.sent_date,
      type: c.communication_type,
      direction: c.role === 'inbound' ? 'inbound' : 'outbound',
      status: c.status,
      source: 'comm',
    });
  });

  // ChatMessages (client ↔ Charlie)
  chatMessages.forEach(m => {
    const client = clientMap[m.client_id];
    const key = client ? client.full_name : (m.client_id ? `Client ${m.client_id.slice(0, 6)}` : 'Unknown');
    if (!threads[key]) threads[key] = { name: key, phone: client?.phone, email: client?.email, messages: [], source: 'chat', clientId: m.client_id };
    threads[key].messages.push({
      id: m.id,
      content: m.content,
      date: m.created_date,
      type: 'chat',
      direction: m.role === 'user' ? 'inbound' : 'outbound',
      status: 'delivered',
      source: 'chat',
    });
  });

  // Sort messages within each thread
  Object.values(threads).forEach(t => t.messages.sort((a, b) => new Date(a.date) - new Date(b.date)));

  return threads;
}

export default function AdminCommunications() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: comms = [] } = useQuery({
    queryKey: ['comms-all'],
    queryFn: () => appClient.entities.Communication.list('-sent_date', 500),
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chat-messages-all'],
    queryFn: () => appClient.entities.ChatMessage.list('-created_date', 500),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['all-clients-comm'],
    queryFn: () => appClient.entities.RelocationClient.list('-created_date', 200),
  });

  // Real-time new message alerts
  useEffect(() => {
    const unsub = appClient.entities.ChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data?.role === 'user') {
        queryClient.invalidateQueries({ queryKey: ['chat-messages-all'] });
        toast({ title: '💬 New client message!', description: event.data.content?.slice(0, 80) });
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = appClient.entities.Communication.subscribe((event) => {
      if (event.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['comms-all'] });
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected, comms, chatMessages]);

  const threads = buildThreads(comms, chatMessages, clients);

  const filteredKeys = Object.keys(threads).filter(key => {
    const t = threads[key];
    const matchSearch = !search || key.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all'
      || (typeFilter === 'sms' && t.messages.some(m => m.type === 'sms'))
      || (typeFilter === 'email' && t.messages.some(m => m.type === 'email'))
      || (typeFilter === 'chat' && t.messages.some(m => m.type === 'chat'));
    return matchSearch && matchType;
  }).sort((a, b) => {
    const aLast = threads[a].messages[threads[a].messages.length - 1]?.date || '';
    const bLast = threads[b].messages[threads[b].messages.length - 1]?.date || '';
    return new Date(bLast) - new Date(aLast);
  });

  const thread = selected ? threads[selected] : null;

  const handleSend = async () => {
    if (!newMessage.trim() || !thread) return;
    setSending(true);
    try {
      const isSMS = thread.phone && (thread.source === 'comm' || typeFilter === 'sms');

      if (isSMS && thread.phone) {
        // Send real SMS via Twilio
        await appClient.functions.invoke('sendOwnerOutreachSMS', {
          phone: thread.phone,
          message: newMessage,
          owner_name: thread.name,
        });
      } else if (thread.email) {
        // Send email
        await appClient.integrations.Core.SendEmail({
          to: thread.email,
          subject: `Message from Dyson & Dyson Relocation`,
          body: newMessage,
          from_name: 'Bob Dyson — Dyson & Dyson Relocation',
        });
      }

      // If this is a chat thread, also post reply as admin role so client sees it
      if (thread.source === 'chat' && thread.clientId) {
        await appClient.entities.ChatMessage.create({
          client_id: thread.clientId,
          role: 'admin',
          content: newMessage,
          message_type: 'text',
        });
      }

      // Log it
      await appClient.entities.Communication.create({
        communication_type: isSMS && thread.phone ? 'sms' : 'email',
        recipient_name: thread.name,
        recipient_phone: thread.phone,
        recipient_email: thread.email,
        property_address: 'Relocation Client',
        listing_owner_id: thread.clientId,
        message_content: newMessage,
        sent_date: new Date().toISOString(),
        status: 'sent',
      });

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['comms-all'] });
      toast({ title: 'Message sent!' });
    } catch (e) {
      toast({ title: 'Send failed', description: e.message, variant: 'destructive' });
    }
    setSending(false);
  };

  const handleDeleteMessage = async (msg) => {
    if (!confirm('Delete this message?')) return;
    try {
      if (msg.source === 'chat') {
        await appClient.entities.ChatMessage.delete(msg.id);
        queryClient.invalidateQueries({ queryKey: ['chat-messages-all'] });
      } else {
        await appClient.entities.Communication.delete(msg.id);
        queryClient.invalidateQueries({ queryKey: ['comms-all'] });
      }
      toast({ title: 'Message deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleEditSave = async (msg) => {
    try {
      if (msg.source === 'chat') {
        await appClient.entities.ChatMessage.update(msg.id, { content: editingContent });
        queryClient.invalidateQueries({ queryKey: ['chat-messages-all'] });
      } else {
        await appClient.entities.Communication.update(msg.id, { message_content: editingContent });
        queryClient.invalidateQueries({ queryKey: ['comms-all'] });
      }
      setEditingMsgId(null);
      toast({ title: 'Message updated' });
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    }
  };

  const inboundCount = Object.values(threads).reduce((n, t) => n + t.messages.filter(m => m.direction === 'inbound').length, 0);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 48px)', background: '#0a0a0a' }}>

      {/* Header */}
      <div className="px-5 py-4 shrink-0" style={{ background: '#111', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-lg tracking-wide">Communications Hub</h1>
                {inboundCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold animate-pulse"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                    {inboundCount} inbound
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#D4AF37' }}>
                SMS · Email · Charlie Chat — unified inbox · Twilio SMS alerts active
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-44 h-8 rounded-full px-3 text-xs"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.25)', color: '#fff', outline: 'none' }}
            />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="h-8 rounded-full px-3 text-xs"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.25)', color: '#fff', outline: 'none' }}>
              <option value="all">All Channels</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="chat">Chat</option>
            </select>
          </div>
        </div>

        {/* Explainer banner */}
        <div className="rounded-xl px-4 py-3 flex flex-wrap gap-4 items-start"
          style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)' }}>
          <div className="flex-1 min-w-48">
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: GOLD }}>FOR YOUR TEAM</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Every message your clients send — via Charlie chat, SMS reply, or email — lands here in one thread. Reply directly and it goes back to them on the same channel. New messages trigger an instant SMS to your admin phone.
            </p>
          </div>
          <div className="flex-1 min-w-48">
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: GOLD }}>FOR YOUR CLIENTS</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Clients message through their dashboard and receive replies in real-time. They always see the latest response — no app downloads, no logins required. Just a conversation they can trust.
            </p>
          </div>
          <div className="flex items-center gap-2 self-center">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Live & Monitoring</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: contact list */}
         <div className="w-72 shrink-0 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: '#0d0d0d' }}>
          {filteredKeys.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(212,175,55,0.25)' }} />
              <p className="text-sm font-semibold" style={{ color: '#fff' }}>No conversations yet</p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                When clients send a message via their dashboard or Charlie chat, their thread will appear here instantly.
              </p>
            </div>
          ) : filteredKeys.map(key => {
            const t = threads[key];
            const last = t.messages[t.messages.length - 1];
            const unread = t.messages.filter(m => m.direction === 'inbound').length;
            const isSelected = selected === key;
            return (
              <div key={key}
                className="p-4 cursor-pointer flex items-start gap-3 transition-colors group"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  background: isSelected ? 'rgba(212,175,55,0.1)' : 'transparent',
                  borderLeft: isSelected ? `3px solid ${GOLD}` : '3px solid transparent',
                }}
                onClick={() => setSelected(key)}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                  style={{ background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.1)', color: isSelected ? GOLD : '#fff' }}>
                  {key.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate" style={{ color: isSelected ? GOLD : '#fff' }}>{key}</p>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {t.clientId && (
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/admin/client-detail?id=${t.clientId}`); }}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-opacity"
                          title="View client profile">
                          <ExternalLink className="w-3 h-3" style={{ color: GOLD }} />
                        </button>
                      )}
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {last ? timeAgo(last.date) : ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {last?.content?.slice(0, 50) || 'No messages'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[...new Set(t.messages.map(m => m.type))].map(typ => (
                      <span key={typ} className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                        style={{
                          background: typ === 'sms' ? 'rgba(34,197,94,0.15)' : typ === 'email' ? 'rgba(96,165,250,0.15)' : 'rgba(167,139,250,0.15)',
                          color: typ === 'sms' ? '#22c55e' : typ === 'email' ? '#60a5fa' : '#a78bfa',
                        }}>
                        {typ}
                      </span>
                    ))}
                    {unread > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black ml-auto"
                        style={{ background: '#ef4444', color: '#fff' }}>
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: thread */}
        {thread ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Thread header */}
            <div className="px-5 py-3 flex items-center justify-between shrink-0"
              style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="font-bold text-white">{thread.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {thread.phone && (
                    <a href={`tel:${thread.phone}`} className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#22c55e' }}>
                      <Phone className="w-3 h-3" /> {thread.phone}
                    </a>
                  )}
                  {thread.email && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#60a5fa' }}>
                      <Mail className="w-3 h-3" /> {thread.email}
                    </span>
                  )}
                  {thread.clientId && (
                    <Link to={`/admin/client-detail?id=${thread.clientId}`}
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
                      View Full Profile →
                    </Link>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
             <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: '#0a0a0a' }}>
              {thread.messages.map(msg => {
                const isOut = msg.direction === 'outbound';
                const isEditing = editingMsgId === msg.id;
                const isHovered = hoveredMsgId === msg.id;
                return (
                  <div key={msg.id}
                    className={`flex ${isOut ? 'justify-end' : 'justify-start'} group`}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}>
                    <div className="max-w-sm w-full">
                      {/* Direction label + action buttons */}
                      <div className={`flex items-center gap-1 mb-1 ${isOut ? 'justify-end' : 'justify-start'}`}>
                        {isOut && isHovered && !isEditing && (
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              onClick={() => { setEditingMsgId(msg.id); setEditingContent(msg.content); }}
                              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10"
                              title="Edit message">
                              <Pencil className="w-3 h-3" style={{ color: '#a78bfa' }} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg)}
                              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10"
                              title="Delete message">
                              <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                            </button>
                          </div>
                        )}
                        <span className="text-[9px] font-bold uppercase"
                          style={{ color: msg.type === 'sms' ? '#22c55e' : msg.type === 'email' ? '#60a5fa' : '#a78bfa' }}>
                          {msg.type}
                        </span>
                        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.55)' }}>· {timeAgo(msg.date)}</span>
                        {!isOut && isHovered && !isEditing && (
                          <button
                            onClick={() => handleDeleteMessage(msg)}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 ml-1"
                            title="Delete message">
                            <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl px-4 py-2.5 text-sm resize-none"
                            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', color: '#fff', outline: 'none' }}
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingMsgId(null)}
                              className="px-3 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                              Cancel
                            </button>
                            <button onClick={() => handleEditSave(msg)}
                              className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                              style={{ background: GOLD, color: '#000' }}>
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                          style={{
                            background: isOut ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.07)',
                            border: isOut ? `1px solid rgba(212,175,55,0.3)` : '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            borderBottomRightRadius: isOut ? 4 : undefined,
                            borderBottomLeftRadius: !isOut ? 4 : undefined,
                          }}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div className="px-5 py-3 flex gap-3 items-end shrink-0"
              style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Reply to ${thread.name} via ${thread.phone ? 'SMS' : 'email'}...`}
                rows={2}
                className="flex-1 rounded-xl px-4 py-3 text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              />
              <button onClick={handleSend} disabled={sending || !newMessage.trim()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 shrink-0"
                style={{ background: GOLD, color: '#000' }}>
                <Send className="w-4 h-4" />
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ background: '#0a0a0a' }}>
            <div className="text-center max-w-md px-8">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <MessageCircle className="w-8 h-8" style={{ color: GOLD }} />
              </div>
              <p className="font-bold text-white text-lg mb-2 tracking-wide">Select a Conversation</p>
              <p className="text-sm mb-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Every client message — sent via their dashboard, Charlie chat, or SMS reply — is threaded here so you never miss a beat.
              </p>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Reply directly and your response is delivered on the same channel. New inbound messages trigger an instant Twilio SMS to your admin phone.
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
                <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Live & monitoring — Twilio alerts active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}