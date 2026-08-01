import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Zap, ChevronDown, CheckCircle2, Mic, MicOff } from 'lucide-react';
import { appClient } from '@/api/appClient';

const GOLD = '#D4AF37';

export default function AdminCharliePanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'charlie', content: "Admin mode active. I have live access to your client pipeline, tasks, and escalations. Ask me anything or tell me what to do — I can query data, draft content, or execute operations like creating clients and tasks." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResults, setLastResults] = useState([]);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);
    setLastResults([]);

    const res = await appClient.functions.invoke('adminCharlie', { messages: newMessages });
    const { reply, results = [] } = res.data || {};

    setMessages(prev => [...prev, { role: 'charlie', content: reply || 'No response.' }]);
    setLastResults(results);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        data-charlie-toggle
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-105"
        style={{
          background: open ? '#111' : `linear-gradient(135deg, #e8c84a, ${GOLD})`,
          color: open ? GOLD : '#000',
          border: open ? `2px solid ${GOLD}` : 'none',
          boxShadow: `0 4px 24px rgba(212,175,55,0.35)`
        }}
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
        {open ? 'Close Charlie' : 'Admin Charlie'}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: '420px',
            height: '560px',
            background: '#0d0d0d',
            border: `1px solid rgba(212,175,55,0.3)`,
          }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(212,175,55,0.15)', background: '#111' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: GOLD }} />
              <div>
                <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>Charlie · Admin Mode</p>
                <p className="text-[18px]" style={{ color: '#fff' }}>Live data access · Can create & update records</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                  style={m.role === 'user'
                    ? { background: GOLD, color: '#000', fontWeight: 600 }
                    : { background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: GOLD, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Querying live data...</span>
                </div>
              </div>
            )}

            {/* Action results */}
            {lastResults.length > 0 && (
              <div className="rounded-xl px-3 py-2 space-y-1"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>Actions Executed</p>
                {lastResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" style={{ color: '#22c55e' }} />
                    <span className="text-xs text-white">
                      {r.type === 'create_client' && `Created client: ${r.name}`}
                      {r.type === 'update_client' && `Updated client record`}
                      {r.type === 'create_task' && `Created task: ${r.title}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              'Who has no agent assigned?',
              'Summarize the pipeline',
              'Draft an outreach SMS',
              'Open escalations?',
            ].map(q => (
              <button key={q} onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all hover:border-yellow-400/50"
                style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,175,55,0.2)' }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 pb-3 pt-2 flex items-end gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={listening ? 'Listening...' : 'Ask Charlie or give a command...'}
              rows={2}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              style={{
                background: listening ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${listening ? GOLD : 'rgba(212,175,55,0.3)'}`,
                lineHeight: 1.5,
                transition: 'all 0.2s'
              }}
            />
            {/* Mic button */}
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              title={listening ? 'Stop listening' : 'Speak to Charlie'}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
              style={{
                background: listening ? '#ef4444' : 'rgba(255,255,255,0.08)',
                border: listening ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: listening ? '0 0 12px rgba(239,68,68,0.5)' : 'none'
              }}>
              {listening
                ? <MicOff className="w-4 h-4 text-white" />
                : <Mic className="w-4 h-4" style={{ color: GOLD }} />
              }
            </button>
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{ background: GOLD }}>
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}