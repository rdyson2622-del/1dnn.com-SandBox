import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { appClient } from '@/api/appClient';
import { Edit2, Plus, MessageSquare, Search, X, Save, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, Trash2, Square, Volume2 } from 'lucide-react';

const GOLD = '#D4AF37';

const SCRIPT_TYPE_COLORS = {
  greeting: '#4ade80',
  response: '#60a5fa',
  gate: '#f472b6',
  cta: GOLD,
  fallback: '#f87171',
  system_prompt: '#a78bfa',
};

const SCRIPT_TYPES = ['greeting', 'response', 'gate', 'cta', 'fallback', 'system_prompt'];

const EMPTY_FORM = {
  page_number: '',
  page_code: '',
  page_name: '',
  context: '',
  script_text: '',
  script_type: 'response',
  is_active: true,
  notes: '',
};

export default function AdminCharlieScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingScript, setEditingScript] = useState(null);
  const [saving, setSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedScript, setExpandedScript] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }, []);

  const speakText = useCallback(async (text, id) => {
    if (playingId === id || loadingAudioId === id) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingId(null);
      setLoadingAudioId(null);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingId(null);
    setLoadingAudioId(id);

    try {
      const res = await appClient.functions.invoke('charlieSpeak', { text });
      if (!res.data || !res.data.audio) {
        console.error('No audio returned:', res.data);
        setLoadingAudioId(null);
        return;
      }
      const { audio } = res.data;
      console.log('Audio blob size:', audio.length, 'bytes (base64)');
      
      // Use direct data URI to bypass blob/object URL issues
      const el = new Audio(`data:audio/wav;base64,${audio}`);
      audioRef.current = el;
      el.onended = () => { console.log('Playback ended'); setPlayingId(null); };
      el.onerror = (e) => { console.error('Audio error:', e.message, e.target.error); setPlayingId(null); };
      setLoadingAudioId(null);
      setPlayingId(id);
      
      console.log('Audio element created, attempting play...');
      
      // Resume AudioContext if suspended (browser autoplay policy)
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') { 
        console.log('Resuming AudioContext...');
        await audioCtx.resume(); 
      }
      
      const playPromise = el.play();
      if (playPromise) {
        playPromise.catch(err => console.error('Play failed:', err.message));
      }
    } catch (err) {
      console.error('TTS error:', err.message);
      setLoadingAudioId(null);
      setPlayingId(null);
    }
  }, [playingId, loadingAudioId]);

  const speakScript = useCallback((script, e) => {
    e.stopPropagation();
    speakText(script.script_text, script.id);
  }, [speakText]);

  const load = async () => {
    setLoading(true);
    const data = await appClient.entities.CharlieScript.list('page_number', 500);
    setScripts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => scripts.filter(s => {
    const matchSearch = !searchTerm ||
      s.page_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.page_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.script_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.context?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || s.script_type === filterType;
    return matchSearch && matchType;
  }), [scripts, searchTerm, filterType]);

  // Group by page_code
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const key = s.page_code || 'UNCODED';
      if (!map[key]) map[key] = { page_name: s.page_name || key, scripts: [] };
      map[key].scripts.push(s);
    });
    return Object.entries(map).sort((a, b) => {
      const na = a[1].scripts[0]?.page_number ?? 9999;
      const nb = b[1].scripts[0]?.page_number ?? 9999;
      return na - nb;
    });
  }, [filtered]);

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...fields } = editingScript;
    if (id) {
      await appClient.entities.CharlieScript.update(id, fields);
    } else {
      await appClient.entities.CharlieScript.create(fields);
    }
    setSaving(false);
    setEditingScript(null);
    load();
  };

  const handleToggleActive = async (script) => {
    try {
      await appClient.entities.CharlieScript.update(script.id, { is_active: !script.is_active });
      // Update local state immediately for instant visual feedback
      setScripts(prev => prev.map(s => s.id === script.id ? { ...s, is_active: !s.is_active } : s));
    } catch (err) {
      console.error('Toggle failed:', err);
      load(); // Reload on error to sync with DB
    }
  };

  const handleDelete = async (script) => {
    if (!window.confirm(`Delete "${script.page_name}"? This cannot be undone.`)) return;
    await appClient.entities.CharlieScript.delete(script.id);
    setScripts(prev => prev.filter(s => s.id !== script.id));
  };

  const toggleGroup = (key) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#fff' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
        style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare size={20} style={{ color: GOLD }} /> CHARLIE'S SCRIPTS
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#666' }}>
            {scripts.length} total · {scripts.filter(s => s.is_active).length} active · {grouped.length} page groups
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#555' }} />
            <input
              type="text"
              placeholder="Search scripts..."
              className="rounded-lg py-2 pl-9 pr-4 text-sm outline-none w-56"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
          >
            <option value="all">All Types</option>
            {SCRIPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={() => setEditingScript({ ...EMPTY_FORM })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:opacity-80"
            style={{ background: GOLD, color: '#000' }}
          >
            <Plus size={16} /> Add Script
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading scripts...</div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No scripts found.</div>
        ) : (
          <div className="space-y-3">
            {grouped.map(([pageCode, group]) => {
              const isCollapsed = collapsedGroups[pageCode];
              return (
                <div key={pageCode} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(pageCode)}
                    className="w-full flex items-center justify-between px-5 py-3 text-left transition-all hover:opacity-80"
                    style={{ background: '#1a1a1a' }}
                  >
                    <div className="flex items-center gap-3">
                      {isCollapsed ? <ChevronRight size={16} style={{ color: GOLD }} /> : <ChevronDown size={16} style={{ color: GOLD }} />}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#000', color: GOLD, border: `1px solid ${GOLD}44` }}>
                        {pageCode}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: '#fff' }}>{group.page_name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#666' }}>{group.scripts.length} script{group.scripts.length !== 1 ? 's' : ''}</span>
                  </button>

                  {/* Script Rows */}
                  {!isCollapsed && (
                    <div className="divide-y" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', divideColor: 'rgba(255,255,255,0.06)' }}>
                      {group.scripts.map(script => (
                        <div key={script.id}>
                          {/* Row */}
                          <div
                            className="px-5 py-3 flex items-start gap-3 cursor-pointer transition-all hover:bg-white/5"
                            style={{ opacity: script.is_active ? 1 : 0.5 }}
                            onClick={() => setExpandedScript(expandedScript === script.id ? null : script.id)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                                  style={{ background: '#111', color: SCRIPT_TYPE_COLORS[script.script_type] || '#aaa', border: `1px solid ${SCRIPT_TYPE_COLORS[script.script_type] || '#333'}44` }}>
                                  {script.script_type}
                                </span>
                                {script.context && <span className="text-sm font-medium" style={{ color: GOLD }}>📍 {script.context}</span>}
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: expandedScript === script.id ? '#fff' : '#bbb' }}>
                                {expandedScript === script.id ? script.script_text : (script.script_text?.length > 120 ? script.script_text.slice(0, 120) + '…' : script.script_text)}
                              </p>
                              {expandedScript === script.id && script.notes && (
                                <p className="text-xs mt-2 italic" style={{ color: '#666' }}>📝 {script.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                              {/* Hear It button */}
                              <button
                                onClick={(e) => speakScript(script, e)}
                                disabled={loadingAudioId === script.id}
                                title={playingId === script.id ? 'Stop' : 'Hear Charlie say this'}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 disabled:opacity-60"
                                style={{
                                  background: playingId === script.id ? '#ef444422' : `${GOLD}22`,
                                  border: `1px solid ${playingId === script.id ? '#ef4444' : GOLD}66`,
                                  color: playingId === script.id ? '#ef4444' : GOLD,
                                  minWidth: '72px',
                                }}
                              >
                                {loadingAudioId === script.id
                                  ? <><span className="inline-block w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading</>
                                  : playingId === script.id
                                  ? <><Square size={11} fill="currentColor" /> Stop</>
                                  : <><Volume2 size={11} /> Hear It</>}
                              </button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleActive(script); }} title={script.is_active ? 'Deactivate' : 'Activate'} style={{ pointerEvents: 'auto' }}>
                                {script.is_active
                                  ? <ToggleRight size={18} style={{ color: GOLD }} />
                                  : <ToggleLeft size={18} style={{ color: '#444' }} />}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingScript({ ...script }); }} className="hover:opacity-70">
                                <Edit2 size={14} style={{ color: '#888' }} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(script); }} className="hover:opacity-70">
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

      {/* Edit / Create Modal */}
      {editingScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: `1px solid ${GOLD}44` }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #333' }}>
              <h2 className="font-bold text-lg" style={{ color: GOLD }}>
                {editingScript.id ? 'Edit Script' : 'New Script'}
              </h2>
              <button onClick={() => setEditingScript(null)}><X size={20} style={{ color: '#aaa' }} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Page Number" value={editingScript.page_number} onChange={v => setEditingScript(p => ({ ...p, page_number: v }))} placeholder="e.g. 1" />
                <Field label="Page Code *" value={editingScript.page_code} onChange={v => setEditingScript(p => ({ ...p, page_code: v }))} placeholder="e.g. HOME" />
              </div>
              <Field label="Page Name *" value={editingScript.page_name} onChange={v => setEditingScript(p => ({ ...p, page_name: v }))} placeholder="e.g. Home Hero" />
              <Field label="Context (when triggered)" value={editingScript.context} onChange={v => setEditingScript(p => ({ ...p, context: v }))} placeholder="e.g. On page load" />
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Script Type *</label>
                <select
                  value={editingScript.script_type}
                  onChange={e => setEditingScript(p => ({ ...p, script_type: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 outline-none"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                >
                  {SCRIPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>Script Text *</label>
                <textarea
                  rows={7}
                  value={editingScript.script_text}
                  onChange={e => setEditingScript(p => ({ ...p, script_text: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 outline-none resize-none"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                  placeholder="The full script Charlie delivers..."
                />
              </div>
              <Field label="Internal Notes" value={editingScript.notes} onChange={v => setEditingScript(p => ({ ...p, notes: v }))} placeholder="Why this script exists, recent changes..." />
              <div className="flex items-center gap-3">
                <button onClick={() => setEditingScript(p => ({ ...p, is_active: !p.is_active }))}>
                  {editingScript.is_active
                    ? <ToggleRight size={24} style={{ color: GOLD }} />
                    : <ToggleLeft size={24} style={{ color: '#555' }} />}
                </button>
                <span className="text-sm" style={{ color: editingScript.is_active ? GOLD : '#666' }}>
                  {editingScript.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center px-6 py-4" style={{ borderTop: '1px solid #333' }}>
              <button
                onClick={() => editingScript.script_text && speakText(editingScript.script_text, 'modal-preview')}
                disabled={!editingScript.script_text || loadingAudioId === 'modal-preview'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: playingId === 'modal-preview' ? '#ef444422' : `${GOLD}22`, border: `1px solid ${playingId === 'modal-preview' ? '#ef4444' : GOLD}55`, color: playingId === 'modal-preview' ? '#ef4444' : GOLD }}
              >
                {loadingAudioId === 'modal-preview'
                  ? <><span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading...</>
                  : playingId === 'modal-preview'
                  ? <><Square size={15} fill="currentColor" /> Stop</>
                  : <><Volume2 size={15} /> Preview Voice</>}
              </button>
              <div className="flex gap-3">
                <button onClick={() => setEditingScript(null)} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#333', color: '#fff' }}>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editingScript.page_code || !editingScript.script_text}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-80 disabled:opacity-40"
                  style={{ background: GOLD, color: '#000' }}
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Script'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: '#aaa' }}>{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 outline-none"
        style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
      />
    </div>
  );
}