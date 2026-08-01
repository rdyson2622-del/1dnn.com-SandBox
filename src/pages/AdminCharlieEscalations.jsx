import React, { useState, useEffect, useMemo } from 'react';
import { appClient } from '@/api/appClient';
import { AlertTriangle, CheckCircle, Save, Search, Loader2, BookOpen, Clock, User, RefreshCw } from 'lucide-react';

const GOLD = '#D4AF37';

const STATUS_COLORS = {
  open: '#ef4444',
  in_progress: '#f59e0b',
  answered: '#4ade80',
  saved_to_kb: '#60a5fa',
  dismissed: '#555',
};

const PRIORITY_COLORS = {
  low: '#555',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
};

const TOPICS = ['agent_selection', 'relocation_process', 'costs_fees', 'timeline', 'city_info', 'market_data', 'our_services', 'technology', 'general', 'legal', 'other'];

export default function AdminCharlieEscalations() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('open');
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingToKB, setSavingToKB] = useState(false);
  const [kbTopic, setKbTopic] = useState('general');

  const load = async () => {
    setLoading(true);
    const data = await appClient.entities.CharlieEscalation.list('-created_date', 500);
    setEscalations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => escalations.filter(e => {
    const matchSearch = !searchTerm ||
      e.consumer_question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.consumer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  }), [escalations, searchTerm, filterStatus]);

  const selected = escalations.find(e => e.id === selectedId);
  const openCount = escalations.filter(e => e.status === 'open').length;

  const handleReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    setSaving(true);
    const user = await appClient.auth.me();
    await appClient.entities.CharlieEscalation.update(selectedId, {
      human_response: replyText,
      status: 'answered',
      responded_by: user?.email,
      responded_at: new Date().toISOString(),
    });
    setEscalations(prev => prev.map(e => e.id === selectedId ? { ...e, human_response: replyText, status: 'answered' } : e));
    setSaving(false);
  };

  const handleSaveToKB = async () => {
    if (!selected?.consumer_question || !selected?.human_response) return;
    setSavingToKB(true);
    const kb = await appClient.entities.CharlieKnowledgeBase.create({
      question: selected.consumer_question,
      answer: selected.human_response,
      topic: kbTopic,
      source: 'escalation_saved',
      is_active: true,
    });
    await appClient.entities.CharlieEscalation.update(selectedId, {
      status: 'saved_to_kb',
      saved_to_kb: true,
      kb_entry_id: kb.id,
    });
    setEscalations(prev => prev.map(e => e.id === selectedId ? { ...e, status: 'saved_to_kb', saved_to_kb: true } : e));
    setSavingToKB(false);
  };

  const handleDismiss = async (id) => {
    await appClient.entities.CharlieEscalation.update(id, { status: 'dismissed' });
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, status: 'dismissed' } : e));
    if (selectedId === id) setSelectedId(null);
  };

  const handleMarkInProgress = async (id) => {
    await appClient.entities.CharlieEscalation.update(id, { status: 'in_progress' });
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, status: 'in_progress' } : e));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0d0d', color: '#fff' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
        style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle size={20} style={{ color: openCount > 0 ? '#ef4444' : GOLD }} />
            CHARLIE ESCALATIONS
            {openCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#ef4444', color: '#fff' }}>{openCount} open</span>
            )}
          </h1>
          <p className="text-sm font-medium" style={{ color: GOLD }}>Questions Charlie couldn't answer — needs human response</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#555' }} />
            <input type="text" placeholder="Search questions..." onChange={e => setSearchTerm(e.target.value)}
              className="rounded-lg py-2 pl-9 pr-4 text-sm outline-none w-48"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="answered">Answered</option>
            <option value="saved_to_kb">Saved to KB</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <button onClick={load} className="p-2 rounded-lg hover:opacity-70" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <RefreshCw size={15} style={{ color: '#aaa' }} />
          </button>
        </div>
      </div>

      {/* Split Panel */}
      <div className="flex flex-1" style={{ height: 'calc(100vh - 80px)' }}>
        {/* List */}
        <div className="overflow-y-auto" style={{ width: '380px', minWidth: '320px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: GOLD }} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-sm space-y-4" style={{ color: '#555' }}>
              <div>No escalations found.</div>
              <div className="px-4 text-xs italic" style={{ color: '#666', borderLeft: `2px solid ${GOLD}33` }}>
                <p className="font-medium mb-1" style={{ color: '#888' }}>Example: Consumer asks "Can you help me sell my home?"</p>
                <p>→ You respond with the actual answer</p>
                <p>→ Save to KB so Charlie learns it for next time</p>
              </div>
            </div>
          ) : (
            filtered.map(esc => (
              <div key={esc.id}
                className="px-4 py-4 cursor-pointer transition-all border-b"
                style={{
                  borderColor: 'rgba(255,255,255,0.05)',
                  background: selectedId === esc.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                  borderLeft: selectedId === esc.id ? `3px solid ${GOLD}` : '3px solid transparent',
                }}
                onClick={() => { setSelectedId(esc.id); setReplyText(esc.human_response || ''); }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: '#111', color: STATUS_COLORS[esc.status], border: `1px solid ${STATUS_COLORS[esc.status]}44` }}>
                    {esc.status?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs" style={{ color: PRIORITY_COLORS[esc.priority] }}>{esc.priority}</span>
                </div>
                <p className="text-sm font-medium mb-1 line-clamp-2" style={{ color: '#fff' }}>{esc.consumer_question}</p>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#555' }}>
                  {esc.consumer_name && <span><User size={10} className="inline mr-1" />{esc.consumer_name}</span>}
                  <span><Clock size={10} className="inline mr-1" />{esc.created_date ? new Date(esc.created_date).toLocaleDateString() : '—'}</span>
                  {esc.page_context && <span>📍 {esc.page_context}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: '#444' }}>
              Select an escalation to respond
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-xl p-5" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#666' }}>Consumer Question</p>
                <p className="text-lg font-semibold" style={{ color: '#fff' }}>{selected.consumer_question}</p>
                <div className="flex gap-4 mt-3 text-xs" style={{ color: '#555' }}>
                  {selected.consumer_name && <span>👤 {selected.consumer_name}</span>}
                  {selected.consumer_email && <span>✉️ {selected.consumer_email}</span>}
                  {selected.page_context && <span>📍 {selected.page_context}</span>}
                </div>
              </div>

              {selected.handoff_response && (
                <div className="rounded-xl p-4" style={{ background: '#0d1a0d', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#4ade80' }}>Charlie said to consumer</p>
                  <p className="text-sm italic" style={{ color: '#ccc' }}>"{selected.handoff_response}"</p>
                </div>
              )}

              {selected.notifications_sent && (
                <div className="flex gap-3 text-xs">
                  {['sms', 'email', 'dashboard'].map(ch => (
                    <span key={ch} className="px-2 py-1 rounded-full"
                      style={{ background: selected.notifications_sent[ch] ? '#0d1a0d' : '#1a1a1a', color: selected.notifications_sent[ch] ? '#4ade80' : '#555', border: `1px solid ${selected.notifications_sent[ch] ? '#4ade8044' : '#333'}` }}>
                      {selected.notifications_sent[ch] ? '✓' : '✗'} {ch}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#aaa' }}>Your Response to Consumer</label>
                <textarea rows={5} value={replyText} onChange={e => setReplyText(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 outline-none resize-none text-sm"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                  placeholder="Type your response here..." />
                <div className="flex gap-3 mt-3 flex-wrap">
                  <button onClick={handleReply} disabled={saving || !replyText.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 disabled:opacity-40"
                    style={{ background: GOLD, color: '#000' }}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Mark Answered'}
                  </button>
                  {selected.status === 'open' && (
                    <button onClick={() => handleMarkInProgress(selected.id)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
                      style={{ background: '#1a1a1a', border: '1px solid #f59e0b', color: '#f59e0b' }}>
                      Mark In Progress
                    </button>
                  )}
                  <button onClick={() => handleDismiss(selected.id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#666' }}>
                    Dismiss
                  </button>
                </div>
              </div>

              {selected.human_response && !selected.saved_to_kb && (
                <div className="rounded-xl p-5" style={{ background: '#0d0d1a', border: `1px solid ${GOLD}33` }}>
                  <p className="text-sm font-bold mb-1" style={{ color: GOLD }}>🔄 Train Charlie with this answer</p>
                  <p className="text-xs mb-3" style={{ color: '#666' }}>Save this Q&A to Charlie's knowledge base so he handles it automatically next time.</p>
                  <div className="flex gap-3 items-center">
                    <select value={kbTopic} onChange={e => setKbTopic(e.target.value)}
                      className="rounded-lg px-3 py-2 text-sm outline-none flex-1"
                      style={{ background: '#111', border: '1px solid #333', color: '#fff' }}>
                      {TOPICS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                    <button onClick={handleSaveToKB} disabled={savingToKB}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 disabled:opacity-40"
                      style={{ background: GOLD, color: '#000' }}>
                      {savingToKB ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                      Save to KB
                    </button>
                  </div>
                </div>
              )}

              {selected.saved_to_kb && (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#0d1a2a', border: '1px solid #60a5fa44' }}>
                  <CheckCircle size={18} style={{ color: '#60a5fa' }} />
                  <p className="text-sm" style={{ color: '#60a5fa' }}>Saved to Charlie's Knowledge Base — he'll handle this next time.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}