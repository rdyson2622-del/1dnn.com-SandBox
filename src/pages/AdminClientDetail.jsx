import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, MapPin, MessageSquare, Send, Clock, User, Star } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import EscrowTimeline from "@/components/admin/EscrowTimeline";
import TransactionStages from "@/components/admin/client-detail/TransactionStages";

const GOLD = '#D4AF37';

const STATUS_CONFIG = {
  new_lead:           { label: 'New Lead',           color: '#60a5fa' },
  in_consultation:    { label: 'In Consultation',    color: GOLD },
  actively_searching: { label: 'Actively Searching', color: '#a78bfa' },
  under_contract:     { label: 'Under Contract',     color: '#f97316' },
  moved:              { label: 'Moved',              color: '#22c55e' },
  closed:             { label: 'Closed',             color: '#22c55e' },
  inactive:           { label: 'Inactive',           color: '#6b7280' },
};

const QUICK_SMS = [
  "Hi {name}, this is Bob Dyson at Dyson & Dyson Relocation Concierge. Just checking in — how are things going with your move to {destination}? Happy to help with next steps!",
  "Hi {name}! A quick update — we have some great new listings in {destination} that match your criteria. Want me to send them over?",
  "Hi {name}, just a friendly reminder that we're here to help every step of the way. Feel free to call or text anytime. — Bob Dyson (858) 353-1200",
  "Hi {name}, have you had a chance to review the properties we sent? Let us know your thoughts and we'll set up tours!",
];

function fill(template, client) {
  return template
    .replace(/{name}/g, client.full_name?.split(' ')[0] || 'there')
    .replace(/{destination}/g, client.destination_city || 'your destination');
}

