import React, { useState } from 'react';
import { Send, Mail, MessageSquare, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

const QUICK_MESSAGES = [
  { label: 'Welcome check-in', text: (name) => `Hi ${name?.split(' ')[0]}! This is Bob from Dyson & Dyson. Just checking in to make sure you have everything you need for your relocation. Feel free to reach out any time!` },
  { label: 'Agent intro ready', text: (name) => `Hi ${name?.split(' ')[0]}, great news — we've identified a top agent match for your move. I'd love to connect you. Are you available for a quick call this week?` },
  { label: 'Follow-up nudge', text: (name) => `Hi ${name?.split(' ')[0]}, just following up on your relocation plan. Charlie has some updates waiting for you in the app — let me know if you have questions!` },
  { label: 'Escrow congrats', text: (name) => `Congratulations ${name?.split(' ')[0]}! 🎉 We heard escrow is moving forward — so exciting! We're here to make the rest of the transition smooth. Let us know how we can help.` },
];

export default function ClientQuickContact({ client }) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedQuick, setSelectedQuick] = useState(null);

  const handleQuickSelect = (msg) => {
    setSelectedQuick(msg.label);
    setEmailBody(msg.text(client.full_name));
    setEmailSubject('Update from Dyson & Dyson Relocation');
  };

  const handleSendEmail = async () => {
    if (!emailBody.trim() || !client.email) return;
    setSending(true);
    await appClient.integrations.Core.SendEmail({
      to: client.email,
      subject: emailSubject || 'Message from Dyson & Dyson',
      body: emailBody,
      from_name: 'Bob Dyson — Dyson & Dyson Relocation',
    });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmailBody('');
    setEmailSubject('');
    setSelectedQuick(null);
  };

  return (
    <div className="space-y-5">
      {/* Quick contact buttons */}
      <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <h2 className="font-bold text-base mb-3" style={{ color: '#000' }}>Quick Contact</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {client.phone && (
            <a href={`tel:${client.phone}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: '#000', color: '#fff' }}>
              <Phone className="w-4 h-4" /> Call {client.phone}
            </a>
          )}
          {client.phone && (
            <a href={`sms:${client.phone}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: `${GOLD}22`, color: '#7a6000', border: `1px solid ${GOLD}55` }}>
              <MessageSquare className="w-4 h-4" /> Text
            </a>
          )}
        </div>

        <div className="border-t pt-4" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.4)' }}>Quick Message Templates</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_MESSAGES.map(msg => (
              <button key={msg.label} onClick={() => handleQuickSelect(msg)}
                className="text-left text-xs px-3 py-2 rounded-lg transition-all"
                style={{
                  background: selectedQuick === msg.label ? `${GOLD}22` : 'rgba(0,0,0,0.04)',
                  border: selectedQuick === msg.label ? `1px solid ${GOLD}55` : '1px solid transparent',
                  color: selectedQuick === msg.label ? '#7a6000' : '#444',
                }}>
                {msg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email composer */}
      <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4" style={{ color: GOLD }} />
          <h2 className="font-bold text-base" style={{ color: '#000' }}>Send Email</h2>
          <span className="text-xs ml-auto" style={{ color: 'rgba(0,0,0,0.4)' }}>To: {client.email}</span>
        </div>

        <input
          value={emailSubject}
          onChange={e => setEmailSubject(e.target.value)}
          placeholder="Subject..."
          className="w-full text-sm rounded-lg border px-3 py-2 mb-2"
          style={{ borderColor: 'rgba(0,0,0,0.12)', background: '#fafafa' }}
        />
        <textarea
          value={emailBody}
          onChange={e => setEmailBody(e.target.value)}
          rows={6}
          placeholder="Write your message..."
          className="w-full text-sm rounded-lg border px-3 py-2 resize-none"
          style={{ borderColor: 'rgba(0,0,0,0.12)', background: '#fafafa', color: '#000' }}
        />
        <div className="flex justify-end mt-3">
          <Button onClick={handleSendEmail} disabled={sending || !emailBody.trim() || !client.email}
            style={{ background: sent ? '#10b981' : GOLD, color: '#000' }}
            className="gap-2 font-bold">
            {sent ? <><CheckCircle2 className="w-4 h-4" /> Sent!</> : sending ? 'Sending...' : <><Send className="w-4 h-4" /> Send Email</>}
          </Button>
        </div>
      </div>
    </div>
  );
}