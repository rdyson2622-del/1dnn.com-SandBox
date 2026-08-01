import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { appClient } from '@/api/appClient';
import { Brain, Plus, Edit2, Trash2, Save, X, Search, Loader2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Sparkles, Volume2, Square } from 'lucide-react';

const GOLD = '#D4AF37';

const TOPICS = ['agent_selection', 'relocation_process', 'costs_fees', 'timeline', 'city_info', 'market_data', 'our_services', 'technology', 'general', 'legal', 'other'];

const TOPIC_COLORS = {
  agent_selection: '#60a5fa',
  relocation_process: '#4ade80',
  costs_fees: GOLD,
  timeline: '#f472b6',
  city_info: '#34d399',
  market_data: '#a78bfa',
  our_services: '#fb923c',
  technology: '#38bdf8',
  general: '#94a3b8',
  legal: '#f87171',
  other: '#64748b',
};

const EMPTY_FORM = { question: '', answer: '', topic: 'general', keywords: [], notes: '', is_active: true, source: 'manual' };

export default function AdminCharlieKnowledgeBase() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [collapsedTopics, setCollapsedTopics] = useState({});
  const [playingId, setPlayingId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const audioRef = useRef(null);
  const [showExtract, setShowExtract] = useState(false);
  const [docText, setDocText] = useState('');
  const [docName, setDocName] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedPairs, setExtractedPairs] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState(new Set());
  const [savingPairs, setSavingPairs] = useState(false);

  useEffect(() => () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }, []);

  const speakText = useCallback(async (text, id) => {
    if (playingId === id || loadingAudioId === id) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingId(null); setLoadingAudioId(null); return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingId(null); setLoadingAudioId(id);
    try {
      const res = await appClient.functions.invoke('charlieSpeak', { text });
      const { audio, mimeType } = res.data;
      const byteChars = atob(audio);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const el = new Audio(url);
      audioRef.current = el;
      el.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      el.onerror = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      setLoadingAudioId(null); setPlayingId(id);
      await el.play();
    } catch (err) { setLoadingAudioId(null); setPlayingId(null); }
  }, [playingId, loadingAudioId]);

  const load = async () => {
    setLoading(true);
    const data = await appClient.entities.CharlieKnowledgeBase.list('-updated_date', 1000);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => entries.filter(e => {
    const matchSearch = !searchTerm ||
      e.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTopic = filterTopic === 'all' || e.topic === filterTopic;
    return matchSearch && matchTopic;
  }), [entries, searchTerm, filterTopic]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const key = e.topic || 'other';
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...fields } = editingEntry;
    if (typeof fields.keywords === 'string') {
      fields.keywords = fields.keywords.split(',').map(k => k.trim()).filter(Boolean);
    }
    if (id) {
      await appClient.entities.CharlieKnowledgeBase.update(id, fields);
    } else {
      await appClient.entities.CharlieKnowledgeBase.create(fields);
    }
    setSaving(false);
    setEditingEntry(null);
    load();
  };

  const handleDelete = async (entry) => {
    if (!window.confirm('Delete this knowledge base entry?')) return;
    await appClient.entities.CharlieKnowledgeBase.delete(entry.id);
    setEntries(prev => prev.filter(e => e.id !== entry.id));
  };

  const handleToggle = async (entry) => {
    await appClient.entities.CharlieKnowledgeBase.update(entry.id, { is_active: !entry.is_active });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, is_active: !e.is_active } : e));
  };

  const handleExtract = async () => {
    if (!docText.trim()) return;
    setExtracting(true);
    setExtractedPairs([]);
    const res = await appClient.functions.invoke('extractKnowledgeBase', { document_text: docText, source_document: docName });
    setExtractedPairs(res.data?.pairs || []);
    setSelectedPairs(new Set((res.data?.pairs || []).map((_, i) => i)));
    setExtracting(false);
  };

  const handleSavePairs = async () => {
    setSavingPairs(true);
    const toSave = extractedPairs.filter((_, i) => selectedPairs.has(i));
    for (const pair of toSave) {
      await appClient.entities.CharlieKnowledgeBase.create({
        ...pair,
        source: 'auto_extracted',
        source_document: docName || 'Pasted document',
        is_active: true,
      });
    }
    setSavingPairs(false);
    setShowExtract(false);
    setDocText('');
    setDocName('');
    setExtractedPairs([]);
    load();
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#fff' }}>
      <div className="sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
        style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain size={20} style={{ color: GOLD }} /> CHARLIE'S KNOWLEDGE BASE
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#666' }}>
            {entries.length} entries · {entries.filter(e => e.is_active).length} active
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#555' }} />
            <input type="text" placeholder="Search questions, answers..." onChange={e => setSearchTerm(e.target.value)}
              className="rounded-lg py-2 pl-9 pr-4 text-sm outline-none w-56"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
          </div>
          <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}>
            <option value="all">All Topics</option>
            {TOPICS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <button onClick={() => setShowExtract(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:opacity-80"
            style={{ background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD }}>
            <Sparkles size={15} /> Auto-Extract
          </button>
          <button onClick={() => setEditingEntry({ ...EMPTY_FORM })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:opacity-80"
            style={{ background: GOLD, color: '#000' }}>
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: GOLD }} /></div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No entries yet. Add manually or use Auto-Extract.</div>
        ) : (
          <div className="space-y-3">
            {grouped.map(([topic, topicEntries]) => {
              const isCollapsed = collapsedTopics[topic];
              const color = TOPIC_COLORS[topic] || '#aaa';
              return (
                <div key={topic} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setCollapsedTopics(p => ({ ...p, [topic]: !p[topic] }))}
                    className="w-full flex items-center justify-between px-5 py-3 text-left hover:opacity-80"
                    style={{ background: '#1a1a1a' }}>
                    <div className="flex items-center gap-3">
                      {isCollapsed ? <ChevronRight size={16} style={{ color }} /> : <ChevronDown size={16} style={{ color }} />}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: '#000', color, border: `1px solid ${color}44` }}>
                        {topic.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#666' }}>{topicEntries.length} entr{topicEntries.length !== 1 ? 'ies' : 'y'}</span>
                  </button>
                  {!isCollapsed && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {topicEntries.map(entry => (
                        <div key={entry.id} className="px-5 py-3 border-b last:border-b-0 hover:bg-white/5 cursor-pointer transition-all"
                          style={{ borderColor: 'rgba(255,255,255,0.05)', opacity: entry.is_active ? 1 : 0.5 }}
                          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold mb-1" style={{ color: '#fff' }}>Q: {entry.question}</p>
                              {expandedId === entry.id ? (
                                <>
                                  <p className="text-sm leading-relaxed mb-2" style={{ color: '#ccc' }}>A: {entry.answer}</p>
                                  {entry.keywords?.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {entry.keywords.map((k, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#222', color: '#888', border: '1px solid #333' }}>{k}</span>
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-xs mt-2" style={{ color: '#555' }}>
                                    Source: {entry.source || 'manual'}{entry.source_document ? ` · ${entry.source_document}` : ''} · Used {entry.times_used || 0}x
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm" style={{ color: GOLD }}>
                                  {entry.answer?.length > 100 ? entry.answer.slice(0, 100) + '…' : entry.answer}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => speakText(entry.answer, entry.id)}
                                disabled={loadingAudioId === entry.id}
                                title={playingId === entry.id ? 'Stop' : 'Hear Charlie say this'}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 disabled:opacity-60"
                                style={{
                                  background: playingId === entry.id ? '#ef444422' : `${GOLD}22`,
                                  border: `1px solid ${playingId === entry.id ? '#ef4444' : GOLD}66`,
                                  color: playingId === entry.id ? '#ef4444' : GOLD,
                                  minWidth: '72px',
                                }}
                              >
                                {loadingAudioId === entry.id
                                  ? <><span className="inline-block w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading</>
                                  : playingId === entry.id
                                  ? <><Square size={11} fill="currentColor" /> Stop</>
                                  : <><Volume2 size={11} /> Hear It</>}
                              </button>
                              <button onClick={() => handleToggle(entry)}>
                                {entry.is_active ? <ToggleRight size={18} style={{ color: GOLD }} /> : <ToggleLeft size={18} style={{ color: '#444' }} />}
                              </button>
                              <button onClick={() => setEditingEntry({ ...entry, keywords: entry.keywords?.join(', ') || '' })} className="hover:opacity-70">
                                <Edit2 size={14} style={{ color: '#888' }} />
                              </button>
                              <button onClick={() => handleDelete(entry)} className="hover:opacity-70">
                                <Trash2 size={14} style={{ color: '#ef4444' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #333' }}>
              <h2 className="font-bold text-lg" style={{ color: GOLD }}>{editingEntry.id ? 'Edit Entry' : 'New Entry'}</h2>
              <button onClick={() => setEditingEntry(null)}><X size={20} style={{ color: '#aaa' }} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Consumer Question *</label>
                <input value={editingEntry.question || ''} onChange={e => setEditingEntry(p => ({ ...p, question: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 outline-none" style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                  placeholder="How does your agent selection process work?" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Charlie's Answer *</label>
                <textarea rows={5} value={editingEntry.answer || ''} onChange={e => setEditingEntry(p => ({ ...p, answer: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 outline-none resize-none" style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                  placeholder="We research 20+ agents in your destination market..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Topic *</label>
                  <select value={editingEntry.topic || 'general'} onChange={e => setEditingEntry(p => ({ ...p, topic: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 outline-none" style={{ background: '#111', border: '1px solid #333', color: '#fff' }}>
                    {TOPICS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Keywords (comma separated)</label>
                  <input value={editingEntry.keywords || ''} onChange={e => setEditingEntry(p => ({ ...p, keywords: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 outline-none" style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                    placeholder="agent, selection, vetting" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Internal Notes</label>
                <input value={editingEntry.notes || ''} onChange={e => setEditingEntry(p => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 outline-none" style={{ background: '#111', border: '1px solid #333', color: '#fff' }} />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditingEntry(p => ({ ...p, is_active: !p.is_active }))}>
                  {editingEntry.is_active ? <ToggleRight size={24} style={{ color: GOLD }} /> : <ToggleLeft size={24} style={{ color: '#555' }} />}
                </button>
                <span className="text-sm" style={{ color: editingEntry.is_active ? GOLD : '#666' }}>{editingEntry.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid #333' }}>
              <button onClick={() => setEditingEntry(null)} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#333', color: '#fff' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !editingEntry.question || !editingEntry.answer}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 disabled:opacity-40"
                style={{ background: GOLD, color: '#000' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Extract Modal */}
      {showExtract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #333' }}>
              <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: GOLD }}>
                <Sparkles size={18} /> Auto-Extract Q&A from Document
              </h2>
              <button onClick={() => { setShowExtract(false); setExtractedPairs([]); }}><X size={20} style={{ color: '#aaa' }} /></button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
              {extractedPairs.length === 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Document Name (optional)</label>
                    <input value={docName} onChange={e => setDocName(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 outline-none" style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                      placeholder="e.g. Bob's Sales Script, FAQ Document" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Paste Document / Voice Transcript / Script *</label>
                    <textarea rows={12} value={docText} onChange={e => setDocText(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 outline-none resize-none" style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                      placeholder="Paste any document, FAQ, script, or voice transcript here. Gemini will extract all Q&A pairs automatically..." />
                  </div>
                  <button onClick={handleExtract} disabled={extracting || !docText.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold hover:opacity-80 disabled:opacity-40"
                    style={{ background: GOLD, color: '#000' }}>
                    {extracting ? <><Loader2 size={16} className="animate-spin" /> Extracting...</> : <><Sparkles size={16} /> Extract Q&A Pairs</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold" style={{ color: GOLD }}>{extractedPairs.length} Q&A pairs extracted — select which to save:</p>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedPairs(new Set(extractedPairs.map((_, i) => i)))} className="text-xs px-3 py-1 rounded-full" style={{ background: '#333', color: '#fff' }}>Select All</button>
                      <button onClick={() => setSelectedPairs(new Set())} className="text-xs px-3 py-1 rounded-full" style={{ background: '#333', color: '#fff' }}>Deselect All</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {extractedPairs.map((pair, i) => (
                      <div key={i} className="rounded-xl p-4 cursor-pointer transition-all"
                        style={{ background: selectedPairs.has(i) ? '#0d1a0d' : '#111', border: `1px solid ${selectedPairs.has(i) ? '#4ade8066' : '#222'}` }}
                        onClick={() => setSelectedPairs(prev => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; })}>
                        <div className="flex items-start gap-3">
                          <input type="checkbox" checked={selectedPairs.has(i)} readOnly className="mt-1" style={{ accentColor: GOLD }} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-1" style={{ color: '#fff' }}>Q: {pair.question}</p>
                            <p className="text-xs mb-2" style={{ color: '#aaa' }}>A: {pair.answer}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: '#222', color: TOPIC_COLORS[pair.topic] || '#aaa', border: `1px solid ${(TOPIC_COLORS[pair.topic] || '#333')}44` }}>
                                {pair.topic?.replace(/_/g, ' ')}
                              </span>
                              {pair.confidence && <span className="text-xs" style={{ color: '#555' }}>Confidence: {Math.round(pair.confidence * 100)}%</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setExtractedPairs([])} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#333', color: '#fff' }}>← Back</button>
                    <button onClick={handleSavePairs} disabled={savingPairs || selectedPairs.size === 0}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm hover:opacity-80 disabled:opacity-40"
                      style={{ background: GOLD, color: '#000' }}>
                      {savingPairs ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save {selectedPairs.size} Entries</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}