export default function AdminClientDetail() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('id');
  const tabParam = searchParams.get('tab');
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [smsText, setSmsText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [expandTasks, setExpandTasks] = useState(false);

  const { data: client } = useQuery({
    queryKey: ['admin-client-detail', clientId],
    queryFn: () => appClient.entities.RelocationClient.get(clientId),
    enabled: !!clientId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['admin-client-tasks', clientId],
    queryFn: () => appClient.entities.RelocationTask.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['admin-client-properties', clientId],
    queryFn: () => appClient.entities.PropertyCandidate.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId,
  });

  const { data: comms = [], refetch: refetchComms } = useQuery({
    queryKey: ['admin-client-comms', clientId],
    queryFn: () => appClient.entities.Communication.filter({ listing_owner_id: clientId }, '-sent_date', 30),
    enabled: !!clientId,
  });

  if (!client) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="w-8 h-8 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.new_lead;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const sendSMS = async () => {
    if (!smsText.trim() || !client.phone) return;
    setSending(true);
    try {
      await appClient.functions.invoke('sendClientSMS', {
        client_id: clientId,
        phone: client.phone,
        message: smsText,
        client_name: client.full_name,
      });
      await appClient.entities.Communication.create({
        communication_type: 'sms',
        recipient_name: client.full_name,
        recipient_phone: client.phone,
        property_address: `Relocation Client`,
        listing_owner_id: clientId,
        message_content: smsText,
        sent_date: new Date().toISOString(),
        status: 'sent',
      });
      setSmsText('');
      refetchComms();
      const toastId = toast({ title: "SMS Sent!", description: `Message delivered to ${client.full_name}` });
      setTimeout(() => toastId.dismiss(), 3000);
    } catch (e) {
      toast({ title: "SMS Failed", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || !client.email) return;
    setSending(true);
    try {
      await appClient.integrations.Core.SendEmail({
        to: client.email,
        subject: emailSubject,
        body: emailBody,
        from_name: 'Bob Dyson — Dyson & Dyson Relocation',
      });
      await appClient.entities.Communication.create({
        communication_type: 'email',
        recipient_name: client.full_name,
        recipient_email: client.email,
        property_address: `Relocation Client`,
        listing_owner_id: clientId,
        message_content: `Subject: ${emailSubject}\n\n${emailBody}`,
        sent_date: new Date().toISOString(),
        status: 'sent',
      });
      setEmailSubject('');
      setEmailBody('');
      refetchComms();
      const toastId = toast({ title: "Email Sent!", description: `Email delivered to ${client.email}` });
      setTimeout(() => toastId.dismiss(), 3000);
    } catch (e) {
      toast({ title: "Email Failed", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'transaction', label: '🏡 Transaction Journey' },
    { key: 'communicate', label: '💬 Communicate' },
    { key: 'tasks', label: `Tasks (${tasks.length})` },
    { key: 'properties', label: `Properties (${properties.length})` },
    { key: 'history', label: `Comm History (${comms.length})` },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/clients">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
              style={{ background: `${cfg.color}20`, color: cfg.color, border: `2px solid ${cfg.color}40` }}>
              {client.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{client.full_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                  {cfg.label}
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {client.current_city} → {client.destination_city}
                </span>
              </div>
            </div>
          </div>
          {/* Quick contact buttons */}
          <div className="flex gap-2">
            {client.phone && (
              <a href={`tel:${client.phone}`}>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
              </a>
            )}
            <button onClick={() => setActiveTab('communicate')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
              style={{ background: GOLD, color: '#000' }}>
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.key ? GOLD : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.key ? '#000' : 'rgba(255,255,255,0.5)',
                border: activeTab === tab.key ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Email', value: client.email, icon: Mail },
                  { label: 'Phone', value: client.phone || '—', icon: Phone },
                  { label: 'Moving From', value: client.current_city || '—', icon: MapPin },
                  { label: 'Destination', value: client.destination_city, icon: MapPin },
                  { label: 'Timeline', value: client.move_date || '—', icon: Clock },
                  { label: 'Budget', value: client.budget?.replace(/_/g, ' ') || '—', icon: Star },
                  { label: 'Family Size', value: client.family_size ? `${client.family_size} people` : '—', icon: User },
                  { label: 'Assigned Agent', value: client.agent_name || client.assigned_agent || 'Not yet assigned', icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tasks Completed', value: `${completedTasks}/${tasks.length}`, color: '#22c55e' },
                  { label: 'Properties Saved', value: properties.length, color: GOLD },
                  { label: 'Messages Sent', value: comms.length, color: '#60a5fa' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-2xl font-black" style={{ color }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                  </div>
                ))}
              </div>

              {client.priorities?.length > 0 && (
                <div className="mt-4 rounded-xl p-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Relocation Priorities</p>
                  <div className="flex flex-wrap gap-2">
                    {client.priorities.map(p => (
                      <span key={p} className="text-xs px-3 py-1 rounded-full font-semibold"
                        style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, border: '1px solid rgba(212,175,55,0.2)' }}>
                        {p.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Escrow Timeline — shown if client is Under Contract or later */}
              {client.status === 'under_contract' && (
                <div className="mt-4">
                  <EscrowTimeline clientId={clientId} />
                </div>
              )}
            </motion.div>
          )}

          {/* ── TRANSACTION JOURNEY ── */}
          {activeTab === 'transaction' && (
           <motion.div key="transaction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <TransactionStages />
           </motion.div>
          )}

          {/* ── COMMUNICATE ── */}
          {activeTab === 'communicate' && (
            <motion.div key="communicate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* SMS */}
              <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4" style={{ color: '#22c55e' }} />
                  <p className="font-bold text-white">Send SMS</p>
                  {client.phone
                    ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{client.phone}</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>No phone on file</span>
                  }
                </div>

                {/* Quick templates */}
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Quick Templates</p>
                <div className="space-y-2 mb-4">
                  {QUICK_SMS.map((t, i) => (
                    <button key={i} onClick={() => setSmsText(fill(t, client))}
                      className="w-full text-left p-3 rounded-xl text-xs transition-all hover:border-yellow-400/40"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                      {fill(t, client).slice(0, 100)}…
                    </button>
                  ))}
                </div>

                <textarea
                  value={smsText}
                  onChange={e => setSmsText(e.target.value)}
                  placeholder="Type your SMS message..."
                  rows={3}
                  className="w-full rounded-xl p-3 text-sm resize-none mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{smsText.length} chars</span>
                  <button onClick={sendSMS} disabled={sending || !smsText.trim() || !client.phone}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold disabled:opacity-40"
                    style={{ background: '#22c55e', color: '#000' }}>
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Send SMS'}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-4 h-4" style={{ color: '#60a5fa' }} />
                  <p className="font-bold text-white">Send Email</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>{client.email}</span>
                </div>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full rounded-xl p-3 text-sm mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                />
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder={`Hi ${client.full_name?.split(' ')[0]},\n\n`}
                  rows={6}
                  className="w-full rounded-xl p-3 text-sm resize-none mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                />
                <div className="flex justify-end">
                  <button onClick={sendEmail} disabled={sending || !emailSubject.trim() || !emailBody.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold disabled:opacity-40"
                    style={{ background: '#60a5fa', color: '#000' }}>
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Send Email'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TASKS ── */}
          {activeTab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                {tasks.length === 0 ? (
                  <p className="p-6 text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No tasks yet for this client.</p>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{
                            background: task.status === 'completed' ? '#22c55e' : task.status === 'in_progress' ? GOLD : 'rgba(255,255,255,0.2)'
                          }} />
                          <div>
                            <p className="text-sm font-semibold text-white">{task.title}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{task.category} · {task.priority}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0" style={{
                          background: task.status === 'completed' ? 'rgba(34,197,94,0.1)' : task.status === 'in_progress' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
                          color: task.status === 'completed' ? '#22c55e' : task.status === 'in_progress' ? GOLD : 'rgba(255,255,255,0.4)',
                        }}>
                          {task.status?.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── PROPERTIES ── */}
          {activeTab === 'properties' && (
            <motion.div key="properties" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                {properties.length === 0 ? (
                  <p className="p-6 text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No properties saved yet.</p>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    {properties.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{p.address}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.city}, {p.state} {p.price ? `· $${p.price.toLocaleString()}` : ''}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0" style={{
                          background: p.status === 'top_pick' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
                          color: p.status === 'top_pick' ? GOLD : 'rgba(255,255,255,0.4)',
                        }}>
                          {p.status?.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── COMM HISTORY ── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                {comms.length === 0 ? (
                  <p className="p-6 text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No messages sent yet. Use the Communicate tab to reach out.</p>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    {comms.map(c => (
                      <div key={c.id} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: c.communication_type === 'sms' ? 'rgba(34,197,94,0.1)' : 'rgba(96,165,250,0.1)', color: c.communication_type === 'sms' ? '#22c55e' : '#60a5fa' }}>
                            {c.communication_type?.toUpperCase()}
                          </span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {new Date(c.sent_date).toLocaleDateString()} {new Date(c.sent_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{c.message_content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}