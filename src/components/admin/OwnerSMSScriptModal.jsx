import React, { useState, useEffect } from 'react';
import { Copy, CheckCheck, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appClient } from '@/api/appClient';

const TEMPLATE_NAMES = [
  { name: 'Owner Outreach SMS #1 - Day 1', label: 'SMS #1', tag: 'Initial Outreach', dayLabel: 'Send immediately', color: 'bg-blue-600', textColor: 'text-blue-700', borderColor: 'border-blue-200', bgColor: 'bg-blue-50' },
  { name: 'Owner Outreach SMS #2 - Day 3', label: 'SMS #2', tag: 'Day 3 Follow-Up', dayLabel: 'Send on Day 3 if no reply', color: 'bg-amber-500', textColor: 'text-amber-700', borderColor: 'border-amber-200', bgColor: 'bg-amber-50' },
  { name: 'Owner Outreach SMS #3 - Day 7', label: 'SMS #3', tag: 'Day 7 Last Touch', dayLabel: 'Send on Day 7 if no reply', color: 'bg-slate-700', textColor: 'text-slate-700', borderColor: 'border-slate-200', bgColor: 'bg-slate-50' },
  { name: 'Owner Outreach SMS #4 - Day 14', label: 'SMS #4', tag: 'Day 14 Final', dayLabel: 'Send on Day 14 if no reply', color: 'bg-purple-600', textColor: 'text-purple-700', borderColor: 'border-purple-200', bgColor: 'bg-purple-50' },
];

function fillTemplate(content, owner) {
  if (!content) return '';
  const firstName = owner?.owner_name ? owner.owner_name.split(' ')[0] : 'there';
  return content
    .replace(/\{\{owner_name\}\}/g, firstName)
    .replace(/\{\{property_address\}\}/g, owner?.property_address || '');
}

export default function OwnerSMSScriptModal({ owner, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      TEMPLATE_NAMES.map(t =>
        appClient.entities.MessageTemplate.filter({ name: t.name, communication_type: 'sms' }, '-created_date', 1)
          .then(results => ({ ...t, content: results[0]?.content || null }))
      )
    ).then(mapped => {
      setTemplates(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const script = templates[activeIdx];

  const copy = () => {
    if (!script) return;
    navigator.clipboard.writeText(fillTemplate(script.content, owner));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-700" />
            <div>
              <p className="font-bold text-slate-900 text-sm">SMS Scripts — 4-Touch Sequence</p>
              <p className="text-xs text-slate-500">{owner?.owner_name || 'Unknown Owner'} · {owner?.phone}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        {!loading && (
          <div className="flex border-b border-slate-100">
            {templates.map((s, i) => (
              <button
                key={i}
                onClick={() => { setActiveIdx(i); setCopied(false); }}
                className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all border-b-2 ${
                  i === activeIdx
                    ? 'border-slate-900 text-slate-900 bg-slate-50'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {s.label}
                <span className={`block text-[10px] font-normal mt-0.5 ${i === activeIdx ? 'text-slate-500' : 'text-slate-300'}`}>
                  {s.tag}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading live templates…</span>
            </div>
          ) : script ? (
            <>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4 ${script.bgColor} ${script.textColor} border ${script.borderColor}`}>
                ⏱ {script.dayLabel}
              </div>

              <div className="rounded-2xl bg-slate-900 text-white text-sm leading-relaxed p-5 whitespace-pre-wrap font-mono">
                {script.content ? fillTemplate(script.content, owner) : <span className="text-slate-400 italic">No template found with name "{script.name}" — go to Admin Templates to create it.</span>}
              </div>

              <div className="flex gap-4 mt-3 text-xs text-slate-400">
                {(() => { const msg = fillTemplate(script.content, owner); return <><span>{msg.length} characters</span><span>{Math.ceil(msg.length / 160)} SMS segment{Math.ceil(msg.length / 160) > 1 ? 's' : ''}</span></>; })()}
              </div>

              <div className={`mt-4 rounded-xl px-4 py-3 text-sm border ${script.bgColor} ${script.borderColor} ${script.textColor}`}>
                <span className="font-bold">Live from:</span> <span className="font-mono">Admin Templates → {script.name}</span>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button onClick={copy} disabled={loading} className="flex-1 gap-2 bg-slate-900 hover:bg-slate-700 text-white">
            {copied ? <><CheckCheck className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy {script?.label}</>}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
        </div>
      </div>
    </div>
  );
}