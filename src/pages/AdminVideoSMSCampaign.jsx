import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { Video, Send, Users, CheckCircle2, AlertCircle } from 'lucide-react';

const GOLD = '#D4AF37';

const MESSAGE_TEMPLATES = [
  {
    label: 'Intro — Who We Are',
    text: `Hi {{owner_name}}, this is Bob Dyson at Dyson & Dyson Relocation. I just recorded a short video about how we help homeowners like you find their next home — anywhere in the US. Watch here: {{video_url}} — Happy to answer any questions!`,
  },
  {
    label: 'Our Concierge Process',
    text: `Hi {{owner_name}}, Bob Dyson here. I wanted to personally share how our concierge relocation program works — it's 100% free for buyers. Watch this quick video: {{video_url}} — Let me know if this resonates with your situation.`,
  },
  {
    label: 'Why Sellers Choose Us',
    text: `Hi {{owner_name}}, I put together a short video on why sellers moving out of {{city}} trust Dyson & Dyson to handle their destination home search. Watch here: {{video_url}} — No obligation, just real info.`,
  },
];

function fill(template, owner, videoUrl) {
  return template
    .replace(/{{owner_name}}/g, owner.owner_name?.split(' ')[0] || 'there')
    .replace(/{{city}}/g, owner.property_city || 'your area')
    .replace(/{{video_url}}/g, videoUrl);
}

export default function AdminVideoSMSCampaign() {
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState(MESSAGE_TEMPLATES[0].text);
  const [selectedCity, setSelectedCity] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState('');

  const { data: owners = [] } = useQuery({
    queryKey: ['owners-for-video-sms'],
    queryFn: () => appClient.entities.ListingOwner.list('-created_date', 2000),
  });

  // Get unique cities
  const cities = [...new Set(owners.map(o => o.property_city).filter(Boolean))].sort();

  // Filter recipients: selected city, has phone, not opted out
  const recipients = owners.filter(o =>
    o.property_city === selectedCity &&
    o.phone &&
    o.contact_status !== 'not_interested'
  );

  const updatePreview = (msg, url) => {
    if (recipients.length > 0 && url) {
      setPreview(fill(msg, recipients[0], url));
    } else {
      setPreview(fill(msg, { owner_name: 'John', property_city: selectedCity || 'Phoenix' }, url || 'https://loom.com/share/example'));
    }
  };

  const handleTemplateSelect = (tpl) => {
    setMessage(tpl.text);
    updatePreview(tpl.text, videoUrl);
  };

  const handleMessageChange = (val) => {
    setMessage(val);
    updatePreview(val, videoUrl);
  };

  const handleUrlChange = (val) => {
    setVideoUrl(val);
    updatePreview(message, val);
  };

  const handleSend = async () => {
    if (!videoUrl || !message || !selectedCity || recipients.length === 0) return;
    setSending(true);
    setResults(null);

    let sent = 0, failed = 0, errors = [];

    for (const owner of recipients) {
      const text = fill(message, owner, videoUrl);
      try {
        await appClient.functions.invoke('sendClientSMS', {
          phone: owner.phone,
          message: text,
          client_name: owner.owner_name,
        });

        // Log the communication
        await appClient.entities.Communication.create({
          communication_type: 'sms',
          recipient_name: owner.owner_name,
          recipient_phone: owner.phone,
          property_address: owner.property_address || '',
          listing_owner_id: owner.id,
          message_content: text,
          sent_date: new Date().toISOString(),
          status: 'sent',
          notes: `Video Campaign: ${videoUrl}`,
        });

        sent++;
      } catch (e) {
        failed++;
        errors.push(`${owner.owner_name}: ${e.message}`);
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    setResults({ sent, failed, errors, city: selectedCity });
    setSending(false);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0a0a0a' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD}40` }}>
            <Video className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Video SMS Campaign</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Send a video link to listing owners by city via Twilio SMS</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Step 1: Video URL */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Step 1 — Paste Your Video Link</p>
            <input
              value={videoUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://loom.com/share/... or YouTube, Vimeo, etc."
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
            {videoUrl && (
              <p className="text-xs mt-2" style={{ color: '#22c55e' }}>✓ Video URL set</p>
            )}
          </div>

          {/* Step 2: Message */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Step 2 — Write or Choose Your Message</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {MESSAGE_TEMPLATES.map((tpl, i) => (
                <button key={i} onClick={() => handleTemplateSelect(tpl)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                  style={{ background: message === tpl.text ? GOLD : 'rgba(255,255,255,0.06)', color: message === tpl.text ? '#000' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {tpl.label}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={e => handleMessageChange(e.target.value)}
              rows={5}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Use <span style={{ color: GOLD }}>{'{{owner_name}}'}</span>, <span style={{ color: GOLD }}>{'{{city}}'}</span>, <span style={{ color: GOLD }}>{'{{video_url}}'}</span> as placeholders
            </p>
          </div>

          {/* Step 3: City */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Step 3 — Select Recipient City</p>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: selectedCity ? '#fff' : 'rgba(255,255,255,0.3)', outline: 'none' }}>
              <option value="">— Choose a city —</option>
              {cities.map(city => {
                const count = owners.filter(o => o.property_city === city && o.phone && o.contact_status !== 'not_interested').length;
                return <option key={city} value={city}>{city} ({count} with phone)</option>;
              })}
            </select>

            {selectedCity && (
              <div className="flex items-center gap-2 mt-3">
                <Users className="w-4 h-4" style={{ color: GOLD }} />
                <p className="text-sm font-bold" style={{ color: '#fff' }}>
                  {recipients.length} recipients in {selectedCity}
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && selectedCity && videoUrl && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid ${GOLD}30` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Preview (first recipient)</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{preview}</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{preview.length} characters</p>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !videoUrl || !message || !selectedCity || recipients.length === 0}
            className="w-full py-4 rounded-2xl font-black text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{ background: GOLD, color: '#000' }}>
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Sending... (may take a few minutes)
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {recipients.length} Recipients in {selectedCity || '—'}
              </>
            )}
          </button>

          {/* Results */}
          {results && (
            <div className="rounded-2xl p-5" style={{ background: '#111', border: `1px solid ${results.failed > 0 ? '#ef444440' : '#22c55e40'}` }}>
              <div className="flex items-center gap-2 mb-3">
                {results.failed === 0
                  ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                  : <AlertCircle className="w-5 h-5 text-red-400" />}
                <p className="font-bold text-white">Campaign Complete — {results.city}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-black" style={{ color: '#22c55e' }}>{results.sent}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Sent</p>
                </div>
                {results.failed > 0 && (
                  <div>
                    <p className="text-2xl font-black text-red-400">{results.failed}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Failed</p>
                  </div>
                )}
              </div>
              {results.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {results.errors.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-xs text-red-400">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}