import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Eye, Copy, Check } from 'lucide-react';

const GOLD = '#D4AF37';

export default function AdminMassPitchPersonalizer() {
  const [template, setTemplate] = useState(
    `Hi [Name],\n\nI came across your work at [Outlet] and wanted to reach out about a story I think your readers would find fascinating.\n\nBob Dyson has been in real estate for 55 years, and he's pioneered something truly unique: a full-service concierge relocation program that's 100% free to the buyer. In a world where moving is one of the most stressful life events, his team handles everything — agent vetting, city research, school enrollment, utilities — so families can focus on what matters.\n\nI'd love to connect and share more. Would you be open to a quick call?\n\nWarm regards,\nDyson & Dyson Concierge Relocation`
  );
  const [filterStatus, setFilterStatus] = useState('not_contacted');
  const [previewing, setPreviewing] = useState(null);
  const [sent, setSent] = useState({});

  const { data: contacts = [] } = useQuery({
    queryKey: ['mediaContacts'],
    queryFn: () => appClient.entities.MediaContact.list('-created_date', 500),
  });

  const filtered = contacts.filter(c =>
    filterStatus === 'all' || c.pitch_status === filterStatus
  );

  const personalize = (contact) => {
    return template
      .replace(/\[Name\]/g, contact.name || 'there')
      .replace(/\[Outlet\]/g, contact.outlet || 'your outlet');
  };

  const copyPersonalized = async (contact) => {
    await navigator.clipboard.writeText(personalize(contact));
    setSent(p => ({ ...p, [contact.id]: 'copied' }));
    setTimeout(() => setSent(p => ({ ...p, [contact.id]: null })), 2000);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.3em] mb-1" style={{ color: GOLD }}>PR & MEDIA</p>
          <h1 className="text-3xl font-bold text-white">Mass Pitch Personalizer</h1>
          <p className="text-sm mt-1 text-white">
            Write one template — the system swaps <span style={{ color: GOLD }}>[Name]</span> and <span style={{ color: GOLD }}>[Outlet]</span> automatically for each journalist.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Template Editor */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: GOLD }}>PITCH TEMPLATE</p>
            <div className="flex gap-2 mb-3 flex-wrap text-xs">
              <span className="px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>Use [Name] for journalist name</span>
              <span className="px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>Use [Outlet] for outlet name</span>
            </div>
            <textarea
              value={template}
              onChange={e => setTemplate(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none border-0 leading-relaxed"
              style={{ background: '#1a1a1a', color: '#fff', fontFamily: 'monospace' }}
            />
          </div>

          {/* Right: Contact List */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-widest" style={{ color: GOLD }}>CONTACTS ({filtered.length})</p>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg border-0" style={{ background: '#1a1a1a', color: '#fff' }}>
                <option value="all">All Statuses</option>
                <option value="not_contacted">Not Contacted</option>
                <option value="pitched">Pitched</option>
                <option value="replied">Replied</option>
                <option value="hot">Hot</option>
              </select>
            </div>
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {filtered.map(c => (
                <div key={c.id} className="rounded-xl p-3" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{c.name}</p>
                      <p className="text-xs text-white">{c.outlet} · {c.beat}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewing(previewing?.id === c.id ? null : c)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(212,175,55,0.1)', color: GOLD }}
                        title="Preview personalized pitch">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyPersonalized(c)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: sent[c.id] === 'copied' ? 'rgba(34,197,94,0.2)' : 'rgba(212,175,55,0.1)', color: sent[c.id] === 'copied' ? '#22c55e' : GOLD }}
                        title="Copy personalized pitch">
                        {sent[c.id] === 'copied' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {/* Preview */}
                  {previewing?.id === c.id && (
                    <div className="mt-3 p-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap"
                      style={{ background: '#0d0d0d', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(212,175,55,0.2)' }}>
                      {personalize(c)}
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No contacts match this filter</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}